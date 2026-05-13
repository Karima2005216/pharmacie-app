// =============================================
// FICHIER: src/app/components/fournisseurs/fournisseur-list/fournisseur-list.ts
// Description: Composant d'affichage et de gestion de la liste des fournisseurs
// Fonctionnalités: recherche, affichage en cards, suppression
// =============================================

import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FournisseurService } from '../../../core/services/fournisseur';
import { Fournisseur } from '../../../core/models/fournisseur';
import { LangueService } from '../../../core/services/langue';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-fournisseur-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page">

      <!-- ── En-tête ── -->
      <div class="page-header">
        <h1>🏭 {{ lang().fournisseurs }}</h1>
        <a routerLink="/fournisseurs/nouveau" class="btn-primary">
          + {{ lang().ajouter }}
        </a>
      </div>

      <!-- ── Barre de recherche ── -->
      <input [(ngModel)]="search" (ngModelChange)="filter()"
        [placeholder]="lang().rechercherFournisseur"
        class="search-input" />

      <!-- ── Indicateur de chargement ── -->
      @if (isLoading()) {
        <div class="loading-state">
          <p>⏳ {{ lang().chargement }}</p>
        </div>
      }

      <!-- ── Message d'erreur ── -->
      @if (hasError()) {
        <div class="error-state">❌ {{ lang().erreurMiseAJour }}</div>
      }

      <!-- ── Grille des fournisseurs ── -->
      @if (!isLoading() && !hasError()) {
        <div class="cards-grid">
          @for (f of filtered(); track f.id) {
            <div class="card">
              <div class="card-header">
                <span class="card-icon">🏭</span>
                <strong>{{ f.nom }}</strong>
              </div>
              <div class="card-body">
                <p>📞 {{ f.telephone }}</p>
                <p>📧 {{ f.email }}</p>
                <p>📍 {{ f.ville }}</p>
                <p class="address">{{ f.adresse }}</p>
              </div>
              <div class="card-actions">
                <a [routerLink]="['/fournisseurs', f.id, 'edit']" class="btn-edit">
                  ✏️ {{ lang().modifier }}
                </a>
                <button (click)="delete(f.id!)" class="btn-delete">
                  🗑 {{ lang().supprimer }}
                </button>
              </div>
            </div>
          } @empty {
            <p class="empty">{{ lang().aucunFournisseur }}</p>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    h1 { color: #52B69A; }
    .btn-primary { background: #52B69A; color: white; padding: 0.6rem 1.2rem; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .search-input { width: 100%; padding: 0.7rem 1rem; border: 1px solid #52B69A; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.95rem; box-sizing: border-box; }
    .loading-state { text-align: center; padding: 2rem; color: #52B69A; }
    .error-state { background: #ffebee; color: #f44336; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center; }
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 1.2rem; }
    .card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.07); border-top: 4px solid #52B69A; transition: transform 0.2s; }
    .card:hover { transform: translateY(-3px); }
    .card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e8f5e9; }
    .card-icon { font-size: 1.8rem; }
    .card-header strong { color: #52B69A; }
    .card-body p { margin: 0.35rem 0; color: #555; font-size: 0.9rem; }
    .address { color: #999 !important; font-size: 0.8rem !important; }
    .card-actions { display: flex; gap: 0.75rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e8f5e9; }
    .btn-edit { background: #e8f5e9; color: #52B69A; padding: 0.4rem 0.8rem; border-radius: 6px; text-decoration: none; font-size: 0.85rem; }
    .btn-delete { background: #ffebee; color: #f44336; padding: 0.4rem 0.8rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.85rem; }
    .empty { color: #999; text-align: center; padding: 3rem; }
  `]
})
export class FournisseurListComponent implements OnInit {

  // ─── État du composant ────────────────────────────────────────────────────

  /** Liste complète des fournisseurs chargée depuis l'API */
  all: Fournisseur[] = [];

  /** Liste filtrée affichée dans la grille */
  filtered = signal<Fournisseur[]>([]);

  /** Terme de recherche saisi par l'utilisateur */
  search = '';

  /** Indicateur de chargement */
  isLoading = signal(false);

  /** Indicateur d'erreur API */
  hasError = signal(false);

  // ─── Computed Signals ─────────────────────────────────────────────────────

  /** Traductions réactives selon la langue active */
  lang = computed(() => this.langueService.t());

  // ─── Constructeur ─────────────────────────────────────────────────────────

  constructor(
    private fournisseurService: FournisseurService,
    private notif: NotificationService,
    public langueService: LangueService
  ) {}

  // ─── Cycle de vie ─────────────────────────────────────────────────────────

  /**
   * Initialisation: chargement de tous les fournisseurs depuis l'API
   */
  ngOnInit(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.fournisseurService.getAll().subscribe({
      next: (data) => {
        this.all = data;
        this.filtered.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  // ─── Filtrage ─────────────────────────────────────────────────────────────

  /**
   * Filtre les fournisseurs par nom ou ville
   */
  filter(): void {
    this.filtered.set(
      this.all.filter(f =>
        f.nom.toLowerCase().includes(this.search.toLowerCase()) ||
        f.ville.toLowerCase().includes(this.search.toLowerCase())
      )
    );
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * Supprime un fournisseur après confirmation
   * @param id - Identifiant du fournisseur à supprimer
   */
  delete(id: number): void {
    if (confirm(this.lang().confirmerSuppression)) {
      this.fournisseurService.delete(id).subscribe({
        next: () => {
          this.all = this.all.filter(f => f.id !== id);
          this.filter();
          this.notif.success(this.lang().supprimer);
        },
        error: () => {
          this.notif.info(this.lang().erreurMiseAJour);
        }
      });
    }
  }
}