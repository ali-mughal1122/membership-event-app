import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, PublicWhatsAppSettings } from '../../services/data.service';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-whatsapp-floating-button',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './whatsapp-floating-button.component.html',
  styleUrl: './whatsapp-floating-button.component.scss'
})
export class WhatsappFloatingButtonComponent implements OnInit {
  private dataService = inject(DataService);
  
  @Input() hasScrollToTop: boolean = false;

  config = signal<PublicWhatsAppSettings | null>(null);

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.dataService.getPublicWhatsAppSettings().subscribe({
      next: (res) => {
        this.config.set(res);
      },
      error: () => {
        this.config.set(null);
      }
    });
  }
}

