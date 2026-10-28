import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class AdminLogin {

  email = 'admin@gmail.com';
  password = '123123123';
  showPassword = signal(false);
  isLoading = signal(false);
  authService = inject(AuthService);
  router = inject(Router);

  login() {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        if (res.access_token) {
          this.authService.setToken(res.access_token);
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
