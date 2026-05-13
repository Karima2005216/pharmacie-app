// =============================================
// FICHIER: src/app/pipes/expiration.pipe.ts
// =============================================
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'expiration', standalone: true })
export class ExpirationPipe implements PipeTransform {
  transform(dateStr: string): string {
    const expiry = new Date(dateStr);
    const now = new Date();
    const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0)  return 'expiry-expired';
    if (diff <= 30) return 'expiry-soon';
    return 'expiry-ok';
  }
}
