import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhatsappFloatingButtonComponent } from './whatsapp-floating-button.component';
import { provideHttpClient } from '@angular/common/http';
import { DataService } from '../../services/data.service';
import { of } from 'rxjs';

describe('WhatsappFloatingButtonComponent', () => {
  let component: WhatsappFloatingButtonComponent;
  let fixture: ComponentFixture<WhatsappFloatingButtonComponent>;
  let mockDataService: Partial<DataService>;

  beforeEach(async () => {
    mockDataService = {
      getPublicWhatsAppSettings: () => of({
        isEnabled: true,
        whatsappUrl: 'https://wa.me/4577336512',
        formattedNumber: '+45 77 33 65 12',
      }),
    };

    await TestBed.configureTestingModule({
      imports: [WhatsappFloatingButtonComponent],
      providers: [
        provideHttpClient(),
        { provide: DataService, useValue: mockDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WhatsappFloatingButtonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the button when enabled with valid URL', () => {
    const el: HTMLElement = fixture.nativeElement;
    const link = el.querySelector('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('https://wa.me/4577336512');
  });

  it('should position at bottom-8 when hasScrollToTop is false', () => {
    component.hasScrollToTop = false;
    fixture.detectChanges();
    const aside = fixture.nativeElement.querySelector('aside');
    expect(aside?.classList.contains('bottom-8')).toBe(true);
    expect(aside?.classList.contains('bottom-24')).toBe(false);
  });

  it('should position at bottom-24 when hasScrollToTop is true', () => {
    component.hasScrollToTop = true;
    fixture.detectChanges();
    const aside = fixture.nativeElement.querySelector('aside');
    expect(aside?.classList.contains('bottom-24')).toBe(true);
    expect(aside?.classList.contains('bottom-8')).toBe(false);
  });
});
