import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ModalComponent } from '../../components/modal/modal';
import { createApiState } from '../../core/api-state';
import { map } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ModalComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  dataService = inject(DataService);
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  toastService = inject(ToastService);
  cdr = inject(ChangeDetectorRef);

  eventsState = createApiState<any[]>([]);
  pastEvents: any[] = [];
  
  reviews: any[] = [];
  isLoadingReviews = true;
  loadingReviewsError = false;

  // Modal State
  isReviewModalOpen = false;
  isSubmittingReview = false;
  reviewForm = { rating: 5, comment: '' };
  isEditMode = false;
  myReviewId: string | null = null;
  expandedReviews: { [key: string]: boolean } = {};

  ngOnInit() {
    this.fetchEvents();
    this.fetchReviews();
    
    // Check if we returned from login to write a review
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'review' && this.authService.isLoggedIn()) {
        this.openReviewModal();
        // clear query param
        this.router.navigate([], { queryParams: { action: null }, queryParamsHandling: 'merge', replaceUrl: true });
      }
    });
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
    this.isLoadingReviews = true;
    this.loadingReviewsError = false;
    this.dataService.getReviews(6).subscribe({
      next: (data) => {
        this.reviews = data;
        this.isLoadingReviews = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingReviewsError = true;
        this.isLoadingReviews = false;
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  toggleReviewExpansion(reviewId: string) {
    this.expandedReviews[reviewId] = !this.expandedReviews[reviewId];
    this.cdr.detectChanges();
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
    this.isReviewModalOpen = true;
    this.isSubmittingReview = true; // Temporary loading state while checking
    this.cdr.detectChanges();
    
    this.dataService.getMyReview().subscribe({
      next: (myReview) => {
        this.isSubmittingReview = false;
        if (myReview && myReview.id) {
          this.isEditMode = true;
          this.myReviewId = myReview.id;
          this.reviewForm.rating = myReview.rating;
          this.reviewForm.comment = myReview.comment;
        } else {
          this.isEditMode = false;
          this.myReviewId = null;
          this.reviewForm = { rating: 5, comment: '' };
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSubmittingReview = false;
        this.toastService.error('Failed to fetch your review status');
        this.closeReviewModal();
      }
    });
  }

  closeReviewModal() {
    this.isReviewModalOpen = false;
    this.cdr.detectChanges();
  }

  setRating(rating: number) {
    this.reviewForm.rating = rating;
    this.cdr.detectChanges();
  }

  submitReview() {
    if (!this.reviewForm.comment || this.reviewForm.comment.trim().length < 10) {
      this.toastService.error('Please provide a comment of at least 10 characters.');
      return;
    }
    
    this.isSubmittingReview = true;
    this.cdr.detectChanges();
    
    const request = this.isEditMode 
      ? this.dataService.updateReview(this.reviewForm)
      : this.dataService.submitReview(this.reviewForm);
      
    request.subscribe({
      next: () => {
        this.isSubmittingReview = false;
        this.toastService.success(this.isEditMode ? 'Review updated successfully' : 'Review submitted successfully');
        this.closeReviewModal();
        this.fetchReviews(); // Refresh reviews
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSubmittingReview = false;
        this.toastService.error(err.error?.message || 'Failed to submit review');
        this.cdr.detectChanges();
      }
    });
  }
}

