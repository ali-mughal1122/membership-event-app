import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, SupportedLanguage } from '../../core/translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex items-center">
      <div class="flex items-center bg-gray-100/90 dark:bg-zinc-800/90 rounded-full p-0.5 border border-gray-200/80 dark:border-white/10 shadow-sm backdrop-blur-xs">
        <button
          type="button"
          (click)="switchLanguage('en')"
          [class.bg-white]="translationService.currentLang() === 'en'"
          [class.text-blue-600]="translationService.currentLang() === 'en'"
          [class.shadow-xs]="translationService.currentLang() === 'en'"
          [class.dark:bg-zinc-700]="translationService.currentLang() === 'en'"
          [class.dark:text-white]="translationService.currentLang() === 'en'"
          [class.text-gray-500]="translationService.currentLang() !== 'en'"
          [class.dark:text-gray-400]="translationService.currentLang() !== 'en'"
          class="flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer hover:text-gray-900 dark:hover:text-white"
          title="Switch to English">
          <span class="text-[11px] leading-none">🇬🇧</span>
          <span class="leading-none">EN</span>
        </button>

        <button
          type="button"
          (click)="switchLanguage('da')"
          [class.bg-white]="translationService.currentLang() === 'da'"
          [class.text-blue-600]="translationService.currentLang() === 'da'"
          [class.shadow-xs]="translationService.currentLang() === 'da'"
          [class.dark:bg-zinc-700]="translationService.currentLang() === 'da'"
          [class.dark:text-white]="translationService.currentLang() === 'da'"
          [class.text-gray-500]="translationService.currentLang() !== 'da'"
          [class.dark:text-gray-400]="translationService.currentLang() !== 'da'"
          class="flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer hover:text-gray-900 dark:hover:text-white"
          title="Skift til dansk">
          <span class="text-[11px] leading-none">🇩🇰</span>
          <span class="leading-none">DA</span>
        </button>
      </div>
    </div>
  `
})
export class LanguageSwitcherComponent {
  public translationService = inject(TranslationService);

  switchLanguage(lang: SupportedLanguage) {
    this.translationService.setLanguage(lang).subscribe();
  }
}
