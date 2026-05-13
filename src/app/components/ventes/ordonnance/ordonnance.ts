import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, UpperCasePipe } from '@angular/common';
import { VenteService } from '../../../core/services/vente';
import { Vente } from '../../../core/models/vente';
import { DateFormatPipe } from '../../../pipes/date-format-pipe';
import { LangueService } from '../../../core/services/langue';

@Component({
  selector: 'app-ordonnance',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DateFormatPipe, UpperCasePipe],
  template: `
    @if (vente()) {
      <div class="page-actions no-print">
        <a routerLink="/ventes" class="btn-back">← {{ lang().retour }}</a>
        <button (click)="imprimer()" class="btn-print">
          🖨️ {{ lang().imprimerOrdonnance }}
        </button>
      </div>

      <div class="ordonnance" id="ordonnance">

        <div class="header">
          <div class="pharmacie-info">
            <h1>💊 PharmaGest</h1>
            <p>Pharmacie Centrale</p>
            <p>📍 Meknès, Maroc</p>
            <p>📞 0535 000 000</p>
          </div>
          <div class="ordonnance-info">
            <h2>{{ lang().ordonnance | uppercase }}</h2>
            <p><strong>N°:</strong> #{{ vente()!.id }}</p>
            <p><strong>{{ lang().date }}:</strong> {{ vente()!.date | dateFormat }}</p>
            <p>
              <strong>{{ lang().avecOrdonnance }}:</strong>
              {{ vente()!.ordonnance ? '✅ ' + lang().oui : '❌ ' + lang().non }}
            </p>
          </div>
        </div>

        <hr />

        <div class="client-section">
          <h3>👤 {{ lang().patient }}</h3>
          <p><strong>{{ lang().nom }}:</strong> {{ vente()!.clientNom }}</p>
        </div>

        <hr />

        <div class="medicaments-section">
          <h3>💊 {{ lang().medicamentsPrescrits }}</h3>
          <table>
            <thead>
              <tr>
                <th>{{ lang().medicament }}</th>
                <th>{{ lang().quantite }}</th>
                <th>{{ lang().prixUnite }}</th>
                <th>{{ lang().sousTotal }}</th>
              </tr>
            </thead>
            <tbody>
              @for (ligne of vente()!.lignesVente; track ligne.medicamentId) {
                <tr>
                  <td>{{ ligne.medicamentNom }}</td>
                  <td>{{ ligne.quantite }}</td>
                  <td>{{ ligne.prixUnitaire | number:'1.2-2' }} DH</td>
                  <td>{{ ligne.quantite * ligne.prixUnitaire | number:'1.2-2' }} DH</td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3"><strong>{{ lang().total }}</strong></td>
                <td><strong>{{ vente()!.total | number:'1.2-2' }} DH</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <hr />

        <div class="footer">
          <div class="signature">
            <p>{{ lang().signaturePharmacien }}</p>
            <div class="signature-box"></div>
          </div>
          <div class="cachet">
            <p>{{ lang().cachetPharmacie }}</p>
            <div class="cachet-box">💊 PharmaGest</div>
          </div>
        </div>

        <div class="bas-page">
          <p>{{ lang().merciConfiance }}</p>
        </div>

      </div>
    } @else {
      <p class="loading">⏳ {{ lang().chargement }}</p>
    }
  `,
  styles: [`
    .page-actions {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 1.5rem;
    }
    .btn-back { color: #52B69A; text-decoration: none; font-weight: 500; }
    .btn-print {
      background: #52B69A; color: white;
      padding: 0.7rem 1.5rem; border: none;
      border-radius: 8px; cursor: pointer;
      font-size: 1rem; font-weight: 600;
    }
    .ordonnance {
      background: white; max-width: 800px;
      margin: 0 auto; padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 15px rgba(0,0,0,0.1);
      border-top: 6px solid #52B69A;
    }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .pharmacie-info h1 { color: #52B69A; font-size: 1.5rem; margin-bottom: 0.3rem; }
    .pharmacie-info p { color: #555; font-size: 0.9rem; margin: 0.2rem 0; }
    .ordonnance-info { text-align: right; }
    .ordonnance-info h2 { color: #52B69A; font-size: 1.3rem; margin-bottom: 0.5rem; letter-spacing: 2px; }
    .ordonnance-info p { font-size: 0.9rem; margin: 0.2rem 0; }
    hr { border: none; border-top: 1px solid #e1f5fe; margin: 1rem 0; }
    .client-section, .medicaments-section { margin: 1rem 0; }
    .client-section h3, .medicaments-section h3 { color: #52B69A; margin-bottom: 0.75rem; font-size: 1rem; }
    .client-section p { font-size: 0.95rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    th { background: #52B69A; color: white; padding: 0.75rem 1rem; text-align: left; font-size: 0.85rem; }
    td { padding: 0.75rem 1rem; border-bottom: 1px solid #e1f5fe; font-size: 0.9rem; }
    tr:hover td { background: #f0f8ff; }
    tfoot td { background: #e1f5fe; font-size: 1rem; border-bottom: none; }
    .footer { display: flex; justify-content: space-between; margin-top: 2rem; }
    .signature p, .cachet p { font-size: 0.85rem; color: #555; margin-bottom: 0.5rem; }
    .signature-box { width: 180px; height: 80px; border: 1px dashed #b3e5fc; border-radius: 8px; }
    .cachet-box {
      width: 180px; height: 80px; border: 2px solid #52B69A;
      border-radius: 50%; display: flex; align-items: center;
      justify-content: center; color: #52B69A; font-weight: bold;
    }
    .bas-page { text-align: center; margin-top: 2rem; color: #999; font-size: 0.8rem; }
    .loading { text-align: center; color: #999; padding: 3rem; }
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; }
      .ordonnance { box-shadow: none !important; border-radius: 0 !important; max-width: 100% !important; }
    }
  `]
})
export class OrdonnanceComponent implements OnInit {
  vente = signal<Vente | null>(null);

  lang = computed(() => this.langueService.t());

  constructor(
    private route: ActivatedRoute,
    private venteService: VenteService,
    public langueService: LangueService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.venteService.getById(id).subscribe(v => this.vente.set(v));
  }

  imprimer(): void {
    window.print();
  }
}