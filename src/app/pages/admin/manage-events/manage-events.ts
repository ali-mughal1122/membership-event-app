import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../components/modal/modal';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { DataService, Event, EventRegistration } from '../../../services/data.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-manage-events',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent],
  templateUrl: './manage-events.html',
  styleUrl: './manage-events.scss'
})
export class ManageEvents implements OnInit {
  dataService = inject(DataService);
  toastService = inject(ToastService);

  isModalOpen = signal(false);
  events = signal<Event[]>([]);
  isLoading = signal(false);
  currentEvent: Partial<Event> = {};
  isEditing = signal(false);
  isSaving = signal(false);

  isRegistrantsModalOpen = signal(false);
  selectedEventForRegistrants: Event | null = null;
  selectedRegistrations = signal<EventRegistration[]>([]);
  isLoadingRegistrations = signal(false);
  searchQuery = '';
  statusFilter = '';
  page = signal(1);
  limit = signal(10);
  total = signal(0);
  totalPages = signal(1);
  registrationsPage = signal(1);
  registrationsLimit = signal(10);
  registrationsTotal = signal(0);
  registrationsTotalPages = signal(1);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.fetchEvents();
  }

  fetchEvents() {
    this.isLoading.set(true);
    this.dataService.getAdminEvents({
      page: this.page(),
      limit: this.limit(),
      search: this.searchQuery,
      status: this.statusFilter,
    }).subscribe({
      next: (res) => {
        this.events.set(res.data);
        this.total.set(res.total);
        this.totalPages.set(res.totalPages);
        this.page.set(res.page);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load events', err);
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.page.set(1);
      this.fetchEvents();
    }, 350);
  }

  onFilterChange() {
    this.page.set(1);
    this.fetchEvents();
  }

  onPageChange(page: number) {
    this.page.set(page);
    this.fetchEvents();
  }

  onLimitChange(limit: number) {
    this.limit.set(limit);
    this.page.set(1);
    this.fetchEvents();
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.currentEvent = {
      name: '',
      title: '',
      description: '',
      slug: '',
      date: '',
      time: '',
      location: '',
      banner: '',
      status: 'Draft',
      registrations: 0,
      agenda: [],
      membershipRequired: true,
      registrationDeadline: '',
    };
    this.isModalOpen.set(true);
  }

  onEventTitleChange(name: string) {
    this.currentEvent.name = name;
    if (!this.isEditing()) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      this.currentEvent.slug = slug ? '/events/' + slug : '';
    }
  }

  openEditModal(event: Event) {
    this.isEditing.set(true);
    this.currentEvent = {
      ...event,
      agenda: JSON.parse(JSON.stringify(event.agenda || [])),
      membershipRequired: event.membershipRequired !== false,
      registrationDeadline: event.registrationDeadline
        ? new Date(event.registrationDeadline).toISOString().split('T')[0]
        : '',
    };
    this.isModalOpen.set(true);
  }

  addAgendaItem() {
    if (!this.currentEvent.agenda) this.currentEvent.agenda = [];
    this.currentEvent.agenda.push({ time: '', title: '', description: '' });
  }

  removeAgendaItem(index: number) {
    if (this.currentEvent.agenda) {
      this.currentEvent.agenda.splice(index, 1);
    }
  }

  handleSaveEvent() {
    if (!this.currentEvent.name || !this.currentEvent.date) {
      this.toastService.error('Event Name and Date are required.');
      return;
    }

    this.currentEvent.title = this.currentEvent.name;
    if (!this.currentEvent.description) this.currentEvent.description = 'No description provided.';
    if (!this.currentEvent.location) this.currentEvent.location = 'TBA';

    if (!this.currentEvent.slug) {
      this.currentEvent.slug = '/events/' + this.currentEvent.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    const eventToSave: any = { ...this.currentEvent };
    if (eventToSave.date && !eventToSave.date.includes('T')) {
      try {
        const timeStr = eventToSave.time ? eventToSave.time : '00:00';
        eventToSave.date = new Date(`${eventToSave.date}T${timeStr}:00`).toISOString();
      } catch (e) {
        eventToSave.date = new Date(eventToSave.date).toISOString();
      }
    }

    if (eventToSave.registrationDeadline) {
      if (!String(eventToSave.registrationDeadline).includes('T')) {
        eventToSave.registrationDeadline = new Date(`${eventToSave.registrationDeadline}T23:59:59`).toISOString();
      }
    } else {
      eventToSave.registrationDeadline = null;
    }

    eventToSave.membershipRequired = eventToSave.membershipRequired !== false;

    this.isSaving.set(true);
    if (this.isEditing()) {
      this.dataService.updateEvent(eventToSave as Event).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isModalOpen.set(false);
          this.fetchEvents();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error(err.error?.message || 'Failed to save event.');
          this.isSaving.set(false);
        }
      });
    } else {
      this.dataService.addEvent(eventToSave as Event).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isModalOpen.set(false);
          this.page.set(1);
          this.fetchEvents();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error(err.error?.message || 'Failed to save event.');
          this.isSaving.set(false);
        }
      });
    }
  }

  deleteEvent(id: number | string | undefined) {
    if (id !== undefined && confirm('Are you sure you want to delete this event?')) {
      this.isLoading.set(true);
      this.dataService.deleteEvent(id).subscribe({
        next: () => {
          if (this.events().length === 1 && this.page() > 1) {
            this.page.update(page => page - 1);
          }
          this.fetchEvents();
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
        }
      });
    }
  }

  openRegistrantsModal(event: Event) {
    this.selectedEventForRegistrants = event;
    this.selectedRegistrations.set([]);
    this.registrationsPage.set(1);
    this.isRegistrantsModalOpen.set(true);
    this.fetchRegistrations();
  }

  fetchRegistrations() {
    const eventId = this.selectedEventForRegistrants?.id;
    if (!eventId) return;
    this.isLoadingRegistrations.set(true);
    this.dataService.getEventRegistrations(eventId, {
      page: this.registrationsPage(),
      limit: this.registrationsLimit(),
    }).subscribe({
      next: (res) => {
        this.selectedRegistrations.set(res.data);
        this.registrationsTotal.set(res.total);
        this.registrationsTotalPages.set(res.totalPages);
        this.registrationsPage.set(res.page);
        this.isLoadingRegistrations.set(false);
      },
      error: () => this.isLoadingRegistrations.set(false)
    });
  }

  onRegistrationsPageChange(page: number) {
    this.registrationsPage.set(page);
    this.fetchRegistrations();
  }

  onRegistrationsLimitChange(limit: number) {
    this.registrationsLimit.set(limit);
    this.registrationsPage.set(1);
    this.fetchRegistrations();
  }

  statusBadgeClass(status?: string) {
    switch (status) {
      case 'REGISTERED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  }

  eventDateStatus(date?: string): 'Passed' | 'Today' | 'Upcoming' {
    if (!date) return 'Upcoming';
    const parts = String(date).slice(0, 10).split('-').map(Number);
    if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) return 'Upcoming';
    const eventDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    if (eventDate.getTime() < today.getTime()) return 'Passed';
    if (eventDate.getTime() === today.getTime()) return 'Today';
    return 'Upcoming';
  }

  passedDateBadgeClass(date?: string) {
    switch (this.eventDateStatus(date)) {
      case 'Passed': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Today': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  }
}
