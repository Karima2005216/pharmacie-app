// =============================================
// FICHIER: src/app/components/clients/client-list/client-list.ts
// Description: Composant d'affichage et de gestion de la liste des clients
// Fonctionnalités: recherche, suppression avec confirmation
// =============================================

import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../core/services/client';
import { Client } from '../../../core/models/client';
import { LangueService } from '../../../core/services/langue';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page">

      <!-- ── En-tête ── -->
      <div class="page-header">
        <h1>👥 {{ lang().clients }}</h1>
        <a routerLink="/clients/nouveau" class="btn-primary">
          + {{ lang().ajouter }}
        </a>
      </div>

      <!-- ── Barre de recherche ── -->
      <input [(ngModel)]="search" (ngModelChange)="filter()"
        [placeholder]="lang().rechercherClient"
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

      <!-- ── Tableau des clients ── -->
      @if (!isLoading() && !hasError()) {
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>{{ lang().nom }}</th>
                <th>{{ lang().telephone }}</th>
                <th>{{ lang().email }}</th>
                <th>{{ lang().dateNaissance }}</th>
                <th>{{ lang().actions }}</th>
              </tr>
            </thead>
            <tbody>
              @for (c of filtered(); track c.id) {
                <tr>
                  <td>
                    <div class="client-name">
                      <span class="avatar">👤</span>
                      <strong>{{ c.nom }}</strong>
                    </div>
                  </td>
                  <td>{{ c.telephone }}</td>
                  <td>{{ c.email }}</td>
                  <td>{{ c.dateNaissance }}</td>
                  <td class="actions">
                    <a [routerLink]="['/clients', c.id, 'edit']" class="btn-edit">✏️</a>
                    <button (click)="delete(c.id!)" class="btn-delete">🗑</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="empty">{{ lang().aucunClient }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    h1 { color: #52B69A; }
    .btn-primary { background: #52B69A; color: white; padding: 0.6rem 1.2rem; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .search-input { width: 100%; padding: 0.7rem 1rem; border: 1px solid #c8e6c9; border-radius: 8px; margin-bottom: 1rem; font-size: 0.95rem; box-sizing: border-box; }
    .search-input:focus { outline: none; border-color: #52B69A; }
    .loading-state { text-align: center; padding: 2rem; color: #52B69A; }
    .error-state { background: #ffebee; color: #f44336; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center; }
    .table-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.07); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #52B69A; color: white; padding: 1rem; text-align: left; font-size: 0.85rem; }
    td { padding: 0.85rem 1rem; border-bottom: 1px solid #f0f0f0; font-size: 0.9rem; }
    tr:hover { background: #f1f8f1; }
    .client-name { display: flex; align-items: center; gap: 0.5rem; }
    .avatar { background: #e8f5e9; padding: 0.3rem; border-radius: 50%; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-edit, .btn-delete { padding: 0.3rem 0.6rem; border-radius: 6px; border: none; cursor: pointer; text-decoration: none; }
    .btn-edit { background: #e8f5e9; color: #52B69A; }
    .btn-delete { background: #ffebee; color: #f44336; }
    .empty { text-align: center; color: #999; padding: 2rem; }
  `]
})
export class ClientListComponent implements OnInit {

  // ─── État du composant ────────────────────────────────────────────────────

  /** Liste complète des clients chargée depuis l'API */
  all: Client[] = [];

  /** Liste filtrée affichée dans le tableau */
  filtered = signal<Client[]>([]);

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
    private clientService: ClientService,
    private notif: NotificationService,
    public langueService: LangueService
  ) {}

  // ─── Cycle de vie ─────────────────────────────────────────────────────────

  /**
   * Initialisation: chargement de tous les clients depuis l'API
   */
  ngOnInit(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.clientService.getAll().subscribe({
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
   * Filtre les clients par nom ou téléphone
   */
  filter(): void {
    this.filtered.set(
      this.all.filter(c =>
        c.nom.toLowerCase().includes(this.search.toLowerCase()) ||
        c.telephone.includes(this.search)
      )
    );
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * Supprime un client après confirmation
   * @param id - Identifiant du client à supprimer
   */
  delete(id: number): void {
    if (confirm(this.lang().confirmerSuppression)) {
      this.clientService.delete(id).subscribe({
        next: () => {
          this.all = this.all.filter(c => c.id !== id);
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