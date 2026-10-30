import { Component, HostListener, signal, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

import { TranslatePipe } from '../../core/translate.pipe';
import { LanguageSwitcherComponent } from '../../components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayout implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  isSidebarOpen = signal(false);
  isDesktopSidebarCollapsed = signal(false);
  showScrollToTop = signal(false);
  isProfileDropdownOpen = signal(false);
  isThemeMenuOpen = signal(false);
  isDarkMode = signal(false);
  supportUnread = signal(0);
  private router = inject(Router);
  public authService = inject(AuthService);
  private dataService = inject(DataService);
  private unreadTimer: ReturnType<typeof setInterval> | null = null;

  private routerSub?: Subscription;

  ngOnInit() {
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTo({ top: 0, behavior: 'instant' });
      }
      this.refreshUnread();
    });
    
    // Check initial theme
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        this.isDarkMode.set(true);
        document.documentElement.classList.add('dark');
      } else {
        this.isDarkMode.set(false);
        document.documentElement.classList.remove('dark');
      }
    }
    
    if (this.authService.isLoggedIn()) {
      this.authService.getMe().subscribe({
        next: (user: any) => {
          this.authService.setProfileImage(user?.profileImage || null);
        },
        error: () => {
          this.authService.setProfileImage(null);
        }
      });
      this.refreshUnread();
      this.unreadTimer = setInterval(() => this.refreshUnread(), 20000);
    }
  }

  setTheme(theme: string) {
    if (theme === 'dark') {
      this.isDarkMode.set(true);
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      this.isDarkMode.set(false);
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      // System
      localStorage.removeItem('theme');
      const prefersDark = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    this.isThemeMenuOpen.set(false);
  }

  toggleThemeMenu() {
    this.isThemeMenuOpen.update(v => !v);
    if (this.isThemeMenuOpen()) {
      this.isProfileDropdownOpen.set(false);
    }
  }

  toggleProfileDropdown() {
    this.isProfileDropdownOpen.update(v => !v);
    if (this.isProfileDropdownOpen()) {
      this.isThemeMenuOpen.set(false);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown-container')) {
      this.isProfileDropdownOpen.set(false);
    }
    if (!target.closest('.theme-dropdown-container')) {
      this.isThemeMenuOpen.set(false);
    }
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (target.scrollTop > 300) {
      this.showScrollToTop.set(true);
    } else {
      this.showScrollToTop.set(false);
    }
  }

  scrollToTop(scrollContainer: HTMLElement) {
    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    if (this.unreadTimer) clearInterval(this.unreadTimer);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }
  }

  private refreshUnread() {
    if (!this.authService.isLoggedIn()) return;
    this.dataService.getSupportUnreadCount().subscribe({
      next: (res) => this.supportUnread.set(res.count || 0),
      error: () => {}
    });
  }
}
