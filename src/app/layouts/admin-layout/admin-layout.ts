import { Component, HostListener, signal, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayout implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  isSidebarOpen = false;
  isDesktopSidebarCollapsed = false;
  showScrollToTop = signal(false);
  isProfileDropdownOpen = false;
  isThemeMenuOpen = false;
  isDarkMode = false;
  supportUnread = signal(0);
  private router = inject(Router);
  public authService = inject(AuthService);
  private dataService = inject(DataService);
  private unreadTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.router.events.pipe(
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
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        this.isDarkMode = true;
        document.documentElement.classList.add('dark');
      } else {
        this.isDarkMode = false;
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
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      this.isDarkMode = false;
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      // System
      localStorage.removeItem('theme');
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    this.isThemeMenuOpen = false;
  }

  toggleThemeMenu() {
    this.isThemeMenuOpen = !this.isThemeMenuOpen;
    if (this.isThemeMenuOpen) {
      this.isProfileDropdownOpen = false;
    }
  }

  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    if (this.isProfileDropdownOpen) {
      this.isThemeMenuOpen = false;
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
      this.isProfileDropdownOpen = false;
    }
    if (!target.closest('.theme-dropdown-container')) {
      this.isThemeMenuOpen = false;
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
