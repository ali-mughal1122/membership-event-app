import { Injectable } from '@angular/core';
import { HttpRequest } from '../core/http-request.service';
import { MembersEndpointsMapping } from '../core/endpoints/members.endpoints';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  constructor(private http: HttpRequest) {}

  getAllMembers() {
    return this.http.get(MembersEndpointsMapping.GetAllMembers);
  }

  deleteMember(email: string) {
    return this.http.delete(`${MembersEndpointsMapping.GetAllMembers}?email=${email}`);
  }

  getPendingMembers() {
    return this.http.get(MembersEndpointsMapping.GetPendingMembers);
  }

  approvePendingMember(email: string) {
    return this.http.post(MembersEndpointsMapping.ApprovePendingMember, { email });
  }

  rejectPendingMember(email: string) {
    return this.http.post(MembersEndpointsMapping.RejectPendingMember, { email });
  }
}
