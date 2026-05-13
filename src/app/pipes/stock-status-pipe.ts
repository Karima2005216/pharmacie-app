// =============================================
// FICHIER: src/app/pipes/stock-status.pipe.ts
// =============================================
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'stockStatus', standalone: true })
export class StockStatusPipe implements PipeTransform {
  transform(quantite: number, seuil: number = 20): string {
    if (quantite === 0)      return 'stock-rupture';
    if (quantite <= seuil)   return 'stock-alerte';
    return 'stock-ok';
  }
}