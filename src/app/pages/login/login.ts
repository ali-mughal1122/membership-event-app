import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  isSignupMode = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  loginData = { email: '', password: '' };
  registerData = { name: '', email: '', password: '', phone: '', address: '' };

  toggleMode() {
    this.isSignupMode = !this.isSignupMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    const request = this.isSignupMode 
      ? this.authService.register(this.registerData)
      : this.authService.login(this.loginData);

    request.subscribe({
      next: (res: any) => {
        this.isLoading = false;
        
        if (this.isSignupMode) {
          // Switch to login mode and show success
          this.isSignupMode = false;
          this.successMessage = 'Registration successful! Please sign in.';
          // Clear registration data
          this.registerData = { name: '', email: '', password: '', phone: '', address: '' };
        } else {
          this.authService.setToken(res.access_token);
          this.authService.getMe().subscribe({
            next: (user: any) => this.authService.setProfileImage(user?.profileImage || null),
            error: () => this.authService.setProfileImage(null),
          });

          if (this.authService.getUserType() === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            // Route to the intended destination or default to events
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/events';
            this.router.navigateByUrl(returnUrl);
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Authentication failed. Please try again.';
      }
    });
  }
}
