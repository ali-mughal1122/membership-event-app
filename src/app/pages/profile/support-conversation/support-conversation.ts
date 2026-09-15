import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService, SupportConversation } from '../../../services/data.service';
import { ToastService } from '../../../services/toast.service';
import { SupportThreadComponent } from '../../../components/support-thread/support-thread';

@Component({
  selector: 'app-member-support-conversation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SupportThreadComponent],
  templateUrl: './support-conversation.html',
  styleUrl: './support-conversation.scss'
})
export class MemberSupportConversation implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private toastService = inject(ToastService);

  @ViewChild('threadScroll') threadScroll?: ElementRef<HTMLElement>;

  conversation = signal<SupportConversation | null>(null);
  isLoading = signal(true);
  isSending = signal(false);
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
    this.dataService.getMySupportConversation(id).subscribe({
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
    this.dataService.replyMySupportConversation(id, message).subscribe({
      next: (conversation) => {
        this.conversation.set(conversation);
        this.draft = '';
        this.isSending.set(false);
        queueMicrotask(() => this.scrollToBottom());
      },
      error: (err) => {
        this.isSending.set(false);
        this.toastService.error(err.error?.message || 'Failed to send message.');
      }
    });
  }

  private scrollToBottom() {
    const el = this.threadScroll?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
