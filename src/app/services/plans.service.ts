import { Injectable } from '@angular/core';
import { HttpRequest } from '../core/http-request.service';
import { PlansEndpointsMapping } from '../core/endpoints/plans.endpoints';

@Injectable({
  providedIn: 'root'
})
export class PlansService {
  constructor(private http: HttpRequest) {}

  getAllPlans() {
    return this.http.get(PlansEndpointsMapping.GetAllPlans);
  }

  createPlan(planData: any) {
    return this.http.post(PlansEndpointsMapping.CreatePlan, planData);
  }

  updatePlan(name: string, planData: any) {
    return this.http.put(`${PlansEndpointsMapping.GetAllPlans}?name=${name}`, planData);
  }

  deletePlan(name: string) {
    return this.http.delete(`${PlansEndpointsMapping.GetAllPlans}?name=${name}`);
  }
}
