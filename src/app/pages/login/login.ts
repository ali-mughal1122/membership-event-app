import { TranslatePipe } from '../../core/translate.pipe';
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  isSignupMode = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  showPassword = signal(false);
  isUnverified = signal(false);
  unverifiedEmail = signal('');
  isResending = signal(false);

  loginData = { email: '', password: '' };
  registerData = { name: '', email: '', password: '', phone: '', address: '' };

  toggleMode() {
    this.isSignupMode.update(v => !v);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isUnverified.set(false);
  }

  toggleShowPassword() {
    this.showPassword.update(v => !v);
  }

  // Live password requirement checks for registration
  get passwordLengthValid(): boolean {
    return (this.registerData.password || '').length >= 8;
  }

  get passwordUpperValid(): boolean {
    return /[A-Z]/.test(this.registerData.password || '');
  }

  get passwordLowerValid(): boolean {
    return /[a-z]/.test(this.registerData.password || '');
  }

  get passwordNumberValid(): boolean {
    return /\d/.test(this.registerData.password || '');
  }

  get passwordSpecialValid(): boolean {
    return /[@$!%*?&#^]/.test(this.registerData.password || '');
  }

  get passwordNoSpacesValid(): boolean {
    const pwd = this.registerData.password || '';
    return pwd.length > 0 && !/\s/.test(pwd);
  }

  get isRegisterPasswordValid(): boolean {
    return (
      this.passwordLengthValid &&
      this.passwordUpperValid &&
      this.passwordLowerValid &&
      this.passwordNumberValid &&
      this.passwordSpecialValid &&
      this.passwordNoSpacesValid
    );
  }

  onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isUnverified.set(false);

    if (this.isSignupMode()) {
      if (!this.isRegisterPasswordValid) {
        this.isLoading.set(false);
        this.errorMessage.set('Please ensure your password meets all requirements.');
        return;
      }

      this.authService.register(this.registerData).subscribe({
        next: (res: any) => {
          this.isLoading.set(false);
          this.isSignupMode.set(false);
          this.successMessage.set(
            res.message ||
            'Registration successful! We have sent a verification link to your email. Please verify your email before signing in.'
          );
          this.unverifiedEmail.set(this.registerData.email);
          this.loginData.email = this.registerData.email;
          this.registerData = { name: '', email: '', password: '', phone: '', address: '' };
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Registration failed. Please try again.');
        },
      });
    } else {
      this.authService.login(this.loginData).subscribe({
        next: (res: any) => {
          this.isLoading.set(false);
          this.authService.setToken(res.access_token);
          this.authService.getMe().subscribe({
            next: (user: any) => this.authService.setProfileImage(user?.profileImage || null),
            error: () => this.authService.setProfileImage(null),
          });

          if (this.authService.getUserType() === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/events';
            this.router.navigateByUrl(returnUrl);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          const isUnverifiedErr =
            err.error?.code === 'EMAIL_NOT_VERIFIED' ||
            (err.error?.message && err.error.message.toLowerCase().includes('verify your email'));

          if (isUnverifiedErr) {
            this.isUnverified.set(true);
            this.unverifiedEmail.set(err.error?.email || this.loginData.email);
            this.errorMessage.set(
              err.error?.message || 'Please verify your email address before signing in.'
            );
          } else {
            this.errorMessage.set(err.error?.message || 'Invalid email or password.');
          }
        },
      });
    }
  }

  resendVerification() {
    const email = this.unverifiedEmail();
    if (!email) return;
    this.isResending.set(true);

    this.authService.resendVerification(email).subscribe({
      next: (res: any) => {
        this.isResending.set(false);
        this.toastService.success(res.message || 'Verification link sent to your email.');
      },
      error: (err) => {
        this.isResending.set(false);
        this.toastService.error(err.error?.message || 'Failed to resend verification email.');
      },
    });
  }
}
