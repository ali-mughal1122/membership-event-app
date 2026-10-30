import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { EN_TRANSLATIONS, DA_TRANSLATIONS } from './i18n.data';

export type SupportedLanguage = 'en' | 'da';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private http = inject(HttpClient);
  
  private currentLangSignal = signal<SupportedLanguage>('en');
  public currentLang = this.currentLangSignal.asReadonly();
  
  // Pre-load bundled dictionaries so switching is instantaneous and refresh NEVER breaks
  private translations: Record<SupportedLanguage, any> = {
    en: EN_TRANSLATIONS,
    da: DA_TRANSLATIONS
  };

  public isLoaded = signal<boolean>(true);

  constructor() {
    let initialLang: SupportedLanguage = 'en';
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('app_lang') as SupportedLanguage;
      if (saved === 'en' || saved === 'da') {
        initialLang = saved;
      }
    }
    // Instant synchronous activation: zero delay, no blank keys on refresh!
    this.currentLangSignal.set(initialLang);

    // Optional background check for dynamic external JSON updates
    this.fetchJson(initialLang).subscribe();
  }

  public setLanguage(lang: SupportedLanguage): Observable<any> {
    // 1. Immediately update active language state and localStorage (0ms latency)
    this.currentLangSignal.set(lang);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('app_lang', lang);
    }

    // 2. Fetch fresh JSON in the background to ensure any hot-updates are synced
    return this.fetchJson(lang);
  }

  private fetchJson(lang: SupportedLanguage): Observable<any> {
    return this.http.get<any>(`/i18n/${lang}.json?v=${Date.now()}`).pipe(
      tap((data) => {
        if (data && typeof data === 'object') {
          this.translations[lang] = { ...this.translations[lang], ...data };
        }
      }),
      catchError((err) => {
        // Safe fallback - bundled translations are already active
        return of(this.translations[lang]);
      })
    );
  }

  public translate(pathKey: string, params?: Record<string, string | number>): string {
    if (!pathKey) return '';

    const lang = this.currentLangSignal();
    const activeDict = this.translations[lang] || this.translations['en'];

    // 1. Try nested lookup: 'home.hero.title' -> dict.home.hero.title
    const parts = pathKey.split('.');
    let current: any = activeDict;
    let found = true;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        found = false;
        break;
      }
    }

    // 2. If not found in active language, fallback to English
    if (!found || typeof current !== 'string') {
      let fallbackCurrent: any = this.translations['en'];
      let fallbackFound = true;
      for (const part of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && part in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[part];
        } else {
          fallbackFound = false;
          break;
        }
      }
      if (fallbackFound && typeof fallbackCurrent === 'string') {
        current = fallbackCurrent;
        found = true;
      }
    }

    // 3. Fallback to direct key lookup or key name itself
    let val = found && typeof current === 'string' 
      ? current 
      : (activeDict?.[pathKey] !== undefined ? activeDict[pathKey] : pathKey);

    // 4. Interpolate parameters if any (e.g. {{name}})
    if (params && typeof val === 'string') {
      Object.keys(params).forEach(pKey => {
        val = val.replace(new RegExp(`{{${pKey}}}`, 'g'), String(params[pKey]));
      });
    }

    return val;
  }
}
