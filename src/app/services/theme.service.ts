import { Injectable } from '@angular/core';

export type ThemeType = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme: ThemeType = 'system';

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    const savedTheme = localStorage.getItem('app-theme') as ThemeType;
    if (savedTheme) {
      this.currentTheme = savedTheme;
    }
    this.applyTheme();
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.currentTheme === 'system') {
        this.applyTheme();
      }
    });
  }

  setTheme(theme: ThemeType) {
    this.currentTheme = theme;
    localStorage.setItem('app-theme', theme);
    this.applyTheme();
  }

  getTheme(): ThemeType {
    return this.currentTheme;
  }

  private applyTheme() {
    let isDark = false;
    
    if (this.currentTheme === 'dark') {
      isDark = true;
    } else if (this.currentTheme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
