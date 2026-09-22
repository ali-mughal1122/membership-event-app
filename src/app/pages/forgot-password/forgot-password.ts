import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  authService = inject(AuthService);
  toastService = inject(ToastService);

  email = '';
  isSubmitting = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  submit() {
    this.errorMessage = '';
    const cleanEmail = (this.email || '').trim().toLowerCase();

    if (!cleanEmail) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.isSubmitting = true;

    this.authService.forgotPassword(cleanEmail).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.submitted = true;
        this.successMessage =
          res.message ||
          'If an account exists with this email, you will receive a password reset link shortly.';
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage =
          err.error?.message || 'Failed to request password reset. Please try again.';
      },
    });
  }

  resetForm() {
    this.submitted = false;
    this.email = '';
    this.errorMessage = '';
    this.successMessage = '';
  }
}
