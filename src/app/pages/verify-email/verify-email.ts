import { TranslatePipe } from '../../core/translate.pipe';
import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';

type VerifyState = 'loading' | 'success' | 'already-verified' | 'error' | 'no-token';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
})
export class VerifyEmail implements OnInit, OnDestroy {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  route = inject(ActivatedRoute);

  state = signal<VerifyState>('loading');
  token = '';
  statusMessage = signal('');
  errorMessage = signal('');

  // Resend form
  resendEmail = '';
  isResending = signal(false);
  resendSuccess = signal(false);
  resendMessage = signal('');
  private querySub?: Subscription;

  ngOnInit() {
    this.querySub = this.route.queryParams.subscribe((params) => {
      this.token = (params['token'] || '').trim();

      if (!this.token) {
        this.state.set('no-token');
        this.errorMessage.set(
          'No verification token was found. Please check your verification link or request a new one below.'
        );
        return;
      }

      this.verifyToken(this.token);
    });
  }

  ngOnDestroy() {
    this.querySub?.unsubscribe();
  }

  verifyToken(token: string) {
    this.state.set('loading');
    this.errorMessage.set('');

    this.authService.verifyEmail(token).subscribe({
      next: (res: any) => {
        if (res.alreadyVerified) {
          this.state.set('already-verified');
          this.statusMessage.set(
            res.message || 'Your email address is already verified. You can log in directly.'
          );
        } else {
          this.state.set('success');
          this.statusMessage.set(
            res.message || 'Email verified successfully! You can now log in to your account.'
          );
        }
      },
      error: (err) => {
        this.state.set('error');
        this.errorMessage.set(
          err.error?.message ||
          'This verification link is invalid, has expired, or has already been used.'
        );
      },
    });
  }

  onResend() {
    const email = (this.resendEmail || '').trim().toLowerCase();
    if (!email) {
      this.toastService.error('Please enter your email address.');
      return;
    }

    this.isResending.set(true);
    this.resendMessage.set('');

    this.authService.resendVerification(email).subscribe({
      next: (res: any) => {
        this.isResending.set(false);
        this.resendSuccess.set(true);
        this.resendMessage.set(
          res.message || 'A new verification link has been sent to your email address.'
        );
        this.toastService.success(this.resendMessage());
      },
      error: (err) => {
        this.isResending.set(false);
        const msg = err.error?.message || 'Failed to send verification email. Please try again.';
        this.toastService.error(msg);
      },
    });
  }
}
