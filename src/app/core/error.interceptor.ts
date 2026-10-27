import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'An unknown error occurred!';
      
      if (error.error instanceof ErrorEvent) {
        // Client side error
        errorMsg = `Error: ${error.error.message}`;
      } else {
        // Server side error
        if (error.status === 401) {
          if (error.error?.code === 'EMAIL_NOT_VERIFIED') {
            return throwError(() => error);
          }
          const isLoginRequest = req.url.includes('auth/login');
          if (isLoginRequest) {
            errorMsg = error.error?.message || 'Invalid email or password.';
          } else {
            errorMsg = 'Unauthorized: Session expired or invalid token. Please log in again.';
            authService.logout();
          }
        } else if (error.status === 403) {
          if (error.error?.code === 'MEMBERSHIP_REQUIRED') {
            return throwError(() => error);
          }
          errorMsg = error.error?.message || 'Forbidden: You do not have permission to perform this action.';
        } else if (error.error && error.error.message) {
          errorMsg = Array.isArray(error.error.message) ? error.error.message.join(', ') : error.error.message;
        } else {
          errorMsg = `Server Error (${error.status}): ${error.message}`;
        }
      }
      
      toastService.error(errorMsg);
      return throwError(() => error);
    })
  );
};
