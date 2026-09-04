import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../components/modal/modal';
import { DataService, Plan, Member, PendingMember } from '../../../services/data.service';

@Component({
  selector: 'app-manage-memberships',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './manage-memberships.html',
  styleUrl: './manage-memberships.scss'
})
export class ManageMemberships implements OnInit {
  dataService = inject(DataService);

  activeTab: string = 'active';

  plans: Plan[] = [];
  pendingMembers: PendingMember[] = [];
  members: Member[] = [];
  memberSearch = '';
  memberStatusFilter = '';
  memberDurationFilter = '';

  get filteredMembers(): Member[] {
    const query = this.memberSearch.trim().toLowerCase();
    return this.members.filter(member => {
      const matchesSearch = !query || [member.name, member.email, member.plan]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query));
      const matchesStatus = !this.memberStatusFilter || member.status === this.memberStatusFilter;
      const duration = this.plans.find(plan => plan.name === member.plan)?.durationMonths;
      const matchesDuration = !this.memberDurationFilter || Number(duration) === Number(this.memberDurationFilter);
      return matchesSearch && matchesStatus && matchesDuration;
    });
  }

  ngOnInit() {
    this.fetchData();
  }

  isLoading = signal(false);

  fetchData() {
    this.isLoading.set(true);
    let completed = 0;
    const checkDone = () => {
      completed++;
      if (completed === 3) {
        this.isLoading.set(false);
      }
    };

    this.dataService.getPlans().subscribe({
      next: (res) => { this.plans = res; checkDone(); },
      error: (err) => { console.error(err); checkDone(); }
    });
    this.dataService.getMembers({ page: 1, limit: 100 }).subscribe({
      next: (res) => { this.members = res.data; checkDone(); },
      error: (err) => { console.error(err); checkDone(); }
    });
    this.dataService.getPendingMembers().subscribe({
      next: (res) => { this.pendingMembers = res; checkDone(); },
      error: (err) => { console.error(err); checkDone(); }
    });
  }

  isPlanModalOpen = signal(false);
  isEditingPlan = signal(false);
  currentPlan: Partial<Plan> = {};
  originalPlanName: string = '';
  planFeaturesText: string = '';

  openCreatePlanModal() {
    this.isEditingPlan.set(false);
    this.currentPlan = { name: '', price: 0, durationMonths: 1, features: [], description: '' };
    this.planFeaturesText = '';
    this.isPlanModalOpen.set(true);
  }

  openEditPlanModal(plan: Plan) {
    this.isEditingPlan.set(true);
    this.originalPlanName = plan.name;
    this.currentPlan = { ...plan, features: [...(plan.features || [])] };
    this.planFeaturesText = (plan.features || []).join('\n');
    this.isPlanModalOpen.set(true);
  }

  handleSavePlan() {
    if (!this.currentPlan.name || this.currentPlan.price === undefined) return;

    this.currentPlan.price = Number(this.currentPlan.price);
    this.currentPlan.features = this.planFeaturesText.split('\n').filter(f => f.trim() !== '');

    this.isLoading.set(true);
    if (this.isEditingPlan()) {
      this.dataService.updatePlan(this.currentPlan as Plan, this.originalPlanName).subscribe({
        next: () => {
          this.fetchData();
          this.isPlanModalOpen.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
        }
      });
    } else {
      this.dataService.addPlan(this.currentPlan as Plan).subscribe({
        next: () => {
          this.fetchData();
          this.isPlanModalOpen.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
        }
      });
    }
  }

  archivePlan(id: string) {
    if (confirm(`Are you sure you want to archive this plan?`)) {
      this.isLoading.set(true);
      this.dataService.deletePlan(id).subscribe({
        next: () => this.fetchData(),
        error: (err) => { console.error(err); this.isLoading.set(false); }
      });
    }
  }

  approveMember(id: string) {
    this.isLoading.set(true);
    this.dataService.approvePendingMember(id).subscribe({
      next: () => this.fetchData(),
      error: (err) => { console.error(err); this.isLoading.set(false); }
    });
  }

  rejectMember(id: string) {
    if (confirm('Are you sure you want to reject this applicant?')) {
      this.isLoading.set(true);
      this.dataService.rejectPendingMember(id).subscribe({
        next: () => this.fetchData(),
        error: (err) => { console.error(err); this.isLoading.set(false); }
      });
    }
  }

  deleteMember(id: string) {
    if (confirm('Are you sure you want to remove this member?')) {
      this.isLoading.set(true);
      this.dataService.deleteMember(id).subscribe({
        next: () => this.fetchData(),
        error: (err) => { console.error(err); this.isLoading.set(false); }
      });
    }
  }
}
