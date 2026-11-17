import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../core/translate.pipe';
import { PaginationComponent } from '../../components/pagination/pagination';
import { DataService, NewsItem } from '../../services/data.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe, PaginationComponent],
  templateUrl: './news.html',
  styleUrl: './news.scss',
})
export class NewsPage implements OnInit {
  private dataService = inject(DataService);

  newsList = signal<NewsItem[]>([]);
  isLoading = signal(true);
  selectedCategory = signal<string>('all');
  searchQuery = '';

  page = signal(1);
  limit = signal(10);
  total = signal(0);
  totalPages = signal(1);

  categories = [
    { key: 'all', labelKey: 'news.all_categories' },
    { key: 'Aftaler & Fordele', label: 'Aftaler & Fordele' },
    { key: 'Regulering', label: 'Regulering' },
    { key: 'Forsikring', label: 'Forsikring' },
    { key: 'Begivenheder', label: 'Begivenheder' },
  ];

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.fetchNews();
  }

  fetchNews() {
    this.isLoading.set(true);
    this.dataService
      .getPublishedNews({
        page: this.page(),
        limit: this.limit(),
        category: this.selectedCategory() === 'all' ? undefined : this.selectedCategory(),
        search: this.searchQuery,
      })
      .subscribe({
        next: (res) => {
          this.newsList.set(res.data);
          this.total.set(res.total);
          this.totalPages.set(res.totalPages);
          this.page.set(res.page);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load published news', err);
          this.isLoading.set(false);
        },
      });
  }

  setCategory(categoryKey: string) {
    if (this.selectedCategory() === categoryKey) return;
    this.selectedCategory.set(categoryKey);
    this.page.set(1);
    this.fetchNews();
  }

  onSearchChange() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.page.set(1);
      this.fetchNews();
    }, 350);
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
    this.fetchNews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onLimitChange(newLimit: number) {
    this.limit.set(newLimit);
    this.page.set(1);
    this.fetchNews();
  }
}

