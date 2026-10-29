import { TranslatePipe } from '../../core/translate.pipe';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Plan } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { createApiState } from '../../core/api-state';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../components/modal/modal';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { HttpRequest } from '../../core/http-request.service';
import { AppEndpointsMapping } from '../../core/endpoints';

@Component({
  selector: 'app-memberships',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, TranslatePipe],
  templateUrl: './memberships.html',
  styleUrl: './memberships.scss'
})
export class Memberships implements OnInit {
  dataService = inject(DataService);
  authService = inject(AuthService);
  router = inject(Router);
  http = inject(HttpRequest);
  toastService = inject(ToastService);
  
  plansState = createApiState<Plan[]>([]);
  
  isSubscribeModalOpen = signal(false);
  isSubmitting = signal(false);
  selectedPlan: Plan | null = null;
  
  registerData = {
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  };

  ngOnInit() {
    this.plansState.execute(this.dataService.getPlans());
  }
  
  openSubscribeModal(plan: Plan) {
    this.selectedPlan = plan;
    this.isSubscribeModalOpen.set(true);
    if (!this.authService.isLoggedIn()) {
      this.registerData = { name: '', email: '', password: '', phone: '', address: '' };
    }
  }

  closeSubscribeModal() {
    this.isSubscribeModalOpen.set(false);
  }
  
  private createMembershipRecord(userId: string) {
    if (!this.selectedPlan?.id) return;
    
    this.isSubmitting.set(true);
    this.http.post(AppEndpointsMapping.SubscribeToPlan, {
      planId: this.selectedPlan.id,
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isSubscribeModalOpen.set(false);
        this.toastService.success('Successfully subscribed!');
        this.router.navigate(['/events']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastService.error('Failed to activate subscription: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  submitSubscription() {
    if (this.isSubmitting()) return;

    if (this.authService.isLoggedIn()) {
      const userId = this.authService.getUserId();
      if (userId) {
        this.createMembershipRecord(userId);
      } else {
        this.toastService.error('User session is invalid. Please log in again.');
      }
      return;
    }

    // Otherwise, register first
    this.isSubmitting.set(true);
    this.authService.register(this.registerData).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        this.isSubscribeModalOpen.set(false);
        this.toastService.success(
          res.message ||
            'Registration successful! Please check your email to verify your account, then sign in to complete your subscription.',
        );
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/memberships' } });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.toastService.error('Failed to sign up: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }
}
