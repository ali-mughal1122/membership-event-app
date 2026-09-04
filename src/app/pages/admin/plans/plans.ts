import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../components/modal/modal';
import { PaginationComponent } from '../../../components/pagination/pagination';
import { DataService, Plan } from '../../../services/data.service';

@Component({
  selector: 'app-admin-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PaginationComponent],
  templateUrl: './plans.html',
  styleUrl: './plans.scss'
})
export class AdminPlans implements OnInit {
  dataService = inject(DataService);

  plans = signal<Plan[]>([]);
  isLoading = signal(false);
  isPlanModalOpen = signal(false);
  isEditingPlan = signal(false);
  currentPlan: Partial<Plan> = {};
  originalPlanName = '';
  planFeaturesText = '';
  searchQuery = '';
  page = signal(1);
  limit = signal(10);
  total = signal(0);
  totalPages = signal(1);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.fetchPlans();
  }

  fetchPlans() {
    this.isLoading.set(true);
    this.dataService.getAdminPlans({
      page: this.page(),
      limit: this.limit(),
      search: this.searchQuery,
    }).subscribe({
      next: (res) => {
        this.plans.set(res.data);
        this.total.set(res.total);
        this.totalPages.set(res.totalPages);
        this.page.set(res.page);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearchChange() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.page.set(1);
      this.fetchPlans();
    }, 350);
  }

  onPageChange(page: number) {
    this.page.set(page);
    this.fetchPlans();
  }

  onLimitChange(limit: number) {
    this.limit.set(limit);
    this.page.set(1);
    this.fetchPlans();
  }

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
    const request = this.isEditingPlan()
      ? this.dataService.updatePlan(this.currentPlan as Plan, this.originalPlanName)
      : this.dataService.addPlan(this.currentPlan as Plan);

    request.subscribe({
      next: () => {
        this.fetchPlans();
        this.isPlanModalOpen.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  archivePlan(id: string) {
    if (confirm('Are you sure you want to archive this plan?')) {
      this.isLoading.set(true);
      this.dataService.deletePlan(id).subscribe({
        next: () => {
          if (this.plans().length === 1 && this.page() > 1) {
            this.page.update(page => page - 1);
          }
          this.fetchPlans();
        },
        error: () => this.isLoading.set(false)
      });
    }
  }
}
