// =============================================
// FICHIER: src/app/components/dashboard/dashboard.ts
// Description: Tableau de bord principal de l'application PharmaGest
// Affiche les KPIs, alertes stock, expirations, dernières ventes et top médicaments
// =============================================

import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MedicamentService } from '../../core/services/medicament';
import { VenteService } from '../../core/services/vente';
import { ClientService } from '../../core/services/client';
import { FournisseurService } from '../../core/services/fournisseur';
import { ChartsComponent } from './charts/charts';
import { Vente } from '../../core/models/vente';
import { DateFormatPipe } from '../../pipes/date-format-pipe';
import { LangueService } from '../../core/services/langue';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, ChartsComponent, DateFormatPipe],
  template: `
    <div class="dashboard">

      <!-- ── Titre principal ── -->
      <h1>📊 {{ lang().tableauDeBord }}</h1>

      <!-- ── Indicateur de chargement global ── -->
      @if (isLoading()) {
        <div class="loading-state">
          <p>⏳ {{ lang().chargement }}</p>
        </div>
      }

      @if (!isLoading()) {

        <!-- ── KPI Cards — Ligne 1: Médicaments ── -->
        <div class="kpi-grid">
          <div class="kpi-card card1">
            <div class="kpi-icon">💊</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ medicamentService.medicaments().length }}</span>
              <span class="kpi-label">{{ lang().medicaments }}</span>
            </div>
          </div>
          <div class="kpi-card card2">
            <div class="kpi-icon">⚠️</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ medicamentService.alertes().length }}</span>
              <span class="kpi-label">{{ lang().alertesStock }}</span>
            </div>
          </div>
          <div class="kpi-card card3">
            <div class="kpi-icon">📅</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ medicamentService.expiresBientot().length }}</span>
              <span class="kpi-label">{{ lang().expirentBientot }}</span>
            </div>
          </div>
          <div class="kpi-card card4">
            <div class="kpi-icon">🧾</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ totalVentes() | number:'1.2-2' }} DH</span>
              <span class="kpi-label">{{ lang().chiffreAffaires }}</span>
            </div>
          </div>
        </div>

        <!-- ── KPI Cards — Ligne 2: Statistiques générales ── -->
        <div class="kpi-grid">
          <div class="kpi-card card1">
            <div class="kpi-icon">👥</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ nbClients() }}</span>
              <span class="kpi-label">{{ lang().clients }}</span>
            </div>
          </div>
          <div class="kpi-card card2">
            <div class="kpi-icon">🏭</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ nbFournisseurs() }}</span>
              <span class="kpi-label">{{ lang().fournisseurs }}</span>
            </div>
          </div>
          <div class="kpi-card card3">
            <div class="kpi-icon">🛒</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ nbVentes() }}</span>
              <span class="kpi-label">{{ lang().totalVentes }}</span>
            </div>
          </div>
          <div class="kpi-card card4">
            <div class="kpi-icon">💰</div>
            <div class="kpi-info">
              <span class="kpi-value">{{ ventesAujourdhui() | number:'1.2-2' }} DH</span>
              <span class="kpi-label">{{ lang().ventesAujourdhui }}</span>
            </div>
          </div>
        </div>

        <!-- ── Top 3 médicaments les plus vendus ── -->
        @if (topMedicaments().length > 0) {
          <div class="section">
            <h2>🏆 {{ lang().top3 }}</h2>
            <div class="top-list">
              @for (item of topMedicaments(); track item.nom; let i = $index) {
                <div class="top-item">
                  <span class="top-rank">
                    {{ i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉' }}
                  </span>
                  <span class="top-nom">{{ item.nom }}</span>
                  <span class="top-qty">{{ item.quantite }} {{ lang().vendus }}</span>
                  <div class="top-bar">
                    <div class="top-bar-fill"
                      [style.width.%]="(item.quantite / topMedicaments()[0].quantite) * 100">
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- ── Alertes de stock ── -->
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

        <!-- ── Médicaments expirant bientôt ── -->
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

        <!-- ── Dernières ventes ── -->
        @if (dernieresVentes().length > 0) {
          <div class="section">
            <h2>🕐 {{ lang().dernieresVentes }}</h2>
            <div class="ventes-list">
              @for (v of dernieresVentes(); track v.id) {
                <div class="vente-item">
                  <span class="vente-icon">🧾</span>
                  <div class="vente-info">
                    <span class="vente-client">{{ v.clientNom }}</span>
                    <span class="vente-date">{{ v.date | dateFormat }}</span>
                  </div>
                  <span class="vente-total">{{ v.total | number:'1.2-2' }} DH</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- ── Actions rapides ── -->
        <div class="section">
          <h2>🚀 {{ lang().actionsRapides }}</h2>
          <div class="shortcuts-grid">
            <a routerLink="/medicaments/nouveau" class="shortcut-btn btn1">
              {{ lang().nouveauMedicament }}
            </a>
            <a routerLink="/ventes/nouvelle" class="shortcut-btn btn2">
              {{ lang().nouvelleVente }}
            </a>
            <a routerLink="/clients/nouveau" class="shortcut-btn btn3">
              {{ lang().nouveauClient }}
            </a>
            <a routerLink="/fournisseurs/nouveau" class="shortcut-btn btn4">
              {{ lang().nouveauFournisseur }}
            </a>
          </div>
        </div>

        <!-- ── Graphiques ── -->
        <app-charts />

      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1100px; }
    h1 { color: #52B69A; margin-bottom: 1.5rem; font-size: 1.6rem; }
    h2 { color: #52B69A; margin-bottom: 1rem; font-size: 1.05rem; }
    .loading-state { text-align: center; padding: 4rem; color: #52B69A; font-size: 1.2rem; }
    .kpi-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem; margin-bottom: 1.5rem;
    }
    .kpi-card {
      display: flex; align-items: center; gap: 1rem;
      padding: 1.5rem; border-radius: 12px; color: white;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .kpi-card.card1 { background: linear-gradient(135deg, #1f7059ff, #52B69A); }
    .kpi-card.card2 { background: linear-gradient(135deg, #1f7059ff, #52B69A); }
    .kpi-card.card3 { background: linear-gradient(135deg, #1f7059ff, #52B69A); }
    .kpi-card.card4 { background: linear-gradient(135deg, #1f7059ff, #52B69A); }
    .kpi-icon { font-size: 2rem; }
    .kpi-value { display: block; font-size: 1.6rem; font-weight: bold; }
    .kpi-label { font-size: 0.85rem; opacity: 0.9; }
    .section {
      background: white; border-radius: 12px; padding: 1.5rem;
      margin-bottom: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.07);
      border-left: 4px solid #52B69A;
    }
    .top-list { display: flex; flex-direction: column; gap: 1rem; }
    .top-item {
      display: grid; grid-template-columns: 2rem 1fr auto 200px;
      align-items: center; gap: 1rem; padding: 0.5rem 0;
    }
    .top-rank { font-size: 1.3rem; }
    .top-nom { font-weight: 600; color: #333; }
    .top-qty { color: #52B69A; font-weight: bold; font-size: 0.9rem; white-space: nowrap; }
    .top-bar { background: #f0f0f0; border-radius: 20px; height: 8px; overflow: hidden; }
    .top-bar-fill { background: #52B69A; height: 100%; border-radius: 20px; transition: width 0.5s ease; }
    .alert-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .alert-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.75rem 1rem; background: #f8f9fa;
      border-radius: 8px; border-left: 4px solid #52B69A;
    }
    .alert-item.expiry { border-left-color: #ff9800; }
    .med-name { font-weight: 600; }
    .med-qty.danger { color: #f44336; font-weight: bold; }
    .med-qty.warning { color: #ff9800; font-weight: bold; }
    .btn-fix {
      background: #52B69A; color: white; padding: 0.3rem 0.8rem;
      border-radius: 6px; text-decoration: none; font-size: 0.85rem;
    }
    .ventes-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .vente-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; background: #f8f9fa; border-radius: 8px; }
    .vente-icon { font-size: 1.3rem; }
    .vente-info { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
    .vente-client { font-weight: 600; color: #333; font-size: 0.9rem; }
    .vente-date { color: #999; font-size: 0.8rem; }
    .vente-total { font-weight: bold; color: #52B69A; }
    .shortcuts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .shortcut-btn {
      display: block; text-align: center; padding: 1rem; border-radius: 10px;
      color: white; text-decoration: none; font-weight: 600; transition: transform 0.2s;
    }
    .shortcut-btn:hover { transform: translateY(-2px); }
    .shortcut-btn.btn1 { background: #1f7059ff; }
    .shortcut-btn.btn2 { background: #1f7059ff; }
    .shortcut-btn.btn3 { background: #1f7059ff; }
    .shortcut-btn.btn4 { background: #1f7059ff; }
  `]
})
export class DashboardComponent implements OnInit {

  // ─── Signals d'état ───────────────────────────────────────────────────────

  /** Chiffre d'affaires total de toutes les ventes */
  totalVentes = signal(0);

  /** Nombre total de clients enregistrés */
  nbClients = signal(0);

  /** Nombre total de fournisseurs enregistrés */
  nbFournisseurs = signal(0);

  /** Nombre total de ventes enregistrées */
  nbVentes = signal(0);

  /** Chiffre d'affaires des ventes du jour */
  ventesAujourdhui = signal(0);

  /** Les 5 dernières ventes triées par date décroissante */
  dernieresVentes = signal<Vente[]>([]);

  /** Top 3 médicaments les plus vendus */
  topMedicaments = signal<{nom: string, quantite: number}[]>([]);

  /** Indicateur de chargement global */
  isLoading = signal(false);

  // ─── Computed Signals ─────────────────────────────────────────────────────

  /** Traductions réactives selon la langue active */
  lang = computed(() => this.langueService.t());

  /** Vérifie s'il existe des alertes stock — utilisé pour l'affichage conditionnel */
  hasAlertes = computed(() => this.medicamentService.alertes().length > 0);

  /** Vérifie s'il existe des médicaments expirant bientôt */
  hasExpires = computed(() => this.medicamentService.expiresBientot().length > 0);

  // ─── Constructeur ─────────────────────────────────────────────────────────

  constructor(
    public medicamentService: MedicamentService,
    private venteService: VenteService,
    private clientService: ClientService,
    private fournisseurService: FournisseurService,
    public langueService: LangueService
  ) {}

  // ─── Cycle de vie ─────────────────────────────────────────────────────────

  /**
   * Initialisation: chargement parallèle de toutes les données du dashboard
   * - Ventes: CA total, ventes du jour, dernières ventes, top médicaments
   * - Clients: nombre total
   * - Fournisseurs: nombre total
   */
  ngOnInit(): void {
    this.isLoading.set(true);

    // Chargement des ventes et calcul des statistiques
    this.venteService.getAll().subscribe({
      next: (ventes) => {
        // Calcul du CA total
        this.totalVentes.set(ventes.reduce((sum, v) => sum + v.total, 0));
        this.nbVentes.set(ventes.length);

        // Calcul des ventes du jour uniquement
        const today = new Date().toISOString().split('T')[0];
        const ventesToday = ventes.filter(v => v.date === today);
        this.ventesAujourdhui.set(
          ventesToday.reduce((sum, v) => sum + v.total, 0)
        );

        // Tri des 5 dernières ventes par date décroissante
        this.dernieresVentes.set(
          [...ventes].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ).slice(0, 5)
        );

        // Calcul du top 3 médicaments vendus
        const compteur: Record<string, number> = {};
        ventes.forEach(v => {
          v.lignesVente.forEach(l => {
            compteur[l.medicamentNom] =
              (compteur[l.medicamentNom] || 0) + l.quantite;
          });
        });
        const top = Object.entries(compteur)
          .map(([nom, quantite]) => ({ nom, quantite }))
          .sort((a, b) => b.quantite - a.quantite)
          .slice(0, 3);
        this.topMedicaments.set(top);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });

    // Chargement du nombre de clients
    this.clientService.getAll().subscribe({
      next: (c) => this.nbClients.set(c.length),
      error: () => {}
    });

    // Chargement du nombre de fournisseurs
    this.fournisseurService.getAll().subscribe({
      next: (f) => this.nbFournisseurs.set(f.length),
      error: () => {}
    });
  }
}