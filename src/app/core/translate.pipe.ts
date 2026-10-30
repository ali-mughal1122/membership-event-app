import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from './translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Pure: false ensures templates immediately react when language changes
})
export class TranslatePipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(key: string, params?: Record<string, string | number>): string {
    // Read the signal so zoneless change detection re-evaluates when currentLang changes
    this.translationService.currentLang();
    return this.translationService.translate(key, params);
  }
}
