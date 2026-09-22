import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

type VerifyState = 'loading' | 'success' | 'already-verified' | 'error' | 'no-token';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
})
export class VerifyEmail implements OnInit {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  route = inject(ActivatedRoute);

  state: VerifyState = 'loading';
  token = '';
  statusMessage = '';
  errorMessage = '';

  // Resend form
  resendEmail = '';
  isResending = false;
  resendSuccess = false;
  resendMessage = '';

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = (params['token'] || '').trim();

      if (!this.token) {
        this.state = 'no-token';
        this.errorMessage =
          'No verification token was found. Please check your verification link or request a new one below.';
        return;
      }

      this.verifyToken(this.token);
    });
  }

  verifyToken(token: string) {
    this.state = 'loading';
    this.errorMessage = '';

    this.authService.verifyEmail(token).subscribe({
      next: (res: any) => {
        if (res.alreadyVerified) {
          this.state = 'already-verified';
          this.statusMessage =
            res.message || 'Your email address is already verified. You can log in directly.';
        } else {
          this.state = 'success';
          this.statusMessage =
            res.message || 'Email verified successfully! You can now log in to your account.';
        }
      },
      error: (err) => {
        this.state = 'error';
        this.errorMessage =
          err.error?.message ||
          'This verification link is invalid, has expired, or has already been used.';
      },
    });
  }

  onResend() {
    const email = (this.resendEmail || '').trim().toLowerCase();
    if (!email) {
      this.toastService.error('Please enter your email address.');
      return;
    }

    this.isResending = true;
    this.resendMessage = '';

    this.authService.resendVerification(email).subscribe({
      next: (res: any) => {
        this.isResending = false;
        this.resendSuccess = true;
        this.resendMessage =
          res.message || 'A new verification link has been sent to your email address.';
        this.toastService.success(this.resendMessage);
      },
      error: (err) => {
        this.isResending = false;
        const msg = err.error?.message || 'Failed to send verification email. Please try again.';
        this.toastService.error(msg);
      },
    });
  }
}
