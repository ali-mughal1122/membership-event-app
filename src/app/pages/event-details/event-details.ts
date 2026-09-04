import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService, Event } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { createApiState } from '../../core/api-state';
import { map } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { ModalComponent } from '../../components/modal/modal';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [RouterLink, CommonModule, ModalComponent],
  templateUrl: './event-details.html',
  styleUrl: './event-details.scss'
})
export class EventDetails implements OnInit {
  slug: string | null = '';
  eventState = createApiState<Event>();

  dataService = inject(DataService);
  authService = inject(AuthService);
  router = inject(Router);
  toastService = inject(ToastService);

  isRegistering = false;
  isSuccessModalOpen = signal(false);
  registeredEventTitle = '';
  isPastEvent = false;

  constructor(private route: ActivatedRoute) {
    this.slug = this.route.snapshot.paramMap.get('slug');
  }

  ngOnInit() {
    this.fetchEvent();
  }

  fetchEvent() {
    if (this.slug) {
      this.eventState.execute(
        this.dataService.getEventBySlug(this.slug).pipe(
          map(event => {
            if (event.date) {
              const eventDate = new Date(event.date);
              eventDate.setHours(0, 0, 0, 0);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              this.isPastEvent = eventDate < today;
            }
            return event;
          })
        )
      );
    }
  }

  openRegisterModal(event: Event) {
    if (this.isRegistering) return;

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/events/${this.slug}` } });
      return;
    }

    if (!event.id || event.registrationDisabledReason === 'MEMBERSHIP_REQUIRED') {
      return;
    }

    this.isRegistering = true;
    this.dataService.registerForEvent(event.id)
      .subscribe({
        next: () => {
          this.isRegistering = false;
          this.registeredEventTitle = event.title;
          this.isSuccessModalOpen.set(true);
          this.fetchEvent();
        },
        error: (err) => {
          this.isRegistering = false;
          if (err.error?.code === 'MEMBERSHIP_REQUIRED') {
            const current = this.eventState.data();
            if (current) {
              this.eventState.data.set({
                ...current,
                registrationDisabledReason: 'MEMBERSHIP_REQUIRED',
                canRegister: false,
              });
            }
          }
        }
      });
  }

  registrationLabel(status?: string | null) {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'CANCELLED': return 'Cancelled';
      default: return 'Registered';
    }
  }
}
