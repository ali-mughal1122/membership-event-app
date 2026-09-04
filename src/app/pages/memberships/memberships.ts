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
  imports: [CommonModule, FormsModule, ModalComponent],
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
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (this.selectedPlan?.durationMonths || 1));
    
    this.http.post(AppEndpointsMapping.GetAllMembers, {
      userId: userId,
      planId: this.selectedPlan?.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'ACTIVE'
    }).subscribe({
      next: () => {
        this.isSubscribeModalOpen.set(false);
        this.toastService.success('Successfully subscribed!');
        this.router.navigate(['/events']);
      },
      error: (err) => {
        this.toastService.error('Failed to activate subscription: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  submitSubscription() {
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
    this.authService.register(this.registerData).subscribe({
      next: (res: any) => {
        this.authService.setToken(res.access_token);
        this.createMembershipRecord(res.user.id);
      },
      error: (err) => {
        this.toastService.error('Failed to sign up: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }
}
