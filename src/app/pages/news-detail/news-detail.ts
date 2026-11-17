import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslatePipe } from '../../core/translate.pipe';
import { DataService, NewsItem } from '../../services/data.service';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './news-detail.html',
  styleUrl: './news-detail.scss',
})
export class NewsDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);

  article = signal<NewsItem | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.fetchArticle(slug);
      }
    });
  }

  fetchArticle(slug: string) {
    this.isLoading.set(true);
    this.error.set(null);
    this.dataService.getNewsBySlug(slug).subscribe({
      next: (item) => {
        this.article.set(item);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load article', err);
        this.error.set('Article not found');
        this.isLoading.set(false);
      },
    });
  }

  shareArticle() {
    if (navigator.share && this.article()) {
      navigator.share({
        title: this.article()?.title,
        text: this.article()?.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }
}

