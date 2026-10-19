import { Injectable, inject, signal } from '@angular/core';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  RouteConfigLoadStart,
  RouteConfigLoadEnd
} from '@angular/router';
import { filter } from 'rxjs/operators';

export interface ProgressBarState {
  visible: boolean;
  progress: number; // 0 to 100
  animating: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationProgressService {
  private readonly router = inject(Router);

  readonly state = signal<ProgressBarState>({
    visible: false,
    progress: 0,
    animating: true
  });

  private tricklingTimer: ReturnType<typeof setInterval> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private resetTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.initRouterListener();
  }

  private initRouterListener(): void {
    this.router.events
      .pipe(
        filter(
          (event) =>
            event instanceof NavigationStart ||
            event instanceof NavigationEnd ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError ||
            event instanceof RouteConfigLoadStart ||
            event instanceof RouteConfigLoadEnd
        )
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart || event instanceof RouteConfigLoadStart) {
          this.start();
        } else if (event instanceof NavigationEnd) {
          this.complete();
        } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
          this.cancel();
        }
      });
  }

  /**
   * Starts or restarts the progress bar trickling animation.
   */
  start(): void {
    this.clearTimers();

    // Immediately start at a small non-zero progress (YouTube style: ~15%)
    this.state.set({
      visible: true,
      progress: 15,
      animating: true
    });

    // Trickle progress naturally up to ~90% while route resolution and lazy bundles load
    this.tricklingTimer = setInterval(() => {
      this.state.update((current) => {
        if (!current.visible || current.progress >= 90) {
          return current;
        }

        // Increment size decreases as it approaches 90%
        const remaining = 90 - current.progress;
        const step = Math.max(1, Math.random() * (remaining * 0.15));
        return {
          ...current,
          progress: Math.min(90, current.progress + step)
        };
      });
    }, 200);
  }

  /**
   * Fast-forwards to 100% when navigation succeeds, then smoothly fades out.
   */
  complete(): void {
    if (this.tricklingTimer) {
      clearInterval(this.tricklingTimer);
      this.tricklingTimer = null;
    }

    if (!this.state().visible) {
      return;
    }

    // Jump to 100% with animation
    this.state.update((current) => ({
      ...current,
      progress: 100,
      animating: true
    }));

    // Fade out after completion
    this.hideTimer = setTimeout(() => {
      this.state.update((current) => ({
        ...current,
        visible: false
      }));

      // Reset progress value after opacity transition finishes
      this.resetTimer = setTimeout(() => {
        this.state.set({
          visible: false,
          progress: 0,
          animating: false
        });
      }, 300);
    }, 250);
  }

  /**
   * Cancels or handles failed navigation, immediately disappearing without 100% flash.
   */
  cancel(): void {
    this.clearTimers();
    this.state.update((current) => ({
      ...current,
      visible: false
    }));

    this.resetTimer = setTimeout(() => {
      this.state.set({
        visible: false,
        progress: 0,
        animating: false
      });
    }, 200);
  }

  private clearTimers(): void {
    if (this.tricklingTimer) {
      clearInterval(this.tricklingTimer);
      this.tricklingTimer = null;
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }
}
