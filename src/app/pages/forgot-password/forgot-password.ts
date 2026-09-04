import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword implements OnInit {
  toastService = inject(ToastService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  email = '';
  isSubmitting = false;

  resetToken: string | null = null;
  newPassword = '';
  confirmPassword = '';
  isSubmittingPassword = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.resetToken = params['token'];
      }
    });
  }
  submit() {
    if (!this.email) {
      this.toastService.error('Please enter your email address');
      return;
    }

    this.isSubmitting = true;
    
    // Mocking an API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.toastService.success('Password reset link sent to your email');
      this.email = '';
    }, 1000);
  }

  submitNewPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.toastService.error('Please fill in all fields');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastService.error('Passwords do not match');
      return;
    }

    this.isSubmittingPassword = true;
    
    // Mocking an API call for setting new password
    setTimeout(() => {
      this.isSubmittingPassword = false;
      this.toastService.success('Password reset successfully. You can now login.');
      this.router.navigate(['/login']);
    }, 1000);
  }
}
