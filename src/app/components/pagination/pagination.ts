import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss'
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() limit = 10;
  @Input() total = 0;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();
  @Output() limitChange = new EventEmitter<number>();

  get from(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get to(): number {
    return Math.min(this.page * this.limit, this.total);
  }

  get pages(): number[] {
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  goTo(page: number) {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.pageChange.emit(page);
  }

  onLimitChange(limit: string | number) {
    this.limitChange.emit(Number(limit));
  }
}
