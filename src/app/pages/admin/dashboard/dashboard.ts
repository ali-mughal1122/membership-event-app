import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  dataService = inject(DataService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);

  isLoading = signal(true);
  recentRegistrations = signal<any[]>([]);
  totalMembers = signal(0);
  publishedEvents = signal(0);
  upcomingEvents = signal(0);
  pendingRegistrations = signal(0);
  updatingRegId = signal<string | null>(null);

  ngOnInit() {
    forkJoin({
      events: this.dataService.getEvents(),
      members: this.dataService.getMembers({ page: 1, limit: 1 }),
      registrations: this.dataService.getRecentRegistrations(8),
    }).subscribe({
      next: ({ events, members, registrations }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const published = events.filter(event => event.status === 'Published');
        this.publishedEvents.set(published.length);
        this.upcomingEvents.set(published.filter(event => {
          if (!event.date) return true;
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today;
        }).length);
        this.totalMembers.set(members.total);
        this.recentRegistrations.set(registrations);
        this.pendingRegistrations.set(registrations.filter((reg: any) => reg.status === 'PENDING').length);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getTimeAgo(timestamp: number): string {
    if (!timestamp) return 'Just now';
    const diffInSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  registrationLabel(status?: string) {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      default: return status || 'Received';
    }
  }

  approveRegistration(reg: any) {
    if (!reg?.id || !reg?.eventId) return;
    this.updatingRegId.set(reg.id);
    this.dataService.approveEventRegistration(reg.eventId, reg.id).subscribe({
      next: () => {
        this.recentRegistrations.update(list => list.map(item => item.id === reg.id ? { ...item, status: 'APPROVED' } : item));
        this.pendingRegistrations.update(count => Math.max(0, count - 1));
        this.updatingRegId.set(null);
        this.toastService.success(`${reg.name || 'Member'} was emailed that they successfully registered for ${reg.eventName || 'the event'}.`);
      },
      error: () => {
        this.updatingRegId.set(null);
        this.toastService.error('Failed to approve registration.');
      }
    });
  }

  rejectRegistration(reg: any) {
    if (!reg?.id || !reg?.eventId) return;
    this.updatingRegId.set(reg.id);
    this.dataService.rejectEventRegistration(reg.eventId, reg.id).subscribe({
      next: () => {
        this.recentRegistrations.update(list => list.map(item => item.id === reg.id ? { ...item, status: 'REJECTED' } : item));
        this.pendingRegistrations.update(count => Math.max(0, count - 1));
        this.updatingRegId.set(null);
        this.toastService.success('Registration rejected.');
      },
      error: () => {
        this.updatingRegId.set(null);
        this.toastService.error('Failed to reject registration.');
      }
    });
  }
}
