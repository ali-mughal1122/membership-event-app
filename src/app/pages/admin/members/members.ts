import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Member } from '../../../services/data.service';
import { PaginationComponent } from '../../../components/pagination/pagination';

@Component({
  selector: 'app-admin-members',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './members.html',
  styleUrl: './members.scss'
})
export class AdminMembers implements OnInit {
  dataService = inject(DataService);

  members = signal<Member[]>([]);
  isLoading = signal(false);
  memberSearch = '';
  memberStatusFilter = '';
  memberDurationFilter = '';
  page = signal(1);
  limit = signal(10);
  total = signal(0);
  totalPages = signal(1);
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.isLoading.set(true);
    this.dataService.getMembers({
      page: this.page(),
      limit: this.limit(),
      search: this.memberSearch,
      status: this.memberStatusFilter,
      duration: this.memberDurationFilter,
    }).subscribe({
      next: (res) => {
        this.members.set(res.data);
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
      this.fetchData();
    }, 350);
  }

  onFilterChange() {
    this.page.set(1);
    this.fetchData();
  }

  onPageChange(page: number) {
    this.page.set(page);
    this.fetchData();
  }

  onLimitChange(limit: number) {
    this.limit.set(limit);
    this.page.set(1);
    this.fetchData();
  }

  deleteMember(id: string) {
    if (confirm('Are you sure you want to remove this member?')) {
      this.isLoading.set(true);
      this.dataService.deleteMember(id).subscribe({
        next: () => {
          if (this.members().length === 1 && this.page() > 1) {
            this.page.update(page => page - 1);
          }
          this.fetchData();
        },
        error: () => this.isLoading.set(false)
      });
    }
  }
}
