import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MedicamentService } from '../../core/services/medicament';
import { ClientService } from '../../core/services/client';
import { VenteService } from '../../core/services/vente';
import { FournisseurService } from '../../core/services/fournisseur';
import { Medicament } from '../../core/models/medicament';
import { Client } from '../../core/models/client';
import { Vente } from '../../core/models/vente';
import { Fournisseur } from '../../core/models/fournisseur';
import { LangueService } from '../../core/services/langue';

@Component({
  selector: 'app-recherche',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe],
  template: `
    <div class="page">
      <h1>🔍 {{ lang().rechercheGlobale }}</h1>

      <div class="search-box">
        <input
          [(ngModel)]="terme"
          (ngModelChange)="rechercher()"
          [placeholder]="lang().rechercherPlaceholder"
          class="search-input"
          autofocus
        />
        <span class="search-icon">🔍</span>
      </div>

      @if (terme.length >= 2) {
        <div class="resultats-count">
          {{ totalResultats() }} {{ lang().resultats }} "{{ terme }}"
        </div>

        @if (medicaments().length > 0) {
          <div class="section">
            <h2>💊 {{ lang().medicaments }} ({{ medicaments().length }})</h2>
            <div class="results-grid">
              @for (m of medicaments(); track m.id) {
                <a [routerLink]="['/medicaments', m.id]" class="result-card">
                  <div class="result-icon">💊</div>
                  <div class="result-info">
                    <span class="result-title">{{ m.nom }}</span>
                    <span class="result-sub">{{ m.reference }} • {{ m.categorie }}</span>
                    <span class="result-detail">{{ m.prix | number:'1.2-2' }} DH — {{ m.quantite }} {{ lang().unites }}</span>
                  </div>
                  <span class="result-arrow">→</span>
                </a>
              }
            </div>
          </div>
        }

        @if (clients().length > 0) {
          <div class="section">
            <h2>👥 {{ lang().clients }} ({{ clients().length }})</h2>
            <div class="results-grid">
              @for (c of clients(); track c.id) {
                <a [routerLink]="['/clients', c.id, 'edit']" class="result-card">
                  <div class="result-icon">👤</div>
                  <div class="result-info">
                    <span class="result-title">{{ c.nom }}</span>
                    <span class="result-sub">{{ c.telephone }}</span>
                    <span class="result-detail">{{ c.email }}</span>
                  </div>
                  <span class="result-arrow">→</span>
                </a>
              }
            </div>
          </div>
        }

        @if (fournisseurs().length > 0) {
          <div class="section">
            <h2>🏭 {{ lang().fournisseurs }} ({{ fournisseurs().length }})</h2>
            <div class="results-grid">
              @for (f of fournisseurs(); track f.id) {
                <a [routerLink]="['/fournisseurs', f.id, 'edit']" class="result-card">
                  <div class="result-icon">🏭</div>
                  <div class="result-info">
                    <span class="result-title">{{ f.nom }}</span>
                    <span class="result-sub">{{ f.ville }}</span>
                    <span class="result-detail">{{ f.telephone }}</span>
                  </div>
                  <span class="result-arrow">→</span>
                </a>
              }
            </div>
          </div>
        }

        @if (ventes().length > 0) {
          <div class="section">
            <h2>🧾 {{ lang().ventes }} ({{ ventes().length }})</h2>
            <div class="results-grid">
              @for (v of ventes(); track v.id) {
                <a [routerLink]="['/ventes', v.id, 'ordonnance']" class="result-card">
                  <div class="result-icon">🧾</div>
                  <div class="result-info">
                    <span class="result-title">{{ v.clientNom }}</span>
                    <span class="result-sub">{{ v.date }}</span>
                    <span class="result-detail">{{ v.total | number:'1.2-2' }} DH</span>
                  </div>
                  <span class="result-arrow">→</span>
                </a>
              }
            </div>
          </div>
        }

        @if (totalResultats() === 0) {
          <div class="no-results">
            <span class="no-results-icon">🔍</span>
            <p>{{ lang().aucunResultat }} "{{ terme }}"</p>
            <span>{{ lang().essayerAutres }}</span>
          </div>
        }

      } @else if (terme.length > 0) {
        <p class="hint">{{ lang().minCaracteres }}</p>
      } @else {
        <div class="suggestions">
          <h3>💡 {{ lang().suggestions }}</h3>
          <div class="suggestions-grid">
            <span (click)="terme='Doliprane'; rechercher()" class="suggestion">Doliprane</span>
            <span (click)="terme='Ahmed'; rechercher()" class="suggestion">Ahmed</span>
            <span (click)="terme='Antibiotique'; rechercher()" class="suggestion">Antibiotique</span>
            <span (click)="terme='PharmaCo'; rechercher()" class="suggestion">PharmaCo</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    h1 { color: #52B69A; margin-bottom: 1.5rem; }
    h2 { color: #52B69A; margin-bottom: 1rem; font-size: 1rem; }
    h3 { color: #52B69A; margin-bottom: 1rem; font-size: 0.95rem; }
    .search-box { position: relative; margin-bottom: 1.5rem; }
    .search-input {
      width: 100%; padding: 1rem 3rem 1rem 1.5rem;
      border: 2px solid #52B69A; border-radius: 12px;
      font-size: 1.1rem; box-sizing: border-box; transition: all 0.2s;
    }
    .search-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(82,182,154,0.2); }
    .search-icon { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); font-size: 1.2rem; }
    .resultats-count { color: #999; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .section {
      background: white; border-radius: 12px; padding: 1.5rem;
      margin-bottom: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.07);
      border-left: 4px solid #52B69A;
    }
    .results-grid { display: flex; flex-direction: column; gap: 0.75rem; }
    .result-card {
      display: flex; align-items: center; gap: 1rem;
      padding: 0.85rem 1rem; background: #f8f9fa;
      border-radius: 8px; text-decoration: none;
      color: #333; transition: all 0.2s;
    }
    .result-card:hover { background: #e8f5e9; transform: translateX(4px); }
    .result-icon { font-size: 1.5rem; }
    .result-info { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
    .result-title { font-weight: 600; font-size: 0.95rem; }
    .result-sub { color: #666; font-size: 0.85rem; }
    .result-detail { color: #52B69A; font-size: 0.8rem; font-weight: 500; }
    .result-arrow { color: #52B69A; font-size: 1.2rem; }
    .no-results { text-align: center; padding: 3rem; background: white; border-radius: 12px; }
    .no-results-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }
    .no-results p { color: #333; font-weight: 600; margin-bottom: 0.5rem; }
    .no-results span { color: #999; font-size: 0.9rem; }
    .hint { color: #999; font-size: 0.9rem; }
    .suggestions { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.07); }
    .suggestions-grid { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .suggestion {
      background: #e8f5e9; color: #52B69A; padding: 0.5rem 1rem;
      border-radius: 20px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;
    }
    .suggestion:hover { background: #52B69A; color: white; }
  `]
})
export class RechercheComponent {

  lang = computed(() => this.langueService.t());

  terme = '';
  medicaments = signal<Medicament[]>([]);
  clients = signal<Client[]>([]);
  ventes = signal<Vente[]>([]);
  fournisseurs = signal<Fournisseur[]>([]);

  allMedicaments: Medicament[] = [];
  allClients: Client[] = [];
  allVentes: Vente[] = [];
  allFournisseurs: Fournisseur[] = [];

  totalResultats = signal(0);

  constructor(
    private medicamentService: MedicamentService,
    private clientService: ClientService,
    private venteService: VenteService,
    private fournisseurService: FournisseurService,
    public langueService: LangueService
  ) {
    this.medicamentService.getAll().subscribe(d => this.allMedicaments = d);
    this.clientService.getAll().subscribe(d => this.allClients = d);
    this.venteService.getAll().subscribe(d => this.allVentes = d);
    this.fournisseurService.getAll().subscribe(d => this.allFournisseurs = d);
  }

  rechercher(): void {
    if (this.terme.length < 2) {
      this.medicaments.set([]);
      this.clients.set([]);
      this.ventes.set([]);
      this.fournisseurs.set([]);
      this.totalResultats.set(0);
      return;
    }

    const t = this.terme.toLowerCase();

    const meds = this.allMedicaments.filter(m =>
      m.nom.toLowerCase().includes(t) ||
      m.reference.toLowerCase().includes(t) ||
      m.categorie.toLowerCase().includes(t)
    );

    const clients = this.allClients.filter(c =>
      c.nom.toLowerCase().includes(t) ||
      c.telephone.includes(t) ||
      c.email.toLowerCase().includes(t)
    );

    const ventes = this.allVentes.filter(v =>
      v.clientNom.toLowerCase().includes(t) ||
      v.date.includes(t)
    );

    const fournisseurs = this.allFournisseurs.filter(f =>
      f.nom.toLowerCase().includes(t) ||
      f.ville.toLowerCase().includes(t)
    );

    this.medicaments.set(meds);
    this.clients.set(clients);
    this.ventes.set(ventes);
    this.fournisseurs.set(fournisseurs);
    this.totalResultats.set(
      meds.length + clients.length + ventes.length + fournisseurs.length
    );
  }
}