import { Component, HostListener, signal, inject, OnInit, ElementRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss'
})
export class PublicLayout implements OnInit {
  isMobileMenuOpen = false;
  isProfileDropdownOpen = false;
  showScrollToTop = signal(false);
  private router = inject(Router);
  public authService = inject(AuthService);
  private elementRef = inject(ElementRef);

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    
    if (this.authService.isLoggedIn()) {
      this.authService.getMe().subscribe({
        next: (user: any) => {
          this.authService.setProfileImage(user?.profileImage || null);
        },
        error: () => {
          this.authService.setProfileImage(null);
        }
      });
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.scrollY > 300) {
      this.showScrollToTop.set(true);
    } else {
      this.showScrollToTop.set(false);
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown-container')) {
      this.isProfileDropdownOpen = false;
    }
  }

  get profileImage() {
    return this.authService.profileImage();
  }
}
