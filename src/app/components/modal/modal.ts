import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  Renderer2,
  SimpleChanges,
  inject,
  DOCUMENT,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { lockBodyScroll, unlockBodyScroll } from '../../core/scroll-lock';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  host: {
    style: 'display: contents',
  },
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overscroll-none"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-gray-900/60 dark:bg-slate-950/75 backdrop-blur-sm"
          aria-hidden="true"
          (click)="close()">
        </div>

        <!-- Centered panel -->
        <div
          class="relative z-10 w-full max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 text-left shadow-[0_24px_80px_-16px_rgba(0,0,0,0.45)] border border-gray-100 dark:border-white/10"
          [ngClass]="{
            'sm:max-w-5xl': size === 'xl',
            'sm:max-w-2xl': size === 'lg',
            'sm:max-w-lg': size === 'md'
          }"
          (click)="$event.stopPropagation()">
          <div class="px-5 pt-5 pb-4 sm:px-7 sm:pt-6 sm:pb-4 relative shrink-0 border-b border-gray-100 dark:border-white/10">
            @if (showCancel && !isConfirming) {
              <button
                type="button"
                class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 transition-colors"
                (click)="close()">
                <span class="sr-only">Close</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            }

            <div class="pr-10">
              <h3 class="text-xl leading-7 font-bold tracking-tight text-gray-900 dark:text-white" [id]="titleId">
                {{ title }}
              </h3>
              @if (subtitle) {
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
              }
            </div>
          </div>

          <div data-scroll-lock-allow class="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6 text-gray-700 dark:text-gray-300">
            <ng-content></ng-content>
          </div>

          <div class="bg-gray-50/90 dark:bg-white/[0.03] px-5 py-4 sm:px-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100 dark:border-white/10 shrink-0">
            @if (showCancel) {
              <button
                type="button"
                class="modern-button w-full sm:w-auto border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                (click)="close()"
                [disabled]="isConfirming">
                Cancel
              </button>
            }
            @if (showConfirm) {
              <button
                type="button"
                class="modern-button-primary w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center"
                (click)="onConfirm()"
                [disabled]="isConfirming">
                @if (isConfirming) {
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                {{ isConfirming ? 'Saving...' : confirmText }}
              </button>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class ModalComponent implements OnChanges, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly doc = inject(DOCUMENT);

  @Input() isOpen = false;
  @Input() title = 'Modal Title';
  @Input() subtitle = '';
  @Input() confirmText = 'Save';
  @Input() showConfirm = true;
  @Input() showCancel = true;
  @Input() isConfirming = false;
  @Input() size: 'md' | 'lg' | 'xl' = 'md';

  @Output() closeEvent = new EventEmitter<void>();
  @Output() confirmEvent = new EventEmitter<void>();

  readonly titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`;

  private movedToBody = false;
  private scrollLocked = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      this.syncPortal();
    }
  }

  ngOnDestroy() {
    this.unlockBody();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) {
      this.close();
    }
  }

  close() {
    if (this.isConfirming) return;
    this.closeEvent.emit();
  }

  onConfirm() {
    if (this.isConfirming) return;
    this.confirmEvent.emit();
  }

  private syncPortal() {
    const host = this.el.nativeElement;
    if (this.isOpen) {
      this.lockBody();
      if (!this.movedToBody) {
        this.renderer.appendChild(this.doc.body, host);
        this.movedToBody = true;
      }
    } else {
      if (this.doc.activeElement instanceof HTMLElement) {
        this.doc.activeElement.blur();
      }
      this.unlockBody();
    }
  }

  private lockBody() {
    if (this.scrollLocked) return;
    lockBodyScroll();
    this.scrollLocked = true;
  }

  private unlockBody() {
    if (!this.scrollLocked) return;
    unlockBodyScroll();
    this.scrollLocked = false;
  }
}
