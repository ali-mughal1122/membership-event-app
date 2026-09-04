import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './toast.scss',
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <div *ngFor="let toast of toastService.toasts()"
           class="toast-item pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl shadow-lg border"
           [ngClass]="{
             'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800': toast.type === 'success',
             'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800': toast.type === 'error',
             'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800': toast.type === 'warning',
             'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800': toast.type === 'info'
           }">
        <div class="flex justify-between items-start gap-4">
          <p class="text-sm font-medium leading-tight">{{ toast.message }}</p>
          <button (click)="toastService.remove(toast.id)" class="opacity-70 hover:opacity-100 transition-opacity focus:outline-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}
