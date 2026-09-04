import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.getUserType() === 'ADMIN') {
    return true;
  }

  if (authService.isLoggedIn() && authService.getUserType() === 'USER') {
    return router.parseUrl('/events');
  }

  return router.parseUrl('/admin/login');
};
