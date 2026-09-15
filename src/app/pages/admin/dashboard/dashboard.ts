import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  dataService = inject(DataService);

  isLoading = signal(true);
  recentRegistrations = signal<any[]>([]);
  totalMembers = signal(0);
  publishedEvents = signal(0);
  upcomingEvents = signal(0);

  ngOnInit() {
    forkJoin({
      events: this.dataService.getEvents(),
      members: this.dataService.getMembers({ page: 1, limit: 1 }),
      registrations: this.dataService.getRecentRegistrations(10),
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
}
