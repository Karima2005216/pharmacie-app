import { Injectable } from '@angular/core';
import { Medicament } from '../models/medicament';
import { Vente } from '../models/vente';

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportMedicaments(medicaments: Medicament[]): void {
    const headers = [
      'Référence',
      'Nom',
      'Catégorie',
      'Prix (DH)',
      'Quantité',
      'Seuil Alerte',
      'Date Expiration',
      'Ordonnance Requise'
    ];

    const rows = medicaments.map(m => [
      m.reference,
      m.nom,
      m.categorie,
      m.prix,
      m.quantite,
      m.seuilAlerte,
      m.dateExpiration,
      m.ordonnanceRequise ? 'Oui' : 'Non'
    ]);

    this.telecharger(headers, rows, 'medicaments');
  }

  exportVentes(ventes: Vente[]): void {
    const headers = [
      'N°',
      'Client',
      'Date',
      'Nb Articles',
      'Total (DH)',
      'Ordonnance'
    ];

    const rows = ventes.map(v => [
      v.id,
      v.clientNom,
      v.date,
      v.lignesVente.length,
      v.total,
      v.ordonnance ? 'Oui' : 'Non'
    ]);

    this.telecharger(headers, rows, 'ventes');
  }

  private telecharger(
    headers: string[],
    rows: any[],
    nomFichier: string
  ): void {
    const contenu = [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\n');

    const blob = new Blob(
      ['\uFEFF' + contenu],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `${nomFichier}_${new Date().toISOString().split('T')[0]}.csv`;
    lien.click();
    URL.revokeObjectURL(url);
  }
}