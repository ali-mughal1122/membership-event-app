import { Injectable } from '@angular/core';
import { HttpRequest } from '../core/http-request.service';
import { AppEndpointsMapping } from '../core/endpoints';
import { Observable, map } from 'rxjs';
import { PaginationQuery, PaginatedResult, toQueryString } from '../core/pagination';

export interface EventRegistration {
  id?: string;
  name?: string;
  email?: string;
  date?: string;
  timestamp?: number;
  status?: string;
  membershipStatus?: string;
}

export interface Event {
  id?: number | string;
  name?: string;
  title: string;
  slug: string;
  date: string;
  time?: string;
  venue?: string;
  location?: string;
  description?: string;
  banner?: string;
  registrations?: number;
  registeredCount?: number;
  capacity?: number;
  status?: string;
  remainingSeats?: number;
  registrants?: EventRegistration[];
  agenda?: { time: string; title: string; description: string }[];
  isRegistered?: boolean;
  membershipRequired?: boolean;
  registrationDeadline?: string | null;
  registrationStatus?: string | null;
  canRegister?: boolean;
  registrationDisabledReason?: string | null;
}

export interface Member {
  id?: string;
  userId?: string;
  initials?: string;
  name: string;
  email: string;
  plan: string;
  planId?: string;
  durationMonths?: number;
  avatarClass?: string;
  planClass?: string;
  joinDate?: string;
  expiryDate?: string;
  remainingDays?: number;
  status?: string;
}

export interface Plan {
  id?: string;
  name: string;
  price: number;
  interval?: string;
  durationMonths?: number;
  features?: string[];
  activeSubscribers?: number;
  description?: string;
}

export interface PendingMember {
  id?: string;
  name: string;
  email: string;
  plan: string;
  requestDate: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  membershipStatus?: string;
  plan?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpRequest) { }

  private mapEvent(e: any): Event {
    const segment = String(e.slug || '')
      .replace(/^\/events\//, '')
      .replace(/^\/+|\/+$/g, '')
      || (e.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const registeredCount = e.registeredCount ?? e.registrations ?? (e.registrants ? e.registrants.length : 0);
    const capacity = e.capacity || 100;

    return {
      ...e,
      banner: e.banner || 'https://media.istockphoto.com/id/1759402352/photo/all-black-cinema.jpg?s=1024x1024&w=is&k=20&c=fN1z-aohpttbIx1Qzos5F2I0y9b_OStw-JSQVsHNjzc=',
      name: e.title,
      title: e.title,
      slug: '/events/' + segment,
      date: e.date ? new Date(e.date).toISOString().split('T')[0] : '',
      venue: e.location || e.venue,
      location: e.location,
      registrations: registeredCount,
      registeredCount,
      registrants: e.registrants || [],
      capacity,
      remainingSeats: e.remainingSeats ?? Math.max(0, capacity - registeredCount),
      status: e.status || 'Published',
      membershipRequired: e.membershipRequired !== false,
      registrationDeadline: e.registrationDeadline || null,
      isRegistered: !!e.isRegistered,
      registrationStatus: e.registrationStatus || null,
      canRegister: !!e.canRegister,
      registrationDisabledReason: e.registrationDisabledReason || null,
    };
  }

  private mapMember(m: any): Member {
    const name = m.name || m.user?.name || m.user?.email?.split('@')[0] || 'Unknown';
    const email = m.email || m.user?.email || '';
    const plan = typeof m.plan === 'string' ? m.plan : (m.plan?.name || 'Unknown');
    const rawStatus = m.status || m.displayStatus || 'ACTIVE';
    const status =
      rawStatus === 'ACTIVE' || rawStatus === 'Active' ? 'Active' :
      rawStatus === 'EXPIRED' || rawStatus === 'Expired' ? 'Expired' :
      rawStatus === 'PENDING' || rawStatus === 'Pending' ? 'Pending' :
      rawStatus;
    const joinDate = m.joinDate || m.startDate;
    const expiryDate = m.expiryDate || m.endDate;

    return {
      id: m.id,
      userId: m.userId || m.user?.id,
      name,
      email,
      plan,
      planId: m.planId || m.plan?.id,
      durationMonths: m.durationMonths ?? m.plan?.durationMonths,
      initials: name.split(' ').map((n: string) => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || 'U',
      avatarClass: this.avatarClassFor(email || name),
      planClass: 'text-blue-600',
      joinDate: joinDate ? new Date(joinDate).toLocaleDateString() : '',
      expiryDate: expiryDate ? new Date(expiryDate).toLocaleDateString() : '',
      remainingDays: typeof m.remainingDays === 'number'
        ? Math.max(0, m.remainingDays)
        : (expiryDate ? Math.max(0, Math.ceil((new Date(expiryDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24))) : 0),
      status,
    };
  }

  private avatarClassFor(seed: string): string {
    const palettes = [
      'bg-blue-100 text-blue-600',
      'bg-emerald-100 text-emerald-700',
      'bg-amber-100 text-amber-700',
      'bg-violet-100 text-violet-700',
      'bg-rose-100 text-rose-700',
      'bg-cyan-100 text-cyan-700',
      'bg-orange-100 text-orange-700',
      'bg-indigo-100 text-indigo-700',
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    return palettes[Math.abs(hash) % palettes.length];
  }

  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(AppEndpointsMapping.GetAllEvents).pipe(
      map((events: any[]) => events.map((e: any) => this.mapEvent(e)))
    );
  }

  getAdminEvents(params: PaginationQuery = {}): Observable<PaginatedResult<Event>> {
    return this.http.get<PaginatedResult<any>>(`${AppEndpointsMapping.GetAllEvents}${toQueryString({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search,
      status: params.status,
    })}`).pipe(
      map((res) => ({
        ...res,
        data: (res.data || []).map((e: any) => this.mapEvent(e)),
      }))
    );
  }

  getEventBySlug(slug: string): Observable<Event> {
    return this.http.get<Event>(`${AppEndpointsMapping.GetEventBySlug}/${slug}`).pipe(
      map((e: any) => {
        if (!e) {
          throw new Error('Event not found');
        }
        return this.mapEvent(e);
      })
    );
  }

  getPlans(): Observable<Plan[]> {
    const mapPlan = (p: any): Plan => ({
      ...p,
      interval: p.durationMonths === 1 ? 'mo' : (p.durationMonths === 12 ? 'yr' : p.durationMonths + ' mo'),
      activeSubscribers: p.activeSubscribers || 0
    });
    return this.http.get<Plan[]>(AppEndpointsMapping.GetAllPlans).pipe(
      map(plans => (plans || []).map(mapPlan))
    );
  }

  getAdminPlans(params: PaginationQuery = {}): Observable<PaginatedResult<Plan>> {
    const mapPlan = (p: any): Plan => ({
      ...p,
      interval: p.durationMonths === 1 ? 'mo' : (p.durationMonths === 12 ? 'yr' : p.durationMonths + ' mo'),
      activeSubscribers: p.activeSubscribers || 0
    });
    return this.http.get<PaginatedResult<any>>(`${AppEndpointsMapping.GetAllPlans}${toQueryString({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search,
    })}`).pipe(
      map((res) => ({
        ...res,
        data: (res.data || []).map(mapPlan),
      }))
    );
  }

  getMembers(params: PaginationQuery = {}): Observable<PaginatedResult<Member>> {
    return this.http.get<PaginatedResult<any>>(`${AppEndpointsMapping.GetAllMembers}${toQueryString({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search,
      status: params.status,
      duration: params.duration,
    })}`).pipe(
      map((res) => ({
        ...res,
        data: (res.data || []).map((m: any) => this.mapMember(m)),
      }))
    );
  }

  getUsers(params: PaginationQuery = {}): Observable<PaginatedResult<AppUser>> {
    return this.http.get<PaginatedResult<any>>(`${AppEndpointsMapping.GetAllUsers}${toQueryString({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search,
    })}`).pipe(
      map((res) => ({
        ...res,
        data: (res.data || []).map((user: any) => ({
          id: user.id,
          name: user.name || user.email?.split('@')[0] || 'Unknown',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
          membershipStatus: user.membershipStatus || 'NONE',
          plan: user.plan || null,
        })),
      }))
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${AppEndpointsMapping.DeleteUser}/${id}`);
  }

  getPendingMembers(): Observable<PendingMember[]> {
    return this.http.get<any[]>(AppEndpointsMapping.GetPendingMembers).pipe(
      map((members: any[]) => (members || []).map((m: any) => {
        const mapped = this.mapMember(m);
        return {
          id: mapped.id,
          name: mapped.name,
          email: mapped.email,
          plan: mapped.plan,
          requestDate: mapped.joinDate || '',
        };
      }))
    );
  }

  addEvent(event: Event): Observable<any> {
    return this.http.post<any>(AppEndpointsMapping.CreateEvent, event);
  }

  updateEvent(event: Event): Observable<any> {
    return this.http.put<any>(`${AppEndpointsMapping.GetAllEvents}/${event.id}`, event);
  }

  deleteEvent(id: string | number): Observable<any> {
    return this.http.delete<any>(`${AppEndpointsMapping.GetAllEvents}/${id}`);
  }

  addPlan(plan: Plan): Observable<any> {
    return this.http.post<any>(AppEndpointsMapping.CreatePlan, plan);
  }

  updatePlan(plan: Plan, oldName: string): Observable<any> {
    return this.http.put<any>(`${AppEndpointsMapping.UpdatePlan}/${plan.id || oldName}`, plan);
  }

  deletePlan(id: string): Observable<any> {
    return this.http.delete<any>(`${AppEndpointsMapping.DeletePlan}/${id}`);
  }

  registerForEvent(eventId: number | string, name?: string, email?: string): Observable<any> {
    return this.http.post<any>(`${AppEndpointsMapping.RegisterEvent}/${eventId}/register`, { name, email });
  }

  getEventRegistrations(eventId: number | string, params: PaginationQuery = {}): Observable<PaginatedResult<EventRegistration>> {
    return this.http.get<PaginatedResult<any>>(`${AppEndpointsMapping.GetEventRegistrations}/${eventId}/registrations${toQueryString({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      status: params.status,
    })}`).pipe(
      map((res) => ({
        ...res,
        data: (res.data || []).map((reg: any) => ({
          ...reg,
          date: reg.timestamp ? new Date(reg.timestamp).toLocaleDateString() : (reg.date || ''),
        })),
      }))
    );
  }

  approveEventRegistration(eventId: number | string, registrationId: string): Observable<any> {
    return this.http.post<any>(`${AppEndpointsMapping.ApproveEventRegistration}/${eventId}/registrations/${registrationId}/approve`, {});
  }

  rejectEventRegistration(eventId: number | string, registrationId: string): Observable<any> {
    return this.http.post<any>(`${AppEndpointsMapping.RejectEventRegistration}/${eventId}/registrations/${registrationId}/reject`, {});
  }

  getRecentRegistrations(count: number = 5): Observable<any[]> {
    return this.http.get<any[]>(AppEndpointsMapping.GetRecentRegistrations).pipe(
      map(regs => regs.slice(0, count))
    );
  }

  approvePendingMember(id: string): Observable<any> {
    return this.http.post<any>(AppEndpointsMapping.ApprovePendingMember, { id });
  }

  rejectPendingMember(id: string): Observable<any> {
    return this.http.post<any>(AppEndpointsMapping.RejectPendingMember, { id });
  }

  deleteMember(id: string): Observable<any> {
    return this.http.delete<any>(`${AppEndpointsMapping.GetAllMembers}/${id}`);
  }

  getMyMembership(): Observable<any> {
    return this.http.get<any>(AppEndpointsMapping.GetMyMembership);
  }

  getReviews(limit: number = 6): Observable<any[]> {
    return this.http.get<any[]>(`${AppEndpointsMapping.GetAllReviews}?limit=${limit}`);
  }

  getMyReview(): Observable<any> {
    return this.http.get<any>(AppEndpointsMapping.GetMyReview);
  }

  submitReview(review: { rating: number; comment: string }): Observable<any> {
    return this.http.post<any>(AppEndpointsMapping.CreateReview, review);
  }

  updateReview(review: { rating: number; comment: string }): Observable<any> {
    return this.http.put<any>(AppEndpointsMapping.UpdateReview, review);
  }
}
