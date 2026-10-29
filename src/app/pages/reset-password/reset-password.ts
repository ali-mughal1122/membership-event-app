import { TranslatePipe } from '../../core/translate.pipe';
import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit, OnDestroy {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  token = '';
  newPassword = '';
  confirmPassword = '';

  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  isLoading = signal(false);
  isSuccess = signal(false);
  errorMessage = signal('');
  private querySub?: Subscription;

  ngOnInit() {
    this.querySub = this.route.queryParams.subscribe((params) => {
      this.token = (params['token'] || '').trim();
      if (!this.token) {
        this.errorMessage.set(
          'No password reset token was provided. Please check the link from your email or request a new one.'
        );
      }
    });
  }

  ngOnDestroy() {
    this.querySub?.unsubscribe();
  }

  toggleShowNewPassword() {
    this.showNewPassword.update(v => !v);
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword.update(v => !v);
  }

  get passwordLengthValid(): boolean {
    return (this.newPassword || '').length >= 8;
  }

  get passwordUpperValid(): boolean {
    return /[A-Z]/.test(this.newPassword || '');
  }

  get passwordLowerValid(): boolean {
    return /[a-z]/.test(this.newPassword || '');
  }

  get passwordNumberValid(): boolean {
    return /\d/.test(this.newPassword || '');
  }

  get passwordSpecialValid(): boolean {
    return /[@$!%*?&#^]/.test(this.newPassword || '');
  }

  get passwordNoSpacesValid(): boolean {
    const pwd = this.newPassword || '';
    return pwd.length > 0 && !/\s/.test(pwd);
  }

  get passwordsMatchValid(): boolean {
    return (
      (this.newPassword || '').length > 0 &&
      this.newPassword === this.confirmPassword
    );
  }

  get isFormValid(): boolean {
    return (
      this.passwordLengthValid &&
      this.passwordUpperValid &&
      this.passwordLowerValid &&
      this.passwordNumberValid &&
      this.passwordSpecialValid &&
      this.passwordNoSpacesValid &&
      this.passwordsMatchValid
    );
  }

  submit() {
    if (!this.token) {
      this.errorMessage.set('A valid reset token is required.');
      return;
    }

    if (!this.isFormValid) {
      this.errorMessage.set(
        'Please make sure your password meets all requirements and that both fields match.'
      );
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService
      .resetPassword({
        token: this.token,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: (res: any) => {
          this.isLoading.set(false);
          this.isSuccess.set(true);
          this.toastService.success(
            res.message || 'Password reset successfully! You can now log in.',
          );
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            err.error?.message ||
            'Failed to reset password. This link may have expired or already been used.'
          );
        },
      });
  }
}
