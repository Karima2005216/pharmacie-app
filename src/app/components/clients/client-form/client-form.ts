// =============================================
// FICHIER: src/app/components/clients/client-form/client-form.ts
// Description: Formulaire de création et modification d'un client
// Fonctionnalités: validation, loading state, gestion d'erreurs
// =============================================

import { Component, OnInit, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ClientService } from '../../../core/services/client';
import { LangueService } from '../../../core/services/langue';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">

      <!-- ── En-tête ── -->
      <div class="page-header">
        <h1>{{ isEdit ? '✏️ ' + lang().modifier : '➕ ' + lang().nouveau }} {{ lang().client }}</h1>
        <a routerLink="/clients" class="btn-back">← {{ lang().retour }}</a>
      </div>

      <!-- ── Indicateur de chargement ── -->
      @if (isLoading()) {
        <div class="loading-overlay">
          <div class="spinner"></div>
          <p>{{ lang().chargement }}</p>
        </div>
      }

      <div class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">

            <!-- Nom complet -->
            <div class="form-group">
              <label>{{ lang().nomComplet }} *</label>
              <input formControlName="nom"
                [placeholder]="lang().nomPrenom"
                [class.input-error]="form.get('nom')?.invalid && form.get('nom')?.touched" />
              @if (form.get('nom')?.invalid && form.get('nom')?.touched) {
                <span class="error">⚠️ {{ lang().nomObligatoire }}</span>
              }
            </div>

            <!-- Téléphone -->
            <div class="form-group">
              <label>{{ lang().telephone }} *</label>
              <input formControlName="telephone"
                placeholder="0600000000"
                [class.input-error]="form.get('telephone')?.invalid && form.get('telephone')?.touched" />
              @if (form.get('telephone')?.invalid && form.get('telephone')?.touched) {
                <span class="error">⚠️ {{ lang().telephoneObligatoire }}</span>
              }
            </div>

            <!-- Email -->
            <div class="form-group">
              <label>{{ lang().email }}</label>
              <input formControlName="email" type="email"
                placeholder="email@example.com"
                [class.input-error]="form.get('email')?.invalid && form.get('email')?.touched" />
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <span class="error">⚠️ {{ lang().emailInvalide }}</span>
              }
            </div>

            <!-- Date de naissance -->
            <div class="form-group">
              <label>{{ lang().dateNaissance }}</label>
              <input formControlName="dateNaissance" type="date" />
            </div>

          </div>

          <!-- ── Boutons d'action ── -->
          <div class="form-actions">
            <a routerLink="/clients" class="btn-cancel">{{ lang().annuler }}</a>
            <button type="submit"
              [disabled]="form.invalid || isLoading()"
              class="btn-submit">
              @if (isLoading()) {
                <span>⏳ {{ lang().chargement }}</span>
              } @else {
                <span>{{ isEdit ? '✏️ ' + lang().modifier : '💾 ' + lang().enregistrer }}</span>
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    h1 { color: #52B69A; }
    .btn-back { color: #52B69A; text-decoration: none; font-weight: 500; }
    .loading-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(255,255,255,0.85);
      display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 999;
    }
    .spinner {
      width: 48px; height: 48px; border: 5px solid #e1f5fe;
      border-top-color: #52B69A; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .form-card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.07); border-top: 4px solid #52B69A; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-weight: 600; font-size: 0.9rem; color: #52B69A; }
    input { padding: 0.65rem 1rem; border: 1px solid #52B69A; border-radius: 8px; font-size: 0.95rem; transition: border-color 0.2s; }
    input:focus { outline: none; border-color: #52B69A; box-shadow: 0 0 0 3px rgba(46,125,50,0.1); }
    .input-error { border-color: #f44336 !important; }
    .error { color: #f44336; font-size: 0.8rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
    .btn-cancel { padding: 0.7rem 1.5rem; border-radius: 8px; border: 1px solid #52B69A; text-decoration: none; color: #333; }
    .btn-submit { padding: 0.7rem 1.5rem; border-radius: 8px; border: none; background: #52B69A; color: white; font-weight: 600; cursor: pointer; }
    .btn-submit:disabled { background: #ccc; cursor: not-allowed; }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class ClientFormComponent implements OnInit {

  // ─── État du composant ────────────────────────────────────────────────────

  form!: FormGroup;

  /** Mode édition (true) ou création (false) */
  isEdit = false;

  /** Identifiant du client en mode édition */
  clientId!: number;

  /** Indicateur de chargement pendant les appels API */
  isLoading = signal(false);

  // ─── Computed Signals ─────────────────────────────────────────────────────

  /** Traductions réactives selon la langue active */
  lang = computed(() => this.langueService.t());

  // ─── Constructeur ─────────────────────────────────────────────────────────

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private notif: NotificationService,
    public langueService: LangueService
  ) {}

  // ─── Cycle de vie ─────────────────────────────────────────────────────────

  /**
   * Initialisation du formulaire avec validators
   * Chargement des données en mode édition
   */
  ngOnInit(): void {
    // Initialisation du formulaire avec les validateurs
    this.form = this.fb.group({
      nom:           ['', Validators.required],
      telephone:     ['', Validators.required],
      email:         ['', Validators.email],
      dateNaissance: ['']
    });

    // Détection du mode édition via l'URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.clientId = +id;
      this.isLoading.set(true);

      this.clientService.getById(this.clientId).subscribe({
        next: (c) => {
          this.form.patchValue(c);
          this.isLoading.set(false);
        },
        error: () => {
          this.notif.info(this.lang().erreurMiseAJour);
          this.isLoading.set(false);
          this.router.navigate(['/clients']);
        }
      });
    }
  }

  // ─── Soumission ───────────────────────────────────────────────────────────

  /**
   * Soumet le formulaire après validation
   * Crée ou met à jour le client selon le mode
   */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    if (this.isEdit) {
      // Mise à jour du client existant
      this.clientService.update(this.clientId, this.form.value).subscribe({
        next: () => {
          this.notif.success(this.lang().modifier + ' ✅');
          this.isLoading.set(false);
          this.router.navigate(['/clients']);
        },
        error: () => {
          this.notif.info(this.lang().erreurMiseAJour);
          this.isLoading.set(false);
        }
      });
    } else {
      // Création d'un nouveau client
      this.clientService.create(this.form.value).subscribe({
        next: () => {
          this.notif.success(this.lang().enregistrer + ' ✅');
          this.isLoading.set(false);
          this.router.navigate(['/clients']);
        },
        error: () => {
          this.notif.info(this.lang().erreurMiseAJour);
          this.isLoading.set(false);
        }
      });
    }
  }
}