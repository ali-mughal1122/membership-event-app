import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    return true;
  }
  
  return router.createUrlTree(['/login']);
};

export const clientGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn() && authService.getUserType() === 'USER') {
    return true;
  }
  
  // If admin tries to access client area, redirect to admin dashboard
  if (authService.isLoggedIn() && authService.getUserType() === 'ADMIN') {
    return router.createUrlTree(['/admin/dashboard']);
  }
  
  return router.createUrlTree(['/login']);
};

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn() && authService.getUserType() === 'ADMIN') {
    return router.createUrlTree(['/admin/dashboard']);
  }
  
  return true;
};

export const publicNoAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    if (authService.getUserType() === 'ADMIN') {
      return router.createUrlTree(['/admin/dashboard']);
    }
    return router.createUrlTree(['/events']);
  }
  
  return true;
};
