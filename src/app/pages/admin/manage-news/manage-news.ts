import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/translate.pipe';
import { ModalComponent } from '../../../components/modal/modal';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { RichTextEditorComponent } from '../../../components/rich-text-editor/rich-text-editor.component';
import { DataService, NewsItem, CreateNewsPayload } from '../../../services/data.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent, RichTextEditorComponent, TranslatePipe],
  templateUrl: './manage-news.html',
  styleUrl: './manage-news.scss',
})
export class AdminNews implements OnInit {
  private dataService = inject(DataService);
  private toastService = inject(ToastService);

  news = signal<NewsItem[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);

  // Pagination & Filtering
  page = signal(1);
  limit = signal(10);
  total = signal(0);
  totalPages = signal(1);
  searchQuery = '';
  statusFilter = '';
  categoryFilter = '';

  // Modal State
  isModalOpen = signal(false);
  isEditing = signal(false);
  currentArticle: Partial<NewsItem> = {};
  currentPublishDateString = '';
  activeModalTab = signal<'edit' | 'preview'>('edit');

  // Delete Confirmation Modal
  isDeleteModalOpen = signal(false);
  articleToDelete: NewsItem | null = null;

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.fetchNews();
  }

  fetchNews() {
    this.isLoading.set(true);
    this.dataService
      .getAdminNews({
        page: this.page(),
        limit: this.limit(),
        search: this.searchQuery,
        category: this.categoryFilter,
        isPublished: this.statusFilter === '' ? undefined : this.statusFilter === 'published',
      })
      .subscribe({
        next: (res) => {
          this.news.set(res.data);
          this.total.set(res.total);
          this.totalPages.set(res.totalPages);
          this.page.set(res.page);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load news', err);
          this.toastService.show('Failed to load news articles', 'error');
          this.isLoading.set(false);
        },
      });
  }

  onSearchChange() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.page.set(1);
      this.fetchNews();
    }, 350);
  }

  onFilterChange() {
    this.page.set(1);
    this.fetchNews();
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
    this.fetchNews();
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.activeModalTab.set('edit');
    this.currentArticle = {
      title: '',
      slug: '',
      category: 'Aftaler & Fordele',
      summary: '',
      content: '',
      coverImage: '',
      isPublished: true,
    };
    this.currentPublishDateString = new Date().toISOString().substring(0, 10);
    this.isModalOpen.set(true);
  }

  openEditModal(article: NewsItem) {
    this.isEditing.set(true);
    this.activeModalTab.set('edit');
    this.currentArticle = { ...article };
    if (article.publishedAt) {
      try {
        this.currentPublishDateString = new Date(article.publishedAt).toISOString().substring(0, 10);
      } catch {
        this.currentPublishDateString = '';
      }
    } else {
      this.currentPublishDateString = '';
    }
    this.isModalOpen.set(true);
  }

  saveArticle() {
    if (!this.currentArticle.title || !this.currentArticle.title.trim()) {
      this.toastService.show('Please enter an article title', 'error');
      return;
    }

    if (!this.currentArticle.summary || !this.currentArticle.summary.trim()) {
      this.toastService.show('Please enter a short summary', 'error');
      return;
    }

    if (!this.currentArticle.content || !this.currentArticle.content.trim()) {
      this.toastService.show('Please enter the article content', 'error');
      return;
    }

    this.isSaving.set(true);

    const payload: CreateNewsPayload = {
      title: this.currentArticle.title.trim(),
      slug: this.currentArticle.slug?.trim() || undefined,
      category: this.currentArticle.category?.trim() || 'General',
      summary: this.currentArticle.summary.trim(),
      content: this.currentArticle.content,
      coverImage: this.currentArticle.coverImage?.trim() || undefined,
      isPublished: Boolean(this.currentArticle.isPublished),
      publishedAt: this.currentPublishDateString ? new Date(this.currentPublishDateString) : new Date(),
    };

    if (this.isEditing() && this.currentArticle.id) {
      this.dataService.updateNews(this.currentArticle.id, payload).subscribe({
        next: () => {
          this.toastService.show('News article updated successfully', 'success');
          this.isModalOpen.set(false);
          this.isSaving.set(false);
          this.fetchNews();
        },
        error: (err) => {
          console.error('Update news error', err);
          this.toastService.show(err.error?.message || 'Failed to update news article', 'error');
          this.isSaving.set(false);
        },
      });
    } else {
      this.dataService.createNews(payload).subscribe({
        next: () => {
          this.toastService.show('News article created successfully', 'success');
          this.isModalOpen.set(false);
          this.isSaving.set(false);
          this.fetchNews();
        },
        error: (err) => {
          console.error('Create news error', err);
          this.toastService.show(err.error?.message || 'Failed to create news article', 'error');
          this.isSaving.set(false);
        },
      });
    }
  }

  confirmDelete(article: NewsItem) {
    this.articleToDelete = article;
    this.isDeleteModalOpen.set(true);
  }

  deleteConfirmed() {
    if (!this.articleToDelete) return;
    this.dataService.deleteNews(this.articleToDelete.id).subscribe({
      next: () => {
        this.toastService.show('News article deleted', 'success');
        this.isDeleteModalOpen.set(false);
        this.articleToDelete = null;
        this.fetchNews();
      },
      error: (err) => {
        console.error('Delete news error', err);
        this.toastService.show('Failed to delete article', 'error');
      },
    });
  }

  togglePublish(article: NewsItem, event: MouseEvent) {
    event.stopPropagation();
    const newStatus = !article.isPublished;
    this.dataService
      .updateNews(article.id, {
        isPublished: newStatus,
        publishedAt: newStatus && !article.publishedAt ? new Date() : article.publishedAt,
      })
      .subscribe({
        next: (updated) => {
          article.isPublished = updated.isPublished;
          article.publishedAt = updated.publishedAt;
          this.toastService.show(
            newStatus ? 'Article published' : 'Article unpublished (moved to draft)',
            'success',
          );
          this.fetchNews();
        },
        error: (err) => {
          console.error('Toggle status error', err);
          this.toastService.show('Failed to update status', 'error');
        },
      });
  }
}

