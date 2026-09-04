import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class AdminLogin {
  email = 'admin@gmail.com';
  password = '123123123';
  showPassword = false;
  isLoading = false;
  authService = inject(AuthService);

  constructor(private router: Router) { }

  login() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.access_token) {
          this.authService.setToken(res.access_token);
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
