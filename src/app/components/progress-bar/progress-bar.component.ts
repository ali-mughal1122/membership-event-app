import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationProgressService } from '../../services/navigation-progress.service';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="youtube-progress-bar"
      [class.visible]="progressState().visible"
      [class.animating]="progressState().animating"
      role="progressbar"
      aria-label="Route navigation progress"
      [attr.aria-valuenow]="progressState().progress"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="progress-fill"
        [style.width.%]="progressState().progress"
      >
        <div class="progress-glow"></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 999999;
      pointer-events: none;
    }

    .youtube-progress-bar {
      width: 100%;
      height: 2px;
      opacity: 0;
      transition: opacity 0.25s ease-out;
      position: relative;
    }

    .youtube-progress-bar.visible {
      opacity: 1;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #2563eb, #3b82f6 70%, #60a5fa 100%);
      position: relative;
      transition: width 0.2s cubic-bezier(0.1, 0.9, 0.2, 1);
      box-shadow: 0 0 10px rgba(37, 99, 235, 0.6);
    }

    .youtube-progress-bar:not(.animating) .progress-fill {
      transition: none;
    }

    .progress-glow {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 90px;
      height: 100%;
      box-shadow: 0 0 12px #3b82f6, 0 0 6px #60a5fa;
      opacity: 0.95;
      transform: rotate(3deg) translate(0px, -4px);
    }

    @media (prefers-reduced-motion: reduce) {
      .progress-fill {
        transition: none !important;
      }
      .youtube-progress-bar {
        transition: none !important;
      }
    }
  `]
})
export class ProgressBarComponent {
  private readonly progressService = inject(NavigationProgressService);
  protected readonly progressState = this.progressService.state;
}
