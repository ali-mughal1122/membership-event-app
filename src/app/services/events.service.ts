import { Injectable } from '@angular/core';
import { HttpRequest } from '../core/http-request.service';
import { EventsEndpointsMapping } from '../core/endpoints/events.endpoints';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  constructor(private http: HttpRequest) {}

  getAllEvents() {
    return this.http.get(EventsEndpointsMapping.GetAllEvents);
  }

  getRecentRegistrations() {
    return this.http.get(EventsEndpointsMapping.GetRecentRegistrations);
  }

  createEvent(eventData: any) {
    return this.http.post(EventsEndpointsMapping.CreateEvent, eventData);
  }

  getEventById(id: string | number) {
    // Appending id as a query param since the interceptor parses the alias before the '?'
    return this.http.get(`${EventsEndpointsMapping.GetAllEvents}?id=${id}`);
  }

  updateEvent(id: string | number, eventData: any) {
    return this.http.put(`${EventsEndpointsMapping.GetAllEvents}?id=${id}`, eventData);
  }

  deleteEvent(id: string | number) {
    return this.http.delete(`${EventsEndpointsMapping.GetAllEvents}?id=${id}`);
  }

  registerForEvent(id: string | number, registrationData: any) {
    return this.http.post(`${EventsEndpointsMapping.GetAllEvents}?action=register&id=${id}`, registrationData);
  }
}
