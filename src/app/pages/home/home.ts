import { TranslatePipe } from '../../core/translate.pipe';
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ModalComponent } from '../../components/modal/modal';
import { createApiState } from '../../core/api-state';
import { map, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ModalComponent, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit, OnDestroy {
  dataService = inject(DataService);
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  toastService = inject(ToastService);

  eventsState = createApiState<any[]>([]);
  pastEvents: any[] = [];
  
  reviews = signal<any[]>([]);
  isLoadingReviews = signal(true);
  loadingReviewsError = signal(false);

  // Modal State
  isReviewModalOpen = signal(false);
  isSubmittingReview = signal(false);
  reviewForm = { rating: 5, comment: '' };
  isEditMode = signal(false);
  myReviewId: string | null = null;
  expandedReviews = signal<{ [key: string]: boolean }>({});
  private querySub?: Subscription;

  ngOnInit() {
    this.fetchEvents();
    this.fetchReviews();
    
    // Check if we returned from login to write a review
    this.querySub = this.route.queryParams.subscribe(params => {
      if (params['action'] === 'review' && this.authService.isLoggedIn()) {
        this.openReviewModal();
        // clear query param
        this.router.navigate([], { queryParams: { action: null }, queryParamsHandling: 'merge', replaceUrl: true });
      }
    });
  }

  ngOnDestroy() {
    this.querySub?.unsubscribe();
  }

  fetchEvents() {
    this.eventsState.execute(
      this.dataService.getEvents().pipe(
        map(events => {
          const published = events.filter(e => e.status === 'Published');
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          this.pastEvents = published.filter(e => {
            if (!e.date) return false;
            const eventDate = new Date(e.date);
            eventDate.setHours(0,0,0,0);
            return eventDate < today;
          }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

          return published;
        })
      )
    );
  }

  fetchReviews() {
    this.isLoadingReviews.set(true);
    this.loadingReviewsError.set(false);
    this.dataService.getReviews(6).subscribe({
      next: (data) => {
        this.reviews.set(data || []);
        this.isLoadingReviews.set(false);
      },
      error: (err) => {
        this.loadingReviewsError.set(true);
        this.isLoadingReviews.set(false);
        console.error(err);
      }
    });
  }

  toggleReviewExpansion(reviewId: string) {
    this.expandedReviews.update(map => ({
      ...map,
      [reviewId]: !map[reviewId]
    }));
  }

  handleLeaveReviewClick() {
    if (!this.authService.isLoggedIn()) {
      // Redirect to login with returnUrl
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/', action: 'review' } });
      return;
    }
    this.openReviewModal();
  }

  openReviewModal() {
    this.isReviewModalOpen.set(true);
    this.isSubmittingReview.set(true); // Temporary loading state while checking
    
    this.dataService.getMyReview().subscribe({
      next: (myReview) => {
        this.isSubmittingReview.set(false);
        if (myReview && myReview.id) {
          this.isEditMode.set(true);
          this.myReviewId = myReview.id;
          this.reviewForm.rating = myReview.rating;
          this.reviewForm.comment = myReview.comment;
        } else {
          this.isEditMode.set(false);
          this.myReviewId = null;
          this.reviewForm = { rating: 5, comment: '' };
        }
      },
      error: () => {
        this.isSubmittingReview.set(false);
        this.toastService.error('Failed to fetch your review status');
        this.closeReviewModal();
      }
    });
  }

  closeReviewModal() {
    this.isReviewModalOpen.set(false);
  }

  setRating(rating: number) {
    this.reviewForm.rating = rating;
  }

  submitReview() {
    if (!this.reviewForm.comment || this.reviewForm.comment.trim().length < 10) {
      this.toastService.error('Please provide a comment of at least 10 characters.');
      return;
    }
    
    this.isSubmittingReview.set(true);
    
    const request = this.isEditMode() 
      ? this.dataService.updateReview(this.reviewForm)
      : this.dataService.submitReview(this.reviewForm);
      
    request.subscribe({
      next: () => {
        this.isSubmittingReview.set(false);
        this.toastService.success(this.isEditMode() ? 'Review updated successfully' : 'Review submitted successfully');
        this.closeReviewModal();
        this.fetchReviews(); // Refresh reviews
      },
      error: (err) => {
        this.isSubmittingReview.set(false);
        this.toastService.error(err.error?.message || 'Failed to submit review');
      }
    });
  }
}

