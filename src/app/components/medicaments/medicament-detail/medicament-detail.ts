import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MedicamentService } from '../../../core/services/medicament';
import { FournisseurService } from '../../../core/services/fournisseur';
import { Medicament } from '../../../core/models/medicament';
import { Fournisseur } from '../../../core/models/fournisseur';
import { LangueService } from '../../../core/services/langue';

@Component({
  selector: 'app-medicament-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>💊 {{ lang().detailMedicament }}</h1>
        <div class="header-actions">
          <a [routerLink]="['/medicaments', medicament()?.id, 'edit']"
            class="btn-edit">✏️ {{ lang().modifier }}</a>
          <a routerLink="/medicaments" class="btn-back">← {{ lang().retour }}</a>
        </div>
      </div>

      @if (medicament()) {
        <div class="detail-card">
          <div class="detail-header">
            <div>
              <h2>{{ medicament()!.nom }}</h2>
              <code class="ref">{{ medicament()!.reference }}</code>
            </div>
            <span class="badge-cat">{{ medicament()!.categorie }}</span>
          </div>

          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">{{ lang().prix }}</span>
              <span class="value">{{ medicament()!.prix | number:'1.2-2' }} DH</span>
            </div>
            <div class="detail-item">
              <span class="label">{{ lang().stock }}</span>
              <span class="value"
                [class.danger]="medicament()!.quantite <= medicament()!.seuilAlerte">
                {{ medicament()!.quantite }} {{ lang().unites }}
              </span>
            </div>
            <div class="detail-item">
              <span class="label">{{ lang().seuilAlerte }}</span>
              <span class="value">{{ medicament()!.seuilAlerte }} {{ lang().unites }}</span>
            </div>
            <div class="detail-item">
              <span class="label">{{ lang().expiration }}</span>
              <span class="value">{{ medicament()!.dateExpiration }}</span>
            </div>
            <div class="detail-item">
              <span class="label">{{ lang().fournisseur }}</span>
              <span class="value">{{ fournisseur()?.nom || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">{{ lang().ordonnanceRequise }}</span>
              <span class="value">
                {{ medicament()!.ordonnanceRequise ? '✅ ' + lang().oui : '❌ ' + lang().non }}
              </span>
            </div>
          </div>

          @if (medicament()!.description) {
            <div class="description-box">
              <h3>📝 {{ lang().description }}</h3>
              <p>{{ medicament()!.description }}</p>
            </div>
          }
        </div>
      } @else {
        <p class="loading">⏳ {{ lang().chargement }}</p>
      }
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 1.5rem;
    }
    h1 { color: #52B69A; }
    .header-actions { display: flex; gap: 1rem; align-items: center; }
    .btn-edit {
      background: #52B69A; color: white;
      padding: 0.5rem 1rem; border-radius: 8px;
      text-decoration: none; font-weight: 500;
    }
    .btn-back { color: #52B69A; text-decoration: none; font-weight: 500; }
    .detail-card {
      background: white; border-radius: 12px; padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.07);
      border-top: 4px solid #52B69A;
    }
    .detail-header {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: 1.5rem;
      padding-bottom: 1rem; border-bottom: 1px solid #e8f5e9;
    }
    .detail-header h2 { margin: 0 0 0.4rem; color: #52B69A; font-size: 1.4rem; }
    .ref { background: #e8f5e9; color: #52B69A; padding: 0.2rem 0.6rem; border-radius: 4px; }
    .badge-cat { background: #e8f5e9; color: #52B69A; padding: 0.4rem 1rem; border-radius: 20px; font-weight: 500; }
    .detail-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem; margin-bottom: 1.5rem;
    }
    .detail-item { display: flex; flex-direction: column; gap: 0.3rem; }
    .label { font-size: 0.8rem; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { font-weight: 600; font-size: 1rem; color: #333; }
    .value.danger { color: #f44336; }
    .description-box {
      background: #f1f8f1; border-radius: 8px; padding: 1rem;
      margin-top: 1rem; border-left: 4px solid #52B69A;
    }
    .description-box h3 { margin-bottom: 0.5rem; color: #52B69A; font-size: 1rem; }
    .description-box p { color: #555; line-height: 1.6; }
    .loading { text-align: center; color: #999; padding: 3rem; font-size: 1.1rem; }
  `]
})
export class MedicamentDetailComponent implements OnInit {
  medicament = signal<Medicament | null>(null);
  fournisseur = signal<Fournisseur | null>(null);

  lang = computed(() => this.langueService.t());

  constructor(
    private route: ActivatedRoute,
    private medicamentService: MedicamentService,
    private fournisseurService: FournisseurService,
    public langueService: LangueService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.medicamentService.getById(id).subscribe(med => {
      this.medicament.set(med);
      this.fournisseurService.getById(med.fournisseurId).subscribe(f => {
        this.fournisseur.set(f);
      });
    });
  }
}