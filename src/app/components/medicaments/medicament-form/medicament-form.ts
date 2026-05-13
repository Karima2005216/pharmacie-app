import { Component, OnInit, computed, signal } from '@angular/core';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MedicamentService } from '../../../core/services/medicament';
import { FournisseurService } from '../../../core/services/fournisseur';
import { Fournisseur } from '../../../core/models/fournisseur';
import { NotificationService } from '../../../core/services/notification';
import { LangueService } from '../../../core/services/langue';

// ─── Custom Validators ────────────────────────────────────────────
function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(control.value);
  return selected > today ? null : { pastDate: true };
}

function positiveNumberValidator(control: AbstractControl): ValidationErrors | null {
  const val = Number(control.value);
  return val > 0 ? null : { notPositive: true };
}

@Component({
  selector: 'app-medicament-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>
          {{ isEdit ? '✏️ ' + lang().modifier : '➕ ' + lang().nouveau }}
          {{ lang().medicament }}
        </h1>
        <a routerLink="/medicaments" class="btn-back">← {{ lang().retour }}</a>
      </div>

      @if (isLoading()) {
        <div class="loading-overlay">
          <div class="spinner"></div>
          <p>{{ isEdit ? 'Chargement...' : 'Enregistrement...' }}</p>
        </div>
      }

      <div class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">

            <!-- Nom -->
            <div class="form-group">
              <label>{{ lang().nom }} *</label>
              <input formControlName="nom"
                placeholder="Ex: Doliprane 1000mg"
                [class.input-error]="form.get('nom')?.invalid && form.get('nom')?.touched" />
              @if (form.get('nom')?.errors?.['required'] && form.get('nom')?.touched) {
                <span class="error">⚠️ {{ lang().nomObligatoire }}</span>
              }
              @if (form.get('nom')?.errors?.['minlength'] && form.get('nom')?.touched) {
                <span class="error">⚠️ Le nom doit contenir au moins 2 caractères</span>
              }
            </div>

            <!-- Référence -->
            <div class="form-group">
              <label>{{ lang().reference }} *</label>
              <input formControlName="reference"
                placeholder="Ex: MED001"
                [class.input-error]="form.get('reference')?.invalid && form.get('reference')?.touched" />
              @if (form.get('reference')?.errors?.['required'] && form.get('reference')?.touched) {
                <span class="error">⚠️ {{ lang().referenceObligatoire }}</span>
              }
              @if (form.get('reference')?.errors?.['minlength'] && form.get('reference')?.touched) {
                <span class="error">⚠️ La référence doit contenir au moins 3 caractères</span>
              }
            </div>

            <!-- Catégorie -->
            <div class="form-group">
              <label>{{ lang().categorie }} *</label>
              <select formControlName="categorie"
                [class.input-error]="form.get('categorie')?.invalid && form.get('categorie')?.touched">
                <option value="">{{ lang().choisirCategorie }}</option>
                <option value="Analgésique">Analgésique</option>
                <option value="Antibiotique">Antibiotique</option>
                <option value="Anti-inflammatoire">Anti-inflammatoire</option>
                <option value="Vitamines">Vitamines</option>
                <option value="Antidiabétique">Antidiabétique</option>
                <option value="Gastrique">Gastrique</option>
                <option value="Antihistaminique">Antihistaminique</option>
                <option value="Antihypertenseur">Antihypertenseur</option>
              </select>
              @if (form.get('categorie')?.invalid && form.get('categorie')?.touched) {
                <span class="error">⚠️ {{ lang().categorieObligatoire }}</span>
              }
            </div>

            <!-- Fournisseur -->
            <div class="form-group">
              <label>{{ lang().fournisseurs }} *</label>
              <select formControlName="fournisseurId"
                [class.input-error]="form.get('fournisseurId')?.invalid && form.get('fournisseurId')?.touched">
                <option value="">{{ lang().choisirFournisseur }}</option>
                @for (f of fournisseurs; track f.id) {
                  <option [value]="f.id">{{ f.nom }}</option>
                }
              </select>
              @if (form.get('fournisseurId')?.invalid && form.get('fournisseurId')?.touched) {
                <span class="error">⚠️ {{ lang().fournisseurObligatoire }}</span>
              }
            </div>

            <!-- Prix -->
            <div class="form-group">
              <label>{{ lang().prix }} (DH) *</label>
              <input type="number" formControlName="prix"
                min="0.01" step="0.01" placeholder="0.00"
                [class.input-error]="form.get('prix')?.invalid && form.get('prix')?.touched" />
              @if (form.get('prix')?.errors?.['required'] && form.get('prix')?.touched) {
                <span class="error">⚠️ {{ lang().prixInvalide }}</span>
              }
              @if (form.get('prix')?.errors?.['notPositive'] && form.get('prix')?.touched) {
                <span class="error">⚠️ Le prix doit être supérieur à 0</span>
              }
              @if (form.get('prix')?.errors?.['max'] && form.get('prix')?.touched) {
                <span class="error">⚠️ Prix trop élevé (max 99 999 DH)</span>
              }
            </div>

            <!-- Quantité -->
            <div class="form-group">
              <label>{{ lang().quantiteStock }} *</label>
              <input type="number" formControlName="quantite"
                min="0" placeholder="0"
                [class.input-error]="form.get('quantite')?.invalid && form.get('quantite')?.touched" />
              @if (form.get('quantite')?.errors?.['required'] && form.get('quantite')?.touched) {
                <span class="error">⚠️ {{ lang().quantiteInvalide }}</span>
              }
              @if (form.get('quantite')?.errors?.['min'] && form.get('quantite')?.touched) {
                <span class="error">⚠️ La quantité ne peut pas être négative</span>
              }
            </div>

            <!-- Seuil Alerte -->
            <div class="form-group">
              <label>{{ lang().seuilAlerte }} *</label>
              <input type="number" formControlName="seuilAlerte"
                min="0" placeholder="20"
                [class.input-error]="form.get('seuilAlerte')?.invalid && form.get('seuilAlerte')?.touched" />
              @if (form.get('seuilAlerte')?.invalid && form.get('seuilAlerte')?.touched) {
                <span class="error">⚠️ Le seuil d'alerte est obligatoire</span>
              }
            </div>

            <!-- Date Expiration -->
            <div class="form-group">
              <label>{{ lang().expiration }} *</label>
              <input type="date" formControlName="dateExpiration"
                [class.input-error]="form.get('dateExpiration')?.invalid && form.get('dateExpiration')?.touched" />
              @if (form.get('dateExpiration')?.errors?.['required'] && form.get('dateExpiration')?.touched) {
                <span class="error">⚠️ {{ lang().dateObligatoire }}</span>
              }
              @if (form.get('dateExpiration')?.errors?.['pastDate'] && form.get('dateExpiration')?.touched) {
                <span class="error">⚠️ La date d'expiration doit être dans le futur</span>
              }
            </div>

          </div>

          <!-- Description -->
          <div class="form-group full-width">
            <label>{{ lang().description }}</label>
            <textarea formControlName="description" rows="3"
              [placeholder]="lang().descriptionPlaceholder"></textarea>
          </div>

          <!-- Ordonnance -->
          <div class="checkbox-row">
            <label>
              <input type="checkbox" formControlName="ordonnanceRequise" />
              {{ lang().ordonnanceMedicale }}
            </label>
          </div>

          <!-- Résumé erreurs -->
          @if (form.invalid && formSubmitAttempted()) {
            <div class="error-summary">
              ❌ Veuillez corriger les erreurs avant de soumettre
            </div>
          }

          <div class="form-actions">
            <a routerLink="/medicaments" class="btn-cancel">{{ lang().annuler }}</a>
            <button type="submit"
              [disabled]="isLoading()"
              class="btn-submit">
              @if (isLoading()) {
                <span>⏳ Traitement...</span>
              } @else {
                <span>{{ submitLabel() }}</span>
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    h1 { color: #52B69A; margin: 0; }

    .btn-back {
      color: #52B69A;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border: 1px solid #52B69A;
      border-radius: 8px;
      transition: background 0.2s;
    }
    .btn-back:hover { background: #f0faf7; }

    /* Loading Overlay */
    .loading-overlay {
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(255,255,255,0.85);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 999;
    }
    .spinner {
      width: 48px; height: 48px;
      border: 5px solid #e1f5fe;
      border-top-color: #52B69A;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Form Card */
    .form-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.07);
      border-top: 4px solid #52B69A;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.2rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .full-width {
      margin-top: 1rem;
    }

    label {
      font-weight: 600;
      font-size: 0.9rem;
      color: #52B69A;
    }

    input, select, textarea {
      padding: 0.65rem 1rem;
      border: 1.5px solid #b2dfdb;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: border-color 0.2s, box-shadow 0.2s;
      background: #fafafa;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #52B69A;
      box-shadow: 0 0 0 3px rgba(82,182,154,0.15);
      background: white;
    }

    .input-error { border-color: #f44336 !important; }

    .error {
      color: #f44336;
      font-size: 0.8rem;
    }

    .error-summary {
      background: #ffebee;
      color: #f44336;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-top: 1rem;
      font-size: 0.9rem;
      border-left: 4px solid #f44336;
    }

    .checkbox-row {
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .checkbox-row label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: normal;
      color: #333;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #f0f0f0;
    }

    .btn-cancel {
      padding: 0.7rem 1.5rem;
      border-radius: 8px;
      border: 1.5px solid #b2dfdb;
      text-decoration: none;
      color: #666;
      font-weight: 500;
      transition: background 0.2s;
    }
    .btn-cancel:hover { background: #f5f5f5; }

    .btn-submit {
      padding: 0.7rem 1.8rem;
      border-radius: 8px;
      border: none;
      background: #52B69A;
      color: white;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.95rem;
      transition: background 0.2s, transform 0.1s;
    }
    .btn-submit:hover:not(:disabled) {
      background: #3a9e84;
      transform: translateY(-1px);
    }
    .btn-submit:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .page { padding: 1rem; }
      .form-grid { grid-template-columns: 1fr; }
      .form-actions { flex-direction: column; }
      .btn-cancel, .btn-submit { width: 100%; text-align: center; }
    }
  `]
})
export class MedicamentFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  medicamentId!: number;
  fournisseurs: Fournisseur[] = [];

  // ─── Signals ──────────────────────────────────────
  isLoading = signal(false);
  formSubmitAttempted = signal(false);

  // ─── Computed ─────────────────────────────────────
  lang = computed(() => this.langueService.t());

  submitLabel = computed(() =>
    this.isEdit
      ? '✏️ ' + this.lang().modifier
      : '💾 ' + this.lang().enregistrer
  );

  constructor(
    private fb: FormBuilder,
    private medicamentService: MedicamentService,
    private fournisseurService: FournisseurService,
    private router: Router,
    private route: ActivatedRoute,
    private notif: NotificationService,
    public langueService: LangueService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nom:               ['', [Validators.required, Validators.minLength(2)]],
      reference:         ['', [Validators.required, Validators.minLength(3)]],
      categorie:         ['', Validators.required],
      fournisseurId:     ['', Validators.required],
      prix:              [null, [Validators.required, Validators.max(99999), positiveNumberValidator]],
      quantite:          [0,   [Validators.required, Validators.min(0)]],
      seuilAlerte:       [20,  Validators.required],
      dateExpiration:    ['',  [Validators.required, futureDateValidator]],
      description:       [''],
      ordonnanceRequise: [false]
    });

    // ─── Charger les fournisseurs ──────────────────
    this.isLoading.set(true);
    this.fournisseurService.getAll().subscribe({
      next: f => {
        this.fournisseurs = f;
        this.isLoading.set(false);
      },
      error: () => {
        this.notif.error('Erreur lors du chargement des fournisseurs');
        this.isLoading.set(false);
      }
    });

    // ─── Mode édition ──────────────────────────────
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nouveau') {
      this.isEdit = true;
      this.medicamentId = +id;
      this.isLoading.set(true);
      this.medicamentService.getById(this.medicamentId).subscribe({
        next: med => {
          this.form.patchValue({
            ...med,
            fournisseurId: String(med.fournisseurId)
          });
          this.isLoading.set(false);
        },
        error: () => {
          this.notif.error('Erreur lors du chargement du médicament');
          this.isLoading.set(false);
          this.router.navigate(['/medicaments']);
        }
      });
    }
  }

  onSubmit(): void {
    this.formSubmitAttempted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notif.warning('Veuillez corriger les erreurs du formulaire');
      return;
    }

    this.isLoading.set(true);
    const data = this.form.value;

    if (this.isEdit) {
      this.medicamentService.update(this.medicamentId, data).subscribe({
        next: () => {
          this.notif.success(this.lang().medicamentModifie); // ✅ success
          this.isLoading.set(false);
          this.router.navigate(['/medicaments']);
        },
        error: () => {
          this.notif.error('Erreur lors de la modification'); // ✅ error
          this.isLoading.set(false);
        }
      });
    } else {
      this.medicamentService.create(data).subscribe({
        next: () => {
          this.notif.success(this.lang().medicamentAjoute); // ✅ success
          this.isLoading.set(false);
          this.router.navigate(['/medicaments']);
        },
        error: () => {
          this.notif.error('Erreur lors de l\'enregistrement'); // ✅ error
          this.isLoading.set(false);
        }
      });
    }
  }
}