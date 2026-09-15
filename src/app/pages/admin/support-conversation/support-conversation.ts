import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoryUrgency, DataService, SupportConversation } from '../../../services/data.service';
import { ToastService } from '../../../services/toast.service';
import { SupportThreadComponent } from '../../../components/support-thread/support-thread';
import { ModalComponent } from '../../../components/modal/modal';

@Component({
  selector: 'app-admin-support-conversation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SupportThreadComponent, ModalComponent],
  templateUrl: './support-conversation.html',
  styleUrl: './support-conversation.scss'
})
export class AdminSupportConversation implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private toastService = inject(ToastService);

  @ViewChild('threadScroll') threadScroll?: ElementRef<HTMLElement>;

  conversation = signal<SupportConversation | null>(null);
  isLoading = signal(true);
  isSending = signal(false);
  isUpdatingStatus = signal(false);
  isResolveOpen = signal(false);
  draft = '';
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.load(true);
    this.pollTimer = setInterval(() => this.load(false), 12000);
  }

  ngOnDestroy() {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  load(showSpinner: boolean) {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    if (showSpinner) this.isLoading.set(true);
    this.dataService.getSupportConversation(id).subscribe({
      next: (conversation) => {
        this.conversation.set(conversation);
        this.isLoading.set(false);
        queueMicrotask(() => this.scrollToBottom());
      },
      error: () => this.isLoading.set(false)
    });
  }

  send() {
    const id = this.conversation()?.id;
    const message = this.draft.trim();
    if (!id || !message || this.isSending()) return;
    this.isSending.set(true);
    this.dataService.replySupportConversation(id, message).subscribe({
      next: (conversation) => {
        this.conversation.set(conversation);
        this.draft = '';
        this.isSending.set(false);
        this.toastService.success('Reply sent.');
        queueMicrotask(() => this.scrollToBottom());
      },
      error: (err) => {
        this.isSending.set(false);
        this.toastService.error(err.error?.message || 'Failed to send reply.');
      }
    });
  }

  confirmResolve() {
    const id = this.conversation()?.id;
    if (!id) return;
    this.isUpdatingStatus.set(true);
    this.dataService.updateSupportStatus(id, 'RESOLVED').subscribe({
      next: (conversation) => {
        this.conversation.set(conversation);
        this.isUpdatingStatus.set(false);
        this.isResolveOpen.set(false);
        this.toastService.success('Conversation marked as resolved.');
      },
      error: (err) => {
        this.isUpdatingStatus.set(false);
        this.toastService.error(err.error?.message || 'Failed to resolve conversation.');
      }
    });
  }

  reopen() {
    const id = this.conversation()?.id;
    if (!id) return;
    this.isUpdatingStatus.set(true);
    this.dataService.updateSupportStatus(id, 'OPEN').subscribe({
      next: (conversation) => {
        this.conversation.set(conversation);
        this.isUpdatingStatus.set(false);
        this.toastService.success('Conversation reopened.');
      },
      error: (err) => {
        this.isUpdatingStatus.set(false);
        this.toastService.error(err.error?.message || 'Failed to reopen conversation.');
      }
    });
  }

  urgencyLabel(urgency?: string) {
    switch (urgency) {
      case 'CRITICAL': return 'Critical';
      case 'HIGH': return 'High';
      case 'MEDIUM': return 'Medium';
      case 'LOW': return 'Low';
      default: return urgency || '';
    }
  }

  urgencyBadgeClass(urgency?: CategoryUrgency | string) {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30';
      case 'HIGH': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30';
      case 'LOW': return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/15';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  formatDateTime(value?: string) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
  }

  private scrollToBottom() {
    const el = this.threadScroll?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
