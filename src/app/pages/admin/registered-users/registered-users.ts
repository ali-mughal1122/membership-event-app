import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, AppUser } from '../../../services/data.service';
import { PaginationComponent } from '../../../components/pagination/pagination';

@Component({
  selector: 'app-admin-registered-users',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './registered-users.html',
  styleUrl: './registered-users.scss'
})
export class AdminRegisteredUsers implements OnInit {
  dataService = inject(DataService);

  users = signal<AppUser[]>([]);
  isLoading = signal(false);
  searchQuery = '';
  deletingId = signal<string | null>(null);
  page = signal(1);
  limit = signal(10);
  total = signal(0);
  totalPages = signal(1);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading.set(true);
    this.dataService.getUsers({
      page: this.page(),
      limit: this.limit(),
      search: this.searchQuery,
    }).subscribe({
      next: (res) => {
        this.users.set(res.data);
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
      this.fetchUsers();
    }, 350);
  }

  onPageChange(page: number) {
    this.page.set(page);
    this.fetchUsers();
  }

  onLimitChange(limit: number) {
    this.limit.set(limit);
    this.page.set(1);
    this.fetchUsers();
  }

  membershipLabel(status?: string) {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'EXPIRED': return 'Expired';
      case 'PENDING': return 'Pending';
      case 'NONE': return 'None';
      default: return status || 'None';
    }
  }

  membershipBadgeClass(status?: string) {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'EXPIRED': return 'bg-red-100 text-red-700 border-red-200';
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  }

  deleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.deletingId.set(id);
    this.dataService.deleteUser(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        if (this.users().length === 1 && this.page() > 1) {
          this.page.update(page => page - 1);
        }
        this.fetchUsers();
      },
      error: () => this.deletingId.set(null)
    });
  }
}
