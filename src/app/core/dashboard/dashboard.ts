import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MedicamentService } from '../../core/services/medicament';
import { VenteService } from '../../core/services/vente';
import { ClientService } from '../../core/services/client';
import { FournisseurService } from '../../core/services/fournisseur';
import { LangueService } from '../../core/services/langue';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="dashboard">
      <h1>📊 {{ lang().tableauDeBord }}</h1>

      <div class="kpi-grid">
        <div class="kpi-card blue">
          <div class="kpi-icon">💊</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ medicamentService.medicaments().length }}</span>
            <span class="kpi-label">{{ lang().medicaments }}</span>
          </div>
        </div>
        <div class="kpi-card red">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ medicamentService.alertes().length }}</span>
            <span class="kpi-label">{{ lang().alertesStock }}</span>
          </div>
        </div>
        <div class="kpi-card orange">
          <div class="kpi-icon">📅</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ medicamentService.expiresBientot().length }}</span>
            <span class="kpi-label">{{ lang().expirentBientot }}</span>
          </div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-icon">🧾</div>
          <div class="kpi-info">
            <span class="kpi-value">{{ totalVentes() | number:'1.2-2' }} DH</span>
            <span class="kpi-label">{{ lang().chiffreAffaires }}</span>
          </div>
        </div>
      </div>

      @if (medicamentService.alertes().length > 0) {
        <div class="section">
          <h2>⚠️ {{ lang().alertesStock }}</h2>
          <div class="alert-list">
            @for (med of medicamentService.alertes(); track med.id) {
              <div class="alert-item">
                <span class="med-name">{{ med.nom }}</span>
                <span class="med-qty danger">
                  {{ med.quantite }} {{ lang().unitesRestantes }}
                </span>
                <a [routerLink]="['/medicaments', med.id, 'edit']" class="btn-fix">
                  {{ lang().mettreAJour }}
                </a>
              </div>
            }
          </div>
        </div>
      }

      @if (medicamentService.expiresBientot().length > 0) {
        <div class="section">
          <h2>📅 {{ lang().expirentBientot }}</h2>
          <div class="alert-list">
            @for (med of medicamentService.expiresBientot(); track med.id) {
              <div class="alert-item expiry">
                <span class="med-name">{{ med.nom }}</span>
                <span class="med-qty warning">
                  {{ lang().expireLe }} : {{ med.dateExpiration }}
                </span>
              </div>
            }
          </div>
        </div>
      }

      <div class="section">
        <h2>🚀 {{ lang().actionsRapides }}</h2>
        <div class="shortcuts-grid">
          <a routerLink="/medicaments/nouveau" class="shortcut-btn blue">
            {{ lang().nouveauMedicament }}
          </a>
          <a routerLink="/ventes/nouvelle" class="shortcut-btn green">
            {{ lang().nouvelleVente }}
          </a>
          <a routerLink="/clients/nouveau" class="shortcut-btn purple">
            {{ lang().nouveauClient }}
          </a>
          <a routerLink="/fournisseurs/nouveau" class="shortcut-btn orange">
            {{ lang().nouveauFournisseur }}
          </a>
        </div>
      </div>

      <!-- Statistiques supplémentaires avec computed() -->
      <div class="section">
        <h2>📊 {{ lang().dernieresVentes }}</h2>
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-value">{{ nbClients() }}</span>
            <span class="stat-label">{{ lang().clients }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ nbFournisseurs() }}</span>
            <span class="stat-label">{{ lang().fournisseurs }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ totalVentes() | number:'1.2-2' }} DH</span>
            <span class="stat-label">{{ lang().totalVentes }}</span>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard { max-width: 1100px; }
    h1 { color: #52B69A; margin-bottom: 1.5rem; font-size: 1.6rem; }
    h2 { color: #333; margin-bottom: 1rem; font-size: 1.05rem; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem; margin-bottom: 2rem;
    }
    .kpi-card {
      display: flex; align-items: center; gap: 1rem;
      padding: 1.5rem; border-radius: 12px; color: white;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .kpi-card.blue   { background: linear-gradient(135deg, #52B69A, #34a085); }
    .kpi-card.red    { background: linear-gradient(135deg, #f44336, #c62828); }
    .kpi-card.orange { background: linear-gradient(135deg, #ff9800, #e65100); }
    .kpi-card.green  { background: linear-gradient(135deg, #76C893, #52B69A); }
    .kpi-icon { font-size: 2rem; }
    .kpi-value { display: block; font-size: 1.6rem; font-weight: bold; }
    .kpi-label { font-size: 0.85rem; opacity: 0.9; }
    .section {
      background: white; border-radius: 12px;
      padding: 1.5rem; margin-bottom: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.07);
    }
    .alert-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .alert-item {
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem; background: #f8f9fa;
      border-radius: 8px; border-left: 4px solid #f44336;
    }
    .alert-item.expiry { border-left-color: #ff9800; }
    .med-name { font-weight: 600; }
    .med-qty.danger  { color: #f44336; font-weight: bold; }
    .med-qty.warning { color: #ff9800; font-weight: bold; }
    .btn-fix {
      background: #52B69A; color: white;
      padding: 0.3rem 0.8rem; border-radius: 6px;
      text-decoration: none; font-size: 0.85rem;
    }
    .shortcuts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }
    .shortcut-btn {
      display: block; text-align: center; padding: 1rem;
      border-radius: 10px; color: white; text-decoration: none;
      font-weight: 600; transition: transform 0.2s;
    }
    .shortcut-btn:hover { transform: translateY(-2px); }
    .shortcut-btn.blue   { background: #52B69A; }
    .shortcut-btn.green  { background: #76C893; }
    .shortcut-btn.purple { background: #6a1b9a; }
    .shortcut-btn.orange { background: #e65100; }
    .stats-row {
      display: flex; gap: 2rem; flex-wrap: wrap;
    }
    .stat-item {
      display: flex; flex-direction: column;
      align-items: center; gap: 0.3rem;
    }
    .stat-value { font-size: 1.5rem; font-weight: bold; color: #52B69A; }
    .stat-label { font-size: 0.85rem; color: #999; }
  `]
})
export class DashboardComponent implements OnInit {
  totalVentes    = signal(0);
  nbClients      = signal(0);
  nbFournisseurs = signal(0);

  // computed() — مثال واضح للباريم
  hasAlertes = computed(() => this.medicamentService.alertes().length > 0);
  hasExpires = computed(() => this.medicamentService.expiresBientot().length > 0);

  lang = computed(() => this.langueService.t());

  constructor(
    public medicamentService: MedicamentService,
    private venteService: VenteService,
    private clientService: ClientService,
    private fournisseurService: FournisseurService,
    public langueService: LangueService
  ) {}

  ngOnInit(): void {
    this.venteService.getAll().subscribe(ventes => {
      this.totalVentes.set(ventes.reduce((sum, v) => sum + v.total, 0));
    });
    this.clientService.getAll().subscribe(c => this.nbClients.set(c.length));
    this.fournisseurService.getAll().subscribe(f => this.nbFournisseurs.set(f.length));
  }
}