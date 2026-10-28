import { Component, inject, signal } from '@angular/core';
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
  isSubmitting = signal(false);
  submitted = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  submit() {
    this.errorMessage.set('');
    const cleanEmail = (this.email || '').trim().toLowerCase();

    if (!cleanEmail) {
      this.errorMessage.set('Please enter your email address.');
      return;
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      this.errorMessage.set('Please enter a valid email address.');
      return;
    }

    this.isSubmitting.set(true);

    this.authService.forgotPassword(cleanEmail).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        this.submitted.set(true);
        this.successMessage.set(
          res.message ||
          'If an account exists with this email, you will receive a password reset link shortly.'
        );
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(
          err.error?.message || 'Failed to request password reset. Please try again.'
        );
      },
    });
  }

  resetForm() {
    this.submitted.set(false);
    this.email = '';
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
