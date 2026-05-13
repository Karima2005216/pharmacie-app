// =============================================
// FICHIER: src/app/components/ventes/vente-list/vente-list.ts
// Description: Composant d'affichage et de gestion de la liste des ventes
// Fonctionnalités: statistiques CA, export CSV, suppression, ordonnance
// =============================================

import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { VenteService } from '../../../core/services/vente';
import { Vente } from '../../../core/models/vente';
import { ExportService } from '../../../core/services/export';
import { NotificationService } from '../../../core/services/notification';
import { ConfirmService } from '../../../core/services/confirm';
import { DateFormatPipe } from '../../../pipes/date-format-pipe';
import { LangueService } from '../../../core/services/langue';

@Component({
  selector: 'app-vente-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DateFormatPipe],
  template: `
    <div class="page">

      <!-- ── En-tête de la page ── -->
      <div class="page-header">
        <h1>🧾 {{ lang().ventes }}</h1>
        <div class="header-btns">
          <a routerLink="/ventes/nouvelle" class="btn-primary">
            + {{ lang().nouvelleVente }}
          </a>
          <button (click)="exportCSV()" class="btn-export">
            📤 Export CSV
          </button>
        </div>
      </div>

      <!-- ── Statistiques ── -->
      <div class="stats-bar">
        <div class="stat">
          <span class="stat-value">{{ ventes().length }}</span>
          <span class="stat-label">{{ lang().totalVentes }}</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ totalCA() | number:'1.2-2' }} DH</span>
          <span class="stat-label">{{ lang().chiffreAffaires }}</span>
        </div>
      </div>

      <!-- ── Indicateur de chargement ── -->
      @if (isLoading()) {
        <div class="loading-state">
          <span class="spinner">⏳</span>
          <p>{{ lang().chargement }}</p>
        </div>
      }

      <!-- ── Message d'erreur ── -->
      @if (hasError()) {
        <div class="error-state">
          ❌ {{ lang().erreurMiseAJour }}
        </div>
      }

      <!-- ── Tableau des ventes ── -->
      @if (!isLoading() && !hasError()) {
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{{ lang().clients }}</th>
                <th>{{ lang().date }}</th>
                <th>{{ lang().articles }}</th>
                <th>{{ lang().total }}</th>
                <th>{{ lang().ordonnance }}</th>
                <th>{{ lang().actions }}</th>
              </tr>
            </thead>
            <tbody>
              @for (v of ventes(); track v.id) {
                <tr>
                  <td><strong>#{{ v.id }}</strong></td>
                  <td>
                    <div class="client-name">
                      <span class="avatar">👤</span>
                      {{ v.clientNom }}
                    </div>
                  </td>
                  <td>{{ v.date | dateFormat }}</td>
                  <td>
                    <span class="badge-articles">
                      {{ v.lignesVente.length }} {{ lang().articleS }}
                    </span>
                  </td>
                  <td>
                    <strong class="total">{{ v.total | number:'1.2-2' }} DH</strong>
                  </td>
                  <td>{{ v.ordonnance ? '✅' : '❌' }}</td>
                  <td class="actions">
                    <a [routerLink]="['/ventes', v.id, 'ordonnance']"
                      class="btn-print">🖨️</a>
                    <button (click)="delete(v.id!)" class="btn-delete">🗑</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="empty">{{ lang().aucuneVente }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

    </div>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 1.5rem;
    }
    .header-btns { display: flex; gap: 0.75rem; align-items: center; }
    h1 { color: #52B69A; }
    .btn-primary {
      background: #52B69A; color: white;
      padding: 0.6rem 1.2rem; border-radius: 8px;
      text-decoration: none; font-weight: 600;
    }
    .btn-export {
      background: #e1f5fe; color: #52B69A;
      padding: 0.6rem 1.2rem; border-radius: 8px;
      border: 1px solid #b3e5fc; cursor: pointer; font-weight: 600;
    }
    .btn-export:hover { background: #b3e5fc; }
    .stats-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .stat {
      background: white; padding: 1rem 2rem;
      border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      text-align: center; border-bottom: 3px solid #52B69A;
    }
    .stat-value { display: block; font-size: 1.5rem; font-weight: bold; color: #52B69A; }
    .stat-label { font-size: 0.8rem; color: #999; }
    .loading-state {
      text-align: center; padding: 3rem; color: #52B69A;
      font-size: 1.1rem;
    }
    .loading-state .spinner { font-size: 2rem; display: block; margin-bottom: 0.5rem; }
    .error-state {
      background: #ffebee; color: #f44336;
      padding: 1rem 1.5rem; border-radius: 8px;
      margin-bottom: 1rem; text-align: center;
    }
    .table-container {
      background: white; border-radius: 12px;
      overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.07);
    }
    table { width: 100%; border-collapse: collapse; }
    th { background: #52B69A; color: white; padding: 1rem; text-align: left; font-size: 0.85rem; }
    td { padding: 0.85rem 1rem; border-bottom: 1px solid #f0f0f0; font-size: 0.9rem; }
    tr:hover { background: #f0f8ff; }
    .client-name { display: flex; align-items: center; gap: 0.5rem; }
    .avatar { background: #e1f5fe; padding: 0.3rem; border-radius: 50%; }
    .badge-articles {
      background: #e1f5fe; color: #76C893;
      padding: 0.2rem 0.6rem; border-radius: 20px;
      font-size: 0.8rem; font-weight: 500;
    }
    .total { color: #76C893; font-size: 1rem; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-print {
      background: #e1f5fe; color: #fffefeff;
      padding: 0.3rem 0.6rem; border-radius: 6px;
      text-decoration: none; font-size: 0.9rem;
    }
    .btn-print:hover { background: #b3e5fc; }
    .btn-delete {
      background: #ffebee; color: #f44336;
      padding: 0.3rem 0.6rem; border-radius: 6px;
      border: none; cursor: pointer;
    }
    .empty { text-align: center; color: #999; padding: 2rem; }
  `]
})
export class VenteListComponent implements OnInit {

  // ─── État du composant ────────────────────────────────────────────────────

  /** Liste des ventes chargée depuis l'API */
  ventes = signal<Vente[]>([]);

  /** Chiffre d'affaires total calculé depuis les ventes */
  totalCA = signal(0);

  /** Indicateur de chargement affiché pendant les appels API */
  isLoading = signal(false);

  /** Indicateur d'erreur en cas d'échec de l'API */
  hasError = signal(false);

  // ─── Computed Signals ─────────────────────────────────────────────────────

  /** Traductions réactives selon la langue active */
  lang = computed(() => this.langueService.t());

  // ─── Constructeur ─────────────────────────────────────────────────────────

  constructor(
    private venteService: VenteService,
    private exportService: ExportService,
    private notif: NotificationService,
    private confirmService: ConfirmService,
    public langueService: LangueService
  ) {}

  // ─── Cycle de vie ─────────────────────────────────────────────────────────

  /**
   * Initialisation: chargement de toutes les ventes
   * avec calcul du chiffre d'affaires total
   */
  ngOnInit(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.venteService.getAll().subscribe({
      next: (data) => {
        this.ventes.set(data);
        // Calcul du CA total par réduction des totaux individuels
        this.totalCA.set(data.reduce((sum, v) => sum + v.total, 0));
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
        this.notif.info(this.lang().erreurMiseAJour);
      }
    });
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * Exporte la liste des ventes en format CSV
   */
  exportCSV(): void {
    this.exportService.exportVentes(this.ventes());
    this.notif.info('Export CSV téléchargé !');
  }

  /**
   * Supprime une vente après confirmation de l'utilisateur
   * Met à jour le CA total après suppression
   * @param id - Identifiant de la vente à supprimer
   */
  async delete(id: number): Promise<void> {
    const confirmed = await this.confirmService.open({
      titre: this.lang().supprimerVente,
      message: this.lang().confirmSupprimerVente,
      btnConfirm: '🗑️ ' + this.lang().supprimer,
      btnCancel: this.lang().annuler
    });

    if (confirmed) {
      this.venteService.delete(id).subscribe({
        next: () => {
          // Mise à jour locale sans rechargement complet
          const updated = this.ventes().filter(v => v.id !== id);
          this.ventes.set(updated);
          // Recalcul du CA après suppression
          this.totalCA.set(updated.reduce((sum, v) => sum + v.total, 0));
          this.notif.success(this.lang().venteSupprimee);
        },
        error: () => {
          this.notif.info(this.lang().erreurMiseAJour);
        }
      });
    }
  }
}