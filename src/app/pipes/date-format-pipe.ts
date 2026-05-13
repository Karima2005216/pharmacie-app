import { Pipe, PipeTransform, inject } from '@angular/core';
import { LangueService } from '../core/services/langue';

@Pipe({ name: 'dateFormat', standalone: true, pure: false })
export class DateFormatPipe implements PipeTransform {

  private langueService = inject(LangueService);

  private moisFr = [
    'Janvier', 'Février', 'Mars', 'Avril',
    'Mai', 'Juin', 'Juillet', 'Août',
    'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  private moisAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل',
    'مايو', 'يونيو', 'يوليوز', 'غشت',
    'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
  ];

  private moisEn = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  transform(dateStr: string): string {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    const jour = String(date.getDate()).padStart(2, '0');
    const annee = date.getFullYear();
    const langue = this.langueService.langue();

    let moisNom: string;
    if (langue === 'ar') {
      moisNom = this.moisAr[date.getMonth()];
    } else if (langue === 'en') {
      moisNom = this.moisEn[date.getMonth()];
    } else {
      moisNom = this.moisFr[date.getMonth()];
    }

    return `${jour} ${moisNom} ${annee}`;
  }
}