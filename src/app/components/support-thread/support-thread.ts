import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportMessage, SupportSenderType } from '../../services/data.service';

@Component({
  selector: 'app-support-thread',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      @for (message of messages; track message.id) {
        <div class="flex" [class.justify-end]="isOwn(message.senderType)" [class.justify-start]="!isOwn(message.senderType)">
          <div class="max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm"
            [ngClass]="isOwn(message.senderType)
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-zinc-100 dark:bg-white/10 text-gray-800 dark:text-gray-100 rounded-bl-md'">
            <div class="text-[11px] font-bold uppercase tracking-wide mb-1"
              [ngClass]="isOwn(message.senderType) ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'">
              {{ senderLabel(message.senderType) }}
            </div>
            <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ message.body }}</p>
            <p class="text-[11px] mt-2"
              [ngClass]="isOwn(message.senderType) ? 'text-blue-100/90' : 'text-gray-400'">
              {{ formatDateTime(message.createdAt) }}
            </p>
          </div>
        </div>
      } @empty {
        <p class="text-sm text-gray-500 text-center py-8">No messages yet.</p>
      }
    </div>
  `
})
export class SupportThreadComponent {
  @Input() messages: SupportMessage[] = [];
  @Input() viewer: SupportSenderType = 'MEMBER';

  isOwn(senderType: SupportSenderType) {
    return senderType === this.viewer;
  }

  senderLabel(senderType: SupportSenderType) {
    return senderType === 'ADMIN' ? 'Admin' : 'Member';
  }

  formatDateTime(value?: string) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString();
  }
}
