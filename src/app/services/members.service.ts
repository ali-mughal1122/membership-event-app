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

  deleteMember(id: string) {
    return this.http.delete(`${MembersEndpointsMapping.GetAllMembers}/${id}`);
  }

  getPendingMembers() {
    return this.http.get(MembersEndpointsMapping.GetPendingMembers);
  }

  approvePendingMember(id: string) {
    return this.http.post(MembersEndpointsMapping.ApprovePendingMember, { id });
  }

  rejectPendingMember(id: string) {
    return this.http.post(MembersEndpointsMapping.RejectPendingMember, { id });
  }
}
