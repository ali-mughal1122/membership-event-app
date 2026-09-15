import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../components/modal/modal';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { DataService, Category, CategoryUrgency } from '../../../services/data.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent],
  templateUrl: './categories.html',
  styleUrl: './categories.scss'
})
export class AdminCategories implements OnInit {
  dataService = inject(DataService);
  toastService = inject(ToastService);

  categories = signal<Category[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  isDeleting = signal(false);

  isFormModalOpen = signal(false);
  isViewModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  isEditing = signal(false);

  currentCategory: Partial<Category> = {};
  viewedCategory: Category | null = null;
  categoryToDelete: Category | null = null;

  searchQuery = '';
  urgencyFilter = '';
  page = signal(1);
  limit = signal(10);
  total = signal(0);
  totalPages = signal(1);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  readonly urgencyOptions: { value: CategoryUrgency; label: string; hint: string }[] = [
    { value: 'CRITICAL', label: 'Critical', hint: 'Must be handled first' },
    { value: 'HIGH', label: 'High', hint: 'Handle quickly' },
    { value: 'MEDIUM', label: 'Medium', hint: 'Normal priority' },
    { value: 'LOW', label: 'Low', hint: 'Can be handled later' },
  ];

  ngOnInit() {
    this.fetchCategories();
  }

  fetchCategories() {
    this.isLoading.set(true);
    this.dataService.getCategories({
      page: this.page(),
      limit: this.limit(),
      search: this.searchQuery,
      status: this.urgencyFilter,
    }).subscribe({
      next: (res) => {
        this.categories.set(res.data || []);
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
      this.fetchCategories();
    }, 350);
  }

  onFilterChange() {
    this.page.set(1);
    this.fetchCategories();
  }

  onPageChange(page: number) {
    this.page.set(page);
    this.fetchCategories();
  }

  onLimitChange(limit: number) {
    this.limit.set(limit);
    this.page.set(1);
    this.fetchCategories();
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.currentCategory = { name: '', description: '', urgency: 'MEDIUM' };
    this.isFormModalOpen.set(true);
  }

  openEditModal(category: Category) {
    this.isEditing.set(true);
    this.currentCategory = { ...category };
    this.isFormModalOpen.set(true);
  }

  openViewModal(category: Category) {
    this.viewedCategory = category;
    this.isViewModalOpen.set(true);
  }

  openDeleteModal(category: Category) {
    this.categoryToDelete = category;
    this.isDeleteModalOpen.set(true);
  }

  handleSave() {
    const name = this.currentCategory.name?.trim();
    const description = this.currentCategory.description?.trim();
    const urgency = this.currentCategory.urgency;

    if (!name || !description || !urgency) {
      this.toastService.error('Name, description, and urgency are required.');
      return;
    }

    const payload = { name, description, urgency };
    this.isSaving.set(true);

    const request = this.isEditing() && this.currentCategory.id
      ? this.dataService.updateCategory(this.currentCategory.id, payload)
      : this.dataService.addCategory(payload);

    request.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isFormModalOpen.set(false);
        this.toastService.success(this.isEditing() ? 'Category updated.' : 'Category created.');
        this.fetchCategories();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toastService.error(err.error?.message || 'Failed to save category.');
      }
    });
  }

  confirmDelete() {
    const id = this.categoryToDelete?.id;
    if (!id) return;

    this.isDeleting.set(true);
    this.dataService.deleteCategory(id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.categoryToDelete = null;
        this.toastService.success('Category deleted.');
        if (this.categories().length === 1 && this.page() > 1) {
          this.page.update(page => page - 1);
        }
        this.fetchCategories();
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.toastService.error(err.error?.message || 'Failed to delete category.');
      }
    });
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

  urgencyHint(urgency?: string) {
    return this.urgencyOptions.find(option => option.value === urgency)?.hint || '';
  }

  urgencyBadgeClass(urgency?: string) {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30';
      case 'HIGH': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30';
      case 'LOW': return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/15';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  formatDate(value?: string) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString();
  }
}
