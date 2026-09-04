import { signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';

export interface ApiState<T> {
  data: WritableSignal<T | null>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  execute: (observable$: Observable<T>, onSuccess?: (res: T) => void, onError?: (err: any) => void) => void;
  start: () => void;
  success: (data: T) => void;
  fail: (error: string | any) => void;
  reset: () => void;
}

export function createApiState<T>(initialData: T | null = null): ApiState<T> {
  const state: ApiState<T> = {
    data: signal<T | null>(initialData),
    loading: signal<boolean>(false),
    error: signal<string | null>(null),
    start: () => {
      state.loading.set(true);
      state.error.set(null);
    },
    success: (res: T) => {
      state.data.set(res);
      state.loading.set(false);
      state.error.set(null);
    },
    fail: (err: any) => {
      state.error.set(typeof err === 'string' ? err : (err?.message || 'An error occurred'));
      state.loading.set(false);
    },
    execute: (observable$, onSuccess, onError) => {
      state.start();
      observable$.subscribe({
        next: (res) => {
          state.success(res);
          if (onSuccess) onSuccess(res);
        },
        error: (err) => {
          state.fail(err);
          if (onError) onError(err);
        }
      });
    },
    reset: () => {
      state.data.set(initialData);
      state.loading.set(false);
      state.error.set(null);
    }
  };
  return state;
}
