import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { Category, CategoryUrgency, DataService, SupportConversation } from '../../../services/data.service';

@Component({
  selector: 'app-admin-support-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  templateUrl: './support-messages.html',
  styleUrl: './support-messages.scss'
})
export class AdminSupportMessages implements OnInit {
  dataService = inject(DataService);

  conversations = signal<SupportConversation[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(false);

  searchQuery = '';
  categoryFilter = '';
  urgencyFilter = '';
  statusFilter = '';
  page = signal(1);
  limit = signal(10);
  total = signal(0);
  totalPages = signal(1);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.dataService.getCategoryOptions().subscribe({
      next: (categories) => this.categories.set(categories || []),
      error: () => {}
    });
    this.fetchConversations();
  }

  fetchConversations() {
    this.isLoading.set(true);
    this.dataService.getSupportConversations({
      page: this.page(),
      limit: this.limit(),
      search: this.searchQuery,
      status: this.statusFilter,
      categoryId: this.categoryFilter,
      urgency: this.urgencyFilter,
    }).subscribe({
      next: (res) => {
        this.conversations.set(res.data || []);
        this.total.set(res.total);
        this.totalPages.set(res.totalPages);
        this.page.set(res.page);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearchChange() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.page.set(1);
      this.fetchConversations();
    }, 350);
  }

  onFilterChange() {
    this.page.set(1);
    this.fetchConversations();
  }

  onPageChange(page: number) {
    this.page.set(page);
    this.fetchConversations();
  }

  onLimitChange(limit: number) {
    this.limit.set(limit);
    this.page.set(1);
    this.fetchConversations();
  }

  urgencyLabel(urgency?: string) {
    switch (urgency) {
      case 'CRITICAL': return 'Critical';
      case 'HIGH': return 'High';
      case 'MEDIUM': return 'Medium';
      case 'LOW': return 'Low';
      default: return urgency || '';
    }
  }

  urgencyBadgeClass(urgency?: CategoryUrgency | string) {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30';
      case 'HIGH': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30';
      case 'LOW': return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/15';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  formatDateTime(value?: string) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
  }
}
