import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Event } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ModalComponent } from '../../components/modal/modal';
import { createApiState } from '../../core/api-state';
import { map } from 'rxjs';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ModalComponent],
  templateUrl: './events.html',
  styleUrl: './events.scss'
})
export class Events implements OnInit {
  dataService = inject(DataService);
  authService = inject(AuthService);
  router = inject(Router);
  toastService = inject(ToastService);

  eventsState = createApiState<any[]>([]);
  upcomingEvents: any[] = [];
  pastEvents: any[] = [];
  allUpcoming: any[] = [];
  allPast: any[] = [];
  searchQuery = '';
  isSuccessModalOpen = signal(false);
  registeredEventTitle = '';
  isRegistering = false;
  registeringEventId: number | string | null = null;

  ngOnInit() {
    this.fetchEvents();
  }

  fetchEvents() {
    this.eventsState.execute(
      this.dataService.getEvents().pipe(
        map(events => {
          const published = events.filter(e => e.status === 'Published');

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          this.allUpcoming = published.filter(e => {
            if (!e.date) return true;
            const eventDate = new Date(e.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
          }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          this.allPast = published.filter(e => {
            if (!e.date) return false;
            const eventDate = new Date(e.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate < today;
          }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          this.applySearch();

          return published;
        })
      )
    );
  }

  openRegisterModal(event: Event) {
    if (this.isRegistering) return;

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/events' } });
      return;
    }

    if (event.registrationDisabledReason === 'MEMBERSHIP_REQUIRED' || !event.id) {
      return;
    }

    this.isRegistering = true;
    this.registeringEventId = event.id;
    this.dataService.registerForEvent(event.id)
      .subscribe({
        next: () => {
          this.isRegistering = false;
          this.registeringEventId = null;
          this.registeredEventTitle = event.title;
          this.isSuccessModalOpen.set(true);
          this.fetchEvents();
        },
        error: (err) => {
          this.isRegistering = false;
          this.registeringEventId = null;
          if (err.error?.code === 'MEMBERSHIP_REQUIRED') {
            this.allUpcoming = this.allUpcoming.map(e =>
              e.id === event.id ? { ...e, registrationDisabledReason: 'MEMBERSHIP_REQUIRED', canRegister: false } : e
            );
            this.applySearch();
            return;
          }
        }
      });
  }

  applySearch() {
    const query = this.searchQuery.trim().toLowerCase();
    const matches = (event: any) => {
      if (!query) return true;
      return [event.title, event.name, event.location, event.venue, event.description]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query));
    };
    this.upcomingEvents = this.allUpcoming.filter(matches);
    this.pastEvents = this.allPast.filter(matches);
  }
}
