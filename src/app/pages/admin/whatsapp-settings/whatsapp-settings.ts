import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, AdminWhatsAppSettings } from '../../../services/data.service';
import { ToastService } from '../../../services/toast.service';
import { TranslatePipe } from '../../../core/translate.pipe';

interface CountryPreset {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-admin-whatsapp-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './whatsapp-settings.html',
  styleUrl: './whatsapp-settings.scss'
})
export class AdminWhatsAppSettingsComponent implements OnInit {
  private dataService = inject(DataService);
  private toastService = inject(ToastService);

  isLoading = signal(true);
  isSaving = signal(false);
  copiedUrl = signal(false);

  // Form model signals
  countryCode = signal('+45');
  phoneNumber = signal('');
  isEnabled = signal(false);

  originalSettings = signal<AdminWhatsAppSettings | null>(null);

  readonly countryPresets: CountryPreset[] = [
    { code: '+45', name: 'Denmark', flag: '🇩🇰' },
    { code: '+46', name: 'Sweden', flag: '🇸🇪' },
    { code: '+47', name: 'Norway', flag: '🇳🇴' },
    { code: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+1', name: 'USA / Canada', flag: '🇺🇸' },
  ];

  // Helper to extract clean digits
  private cleanDigits(val: string): string {
    return (val || '').replace(/\D/g, '');
  }

  // Clean country code without leading zeros
  cleanCountryCode = computed(() => {
    const raw = this.countryCode();
    const digits = this.cleanDigits(raw);
    return digits.replace(/^0+/, '');
  });

  // Clean phone number without leading zeros
  cleanPhoneNumber = computed(() => {
    const raw = this.phoneNumber();
    const digits = this.cleanDigits(raw);
    return digits.replace(/^0+/, '');
  });

  // Real-time WhatsApp Click-to-Chat URL
  whatsappUrl = computed(() => {
    const cc = this.cleanCountryCode();
    const phone = this.cleanPhoneNumber();
    if (!cc || !phone) return null;
    return `https://wa.me/${cc}${phone}`;
  });

  // Formatted display number
  formattedDisplayNumber = computed(() => {
    const cc = this.cleanCountryCode();
    const phone = this.phoneNumber().trim();
    if (!cc || !phone) return '';
    return `+${cc} ${phone}`;
  });

  // Validation
  isValid = computed(() => {
    if (!this.isEnabled()) return true;
    const cc = this.cleanCountryCode();
    const phone = this.cleanPhoneNumber();
    const totalDigits = cc.length + phone.length;
    return cc.length >= 1 && phone.length >= 5 && totalDigits >= 7 && totalDigits <= 15;
  });

  // Check if form has unsaved modifications
  hasChanges = computed(() => {
    const orig = this.originalSettings();
    if (!orig) return false;
    return (
      this.countryCode() !== orig.countryCode ||
      this.phoneNumber() !== orig.phoneNumber ||
      this.isEnabled() !== orig.isEnabled
    );
  });

  ngOnInit(): void {
    this.fetchSettings();
  }

  fetchSettings(): void {
    this.isLoading.set(true);
    this.dataService.getAdminWhatsAppSettings().subscribe({
      next: (data) => {
        this.originalSettings.set(data);
        this.countryCode.set(data.countryCode || '+45');
        this.phoneNumber.set(data.phoneNumber || '');
        this.isEnabled.set(Boolean(data.isEnabled));
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load WhatsApp settings.');
        this.isLoading.set(false);
      }
    });
  }

  selectCountryPreset(preset: CountryPreset): void {
    this.countryCode.set(preset.code);
  }

  save(): void {
    if (!this.isValid()) {
      this.toastService.error('Please provide a valid phone number and country code.');
      return;
    }

    this.isSaving.set(true);
    const payload = {
      countryCode: this.countryCode(),
      phoneNumber: this.phoneNumber(),
      isEnabled: this.isEnabled()
    };

    this.dataService.updateWhatsAppSettings(payload).subscribe({
      next: (updated) => {
        this.originalSettings.set(updated);
        this.countryCode.set(updated.countryCode);
        this.phoneNumber.set(updated.phoneNumber);
        this.isEnabled.set(updated.isEnabled);
        this.isSaving.set(false);
        this.toastService.success('WhatsApp settings updated successfully.');
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = err?.error?.message || 'Failed to update WhatsApp settings.';
        this.toastService.error(Array.isArray(msg) ? msg.join(', ') : msg);
      }
    });
  }

  reset(): void {
    const orig = this.originalSettings();
    if (orig) {
      this.countryCode.set(orig.countryCode || '+45');
      this.phoneNumber.set(orig.phoneNumber || '');
      this.isEnabled.set(Boolean(orig.isEnabled));
    }
  }

  copyLink(): void {
    const url = this.whatsappUrl();
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      this.copiedUrl.set(true);
      setTimeout(() => this.copiedUrl.set(false), 2000);
      this.toastService.success('WhatsApp link copied to clipboard.');
    });
  }
}

