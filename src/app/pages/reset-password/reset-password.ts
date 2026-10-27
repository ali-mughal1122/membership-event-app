import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

  showNewPassword = false;
  showConfirmPassword = false;

  isLoading = false;
  isSuccess = false;
  errorMessage = '';
  private querySub?: Subscription;

  ngOnInit() {
    this.querySub = this.route.queryParams.subscribe((params) => {
      this.token = (params['token'] || '').trim();
      if (!this.token) {
        this.errorMessage =
          'No password reset token was provided. Please check the link from your email or request a new one.';
      }
    });
  }

  ngOnDestroy() {
    this.querySub?.unsubscribe();
  }

  toggleShowNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
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
      this.errorMessage = 'A valid reset token is required.';
      return;
    }

    if (!this.isFormValid) {
      this.errorMessage =
        'Please make sure your password meets all requirements and that both fields match.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService
      .resetPassword({
        token: this.token,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.isSuccess = true;
          this.toastService.success(
            res.message || 'Password reset successfully! You can now log in.',
          );
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage =
            err.error?.message ||
            'Failed to reset password. This link may have expired or already been used.';
        },
      });
  }
}
