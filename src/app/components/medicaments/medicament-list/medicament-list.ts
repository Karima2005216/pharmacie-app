// =============================================
// FICHIER: src/app/components/medicaments/medicament-list/medicament-list.ts
// Description: Composant d'affichage et de gestion de la liste des médicaments
// Fonctionnalités: filtrage, pagination, export CSV, suppression
// =============================================

import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MedicamentService } from '../../../core/services/medicament';
import { Medicament } from '../../../core/models/medicament';
import { StockStatusPipe } from '../../../pipes/stock-status-pipe';
import { ExpirationPipe } from '../../../pipes/expiration.pipe';
import { ExportService } from '../../../core/services/export';
import { NotificationService } from '../../../core/services/notification';
import { ConfirmService } from '../../../core/services/confirm';
import { DateFormatPipe } from '../../../pipes/date-format-pipe';
import { LangueService } from '../../../core/services/langue';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-medicament-list',
  standalone: true,
  imports: [
    RouterLink, FormsModule, DecimalPipe,
    StockStatusPipe, ExpirationPipe, DateFormatPipe,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatChipsModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">

      <!-- ── En-tête de la page ── -->
      <div class="page-header">
        <div class="title-section">
          <h1><mat-icon>inventory</mat-icon> {{ lang().stockMedicaments }}</h1>
          <p>{{ lang().gererInventaire }}</p>
        </div>
        <div class="header-btns">
          <button mat-raised-button color="primary"
            routerLink="/medicaments/nouveau" class="add-btn">
            <mat-icon>add</mat-icon> {{ lang().ajouter }}
          </button>
          <button mat-stroked-button (click)="exportCSV()" class="btn-export">
            📤 Export CSV
          </button>
        </div>
      </div>

      <!-- ── Barre de filtres ── -->
      <div class="filters-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>{{ lang().rechercher }}</mat-label>
          <input matInput [(ngModel)]="searchTerm"
            (ngModelChange)="filterMedicaments()"
            [placeholder]="lang().nomReference">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ lang().categorie }}</mat-label>
          <mat-select [(ngModel)]="selectedCategorie"
            (ngModelChange)="filterMedicaments()">
            <mat-option value="">{{ lang().toutesCategories }}</mat-option>
            <mat-option value="Analgésique">Analgésique</mat-option>
            <mat-option value="Antibiotique">Antibiotique</mat-option>
            <mat-option value="Anti-inflammatoire">Anti-inflammatoire</mat-option>
            <mat-option value="Vitamines">Vitamines</mat-option>
            <mat-option value="Antidiabétique">Antidiabétique</mat-option>
            <mat-option value="Gastrique">Gastrique</mat-option>
            <mat-option value="Antihistaminique">Antihistaminique</mat-option>
            <mat-option value="Antihypertenseur">Antihypertenseur</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>{{ lang().etatStock }}</mat-label>
          <mat-select [(ngModel)]="stockFilter"
            (ngModelChange)="filterMedicaments()">
            <mat-option value="">{{ lang().tous }}</mat-option>
            <mat-option value="alerte">⚠️ {{ lang().enAlerte }}</mat-option>
            <mat-option value="ok">✅ Stock OK</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- ── Indicateur de chargement ── -->
      @if (isLoading()) {
        <div class="loading-state">
          <mat-icon class="spin">refresh</mat-icon>
          <p>{{ lang().chargement }}</p>
        </div>
      }

      <!-- ── Grille des médicaments ── -->
      @if (!isLoading()) {
        <div class="medicines-grid">
          @for (med of medicamentsPagines(); track med.id) {
            <mat-card class="med-card"
              [class.alert-card]="med.quantite <= med.seuilAlerte">
              <mat-card-header>
                <div mat-card-avatar class="med-avatar">
                  <mat-icon color="primary">medication</mat-icon>
                </div>
                <mat-card-title>{{ med.nom }}</mat-card-title>
                <mat-card-subtitle>
                  {{ med.reference }} • {{ med.categorie }}
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <div class="content-row">
                  <span class="label">{{ lang().prix }}:</span>
                  <span class="value price">{{ med.prix | number:'1.2-2' }} DH</span>
                </div>
                <div class="content-row">
                  <span class="label">{{ lang().stock }}:</span>
                  <span [class]="med.quantite | stockStatus:med.seuilAlerte" class="stock-badge">
                    {{ med.quantite }} {{ lang().unites }}
                  </span>
                </div>
                <div class="content-row">
                  <span class="label">{{ lang().expiration }}:</span>
                  <span [class]="med.dateExpiration | expiration" class="exp-date">
                    {{ med.dateExpiration | dateFormat }}
                  </span>
                </div>
                <div class="prescription-info">
                  @if (med.ordonnanceRequise) {
                    <mat-chip class="ord-chip">
                      📋 {{ lang().ordonnanceRequise }}
                    </mat-chip>
                  }
                </div>
              </mat-card-content>

              <mat-card-actions align="end">
                <button mat-icon-button color="primary"
                  [routerLink]="['/medicaments', med.id]"
                  [matTooltip]="lang().voirDetails">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="accent"
                  [routerLink]="['/medicaments', med.id, 'edit']"
                  [matTooltip]="lang().modifier">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn"
                  (click)="delete(med.id!)"
                  [matTooltip]="lang().supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          } @empty {
            <div class="empty-state">
              <mat-icon>search_off</mat-icon>
              <p>{{ lang().aucunMedicament }}</p>
            </div>
          }
        </div>

        <!-- ── Pagination ── -->
        @if (totalPages() > 1) {
          <div class="pagination">
            <button (click)="pageActuelle.set(pageActuelle() - 1)"
              [disabled]="pageActuelle() === 1" class="btn-page">◀</button>
            @for (p of pages(); track p) {
              <button (click)="pageActuelle.set(p)"
                [class.active]="pageActuelle() === p" class="btn-page">
                {{ p }}
              </button>
            }
            <button (click)="pageActuelle.set(pageActuelle() + 1)"
              [disabled]="pageActuelle() === totalPages()" class="btn-page">▶</button>
            <span class="page-info">
              {{ lang().page }} {{ pageActuelle() }} / {{ totalPages() }}
              ({{ filtered().length }} {{ lang().medicaments }})
            </span>
          </div>
        }
      }

    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; background: #ffffff; min-height: 100vh; }
    .page-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 2rem;
      border-bottom: 2px solid #52B69A; padding-bottom: 1rem;
    }
    .page-header h1 { color: #52B69A; margin: 0; display: flex; align-items: center; gap: 10px; }
    .page-header p { color: #52B69A; margin: 5px 0 0 0; }
    .header-btns { display: flex; gap: 0.75rem; align-items: center; }
    .btn-export {
      background: #8dddc6ff; color: #52B69A;
      padding: 0.5rem 1rem; border-radius: 8px;
      border: 1px solid #ffffffff; cursor: pointer; font-weight: 600;
    }
    .btn-export:hover { background: #ffffffff; }
    .filters-bar { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .search-field { flex: 2; min-width: 250px; }
    .filter-field { flex: 1; min-width: 150px; }

    /* Loading State */
    .loading-state {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 4rem; color: #52B69A;
    }
    .loading-state mat-icon { font-size: 3rem; width: 3rem; height: 3rem; margin-bottom: 1rem; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .medicines-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .med-card { border-radius: 12px !important; transition: all 0.3s ease; border: 1px solid #ffffffff; }
    .med-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
    .alert-card { border-top: 5px solid #f44336; }
    .med-avatar { background: #e1f5fe; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
    .content-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 5px; border-bottom: 1px dashed #eee; }
    .label { color: #52B69A; font-size: 0.9rem; }
    .price { font-weight: bold; color: #333; }
    .stock-badge { font-weight: 600; padding: 2px 8px; border-radius: 4px; }
    .prescription-info { margin-top: 15px; }
    .ord-chip { background: #52B69A !important; color: white !important; font-size: 0.75rem !important; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 5rem; color: #52B69A; }
    .empty-state mat-icon { font-size: 5rem; width: 5rem; height: 5rem; margin-bottom: 1rem; }
    .pagination { display: flex; align-items: center; gap: 0.5rem; margin-top: 1.5rem; justify-content: center; flex-wrap: wrap; }
    .btn-page { width: 38px; height: 38px; border-radius: 8px; border: 1px solid #b3e5fc; background: white; color: #52B69A; cursor: pointer; font-weight: 600; transition: all 0.2s; }
    .btn-page:hover { background: #e1f5fe; }
    .btn-page.active { background: #52B69A; color: white; border-color: #52B69A; }
    .btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-info { color: #999; font-size: 0.85rem; margin-left: 0.5rem; }
  `]
})
export class MedicamentListComponent implements OnInit {

  // ─── État du composant ────────────────────────────────────────────────────

  /** Liste complète des médicaments chargée depuis l'API */
  allMedicaments: Medicament[] = [];

  /** Liste filtrée affichée à l'utilisateur */
  filtered = signal<Medicament[]>([]);

  /** Indicateur de chargement affiché pendant les appels API */
  isLoading = signal(false);

  /** Termes de recherche saisis par l'utilisateur */
  searchTerm = '';

  /** Catégorie sélectionnée pour le filtrage */
  selectedCategorie = '';

  /** Filtre d'état du stock (alerte / ok / tous) */
  stockFilter = '';

  // ─── Pagination ───────────────────────────────────────────────────────────

  /** Page courante de la pagination */
  pageActuelle = signal(1);

  /** Nombre de médicaments affichés par page */
  parPage = 6;

  // ─── Computed Signals ─────────────────────────────────────────────────────

  /** Médicaments de la page courante */
  medicamentsPagines = computed(() => {
    const debut = (this.pageActuelle() - 1) * this.parPage;
    return this.filtered().slice(debut, debut + this.parPage);
  });

  /** Nombre total de pages calculé dynamiquement */
  totalPages = computed(() =>
    Math.ceil(this.filtered().length / this.parPage)
  );

  /** Tableau des numéros de pages pour la navigation */
  pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  /** Traductions réactives selon la langue active */
  lang = computed(() => this.langueService.t());

  // ─── Constructeur ─────────────────────────────────────────────────────────

  constructor(
    private medicamentService: MedicamentService,
    private exportService: ExportService,
    private notif: NotificationService,
    private confirmService: ConfirmService,
    public langueService: LangueService
  ) {}

  // ─── Cycle de vie ─────────────────────────────────────────────────────────

  /**
   * Initialisation: chargement de tous les médicaments
   * avec gestion de l'état de chargement
   */
  ngOnInit(): void {
    this.isLoading.set(true);
    this.medicamentService.getAll().subscribe({
      next: (data) => {
        this.allMedicaments = data;
        this.filtered.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.notif.info('Erreur lors du chargement');
        this.isLoading.set(false);
      }
    });
  }

  // ─── Filtrage ─────────────────────────────────────────────────────────────

  /**
   * Filtre les médicaments selon les critères sélectionnés:
   * - Terme de recherche (nom ou référence)
   * - Catégorie
   * - État du stock
   * Réinitialise la pagination à la page 1 après filtrage
   */
  filterMedicaments(): void {
    let result = [...this.allMedicaments];

    // Filtre par terme de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(m =>
        m.nom.toLowerCase().includes(term) ||
        m.reference.toLowerCase().includes(term)
      );
    }

    // Filtre par catégorie
    if (this.selectedCategorie) {
      result = result.filter(m => m.categorie === this.selectedCategorie);
    }

    // Filtre par état du stock
    if (this.stockFilter === 'alerte') {
      result = result.filter(m => m.quantite <= m.seuilAlerte);
    } else if (this.stockFilter === 'ok') {
      result = result.filter(m => m.quantite > m.seuilAlerte);
    }

    this.filtered.set(result);
    this.pageActuelle.set(1); // Retour à la première page
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * Exporte la liste complète des médicaments en format CSV
   */
  exportCSV(): void {
    this.exportService.exportMedicaments(this.allMedicaments);
    this.notif.info('Export CSV téléchargé !');
  }

  /**
   * Supprime un médicament après confirmation de l'utilisateur
   * @param id - Identifiant du médicament à supprimer
   */
  async delete(id: number): Promise<void> {
    const confirmed = await this.confirmService.open({
      titre: this.lang().supprimerMedicament,
      message: this.lang().confirmSupprimer,
      btnConfirm: '🗑️ ' + this.lang().supprimer,
      btnCancel: this.lang().annuler
    });

    if (confirmed) {
      this.medicamentService.delete(id).subscribe({
        next: () => {
          // Suppression locale sans rechargement complet
          this.allMedicaments = this.allMedicaments.filter(m => m.id !== id);
          this.filterMedicaments();
          this.notif.success(this.lang().medicamentSupprime);
        },
        error: () => {
          this.notif.info(this.lang().erreurMiseAJour);
        }
      });
    }
  }
}