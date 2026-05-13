import { Component, OnInit, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { VenteService } from '../../../core/services/vente';
import { MedicamentService } from '../../../core/services/medicament';
import { ClientService } from '../../../core/services/client';
import { Medicament } from '../../../core/models/medicament';
import { Client } from '../../../core/models/client';
import { LangueService } from '../../../core/services/langue';

@Component({
  selector: 'app-vente-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>🧾 {{ lang().nouvelleVente }}</h1>
        <a routerLink="/ventes" class="btn-back">← {{ lang().retour }}</a>
      </div>

      <div class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <div class="form-grid">
            <div class="form-group">
              <label>{{ lang().clients }} *</label>
              <select formControlName="clientId" (change)="onClientChange()">
                <option value="">{{ lang().choisirClient }}</option>
                @for (c of clients; track c.id) {
                  <option [value]="c.id">{{ c.nom }}</option>
                }
              </select>
              @if (form.get('clientId')?.invalid && form.get('clientId')?.touched) {
                <span class="error">{{ lang().clientObligatoire }}</span>
              }
            </div>
            <div class="form-group">
              <label>{{ lang().date }} *</label>
              <input type="date" formControlName="date" />
            </div>
            <div class="form-group checkbox-row">
              <label>
                <input type="checkbox" formControlName="ordonnance" />
                {{ lang().avecOrdonnance }}
              </label>
            </div>
          </div>

          <h3>💊 {{ lang().medicamentsVendus }}</h3>

          <div formArrayName="lignesVente">
            @for (ligne of lignesVente.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="ligne">
                <select formControlName="medicamentId" (change)="onMedChange(i)">
                  <option value="">{{ lang().choisirMedicament }}</option>
                  @for (m of medicaments; track m.id) {
                    <option [value]="m.id">{{ m.nom }} — {{ m.prix }} DH</option>
                  }
                </select>
                <input type="number" formControlName="quantite"
                  min="1" [placeholder]="lang().quantite" (input)="calcTotal()" />
                <input type="number" formControlName="prixUnitaire"
                  [placeholder]="lang().prixUnite" readonly class="readonly" />
                <button type="button" (click)="removeLigne(i)" class="btn-remove">✕</button>
              </div>
            }
          </div>

          <button type="button" (click)="addLigne()" class="btn-add">
            + {{ lang().ajouterMedicament }}
          </button>

          <div class="total-box">
            💰 {{ lang().total }} :
            <strong>{{ total() | number:'1.2-2' }} DH</strong>
          </div>

          <div class="form-actions">
            <a routerLink="/ventes" class="btn-cancel">{{ lang().annuler }}</a>
            <button type="submit"
              [disabled]="form.invalid || lignesVente.length === 0"
              class="btn-submit">
              💾 {{ lang().enregistrerVente }}
            </button>
          </div>

        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 1.5rem;
    }
    h1 { color: #04c790ff }
    h3 { color: #52B69A; margin: 1.5rem 0 0.75rem; font-size: 1rem; }
    .btn-back { color: #52B69A; text-decoration: none; font-weight: 500; }
    .form-card {
      background: white; border-radius: 12px;
      padding: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.07);
      border-top: 4px solid #52B69A;
    }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .checkbox-row { flex-direction: row; align-items: center; padding-top: 1.5rem; }
    .checkbox-row label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: normal; }
    label { font-weight: 600; font-size: 0.9rem; color: #52B69A; }
    input, select {
      padding: 0.65rem 1rem; border: 1px solid #52B69A;
      border-radius: 8px; font-size: 0.9rem; transition: border-color 0.2s;
    }
    input:focus, select:focus {
      outline: none; border-color: #52B69A;
      box-shadow: 0 0 0 3px rgba(46,125,50,0.1);
    }
    .error { color: #f44336; font-size: 0.8rem; }
    .ligne {
      display: flex; gap: 0.75rem; align-items: center;
      margin-bottom: 0.75rem; padding: 0.75rem;
      background: #f8f9fa; border-radius: 8px;
      border-left: 3px solid #52B69A;
    }
    .ligne select { flex: 2; }
    .ligne input { flex: 1; }
    .readonly { background: #f0f0f0; color: #666; }
    .btn-remove {
      background: #ffebee; border: none;
      padding: 0.5rem 0.75rem; border-radius: 6px;
      cursor: pointer; color: #f44336; font-weight: bold;
    }
    .btn-add {
      width: 100%; background: #e8f5e9;
      border: 1px dashed #52B69A; padding: 0.6rem;
      border-radius: 8px; cursor: pointer;
      color: #52B69A; font-weight: 600; margin-top: 0.5rem;
    }
    .btn-add:hover { background: #c8e6c9; }
    .total-box {
      background: #e8f5e9; border: 1px solid #52B69A;
      padding: 1rem 1.5rem; border-radius: 8px;
      margin-top: 1.5rem; text-align: right;
      font-size: 1.1rem; color: #52B69A;
    }
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
    .btn-cancel {
      padding: 0.7rem 1.5rem; border-radius: 8px;
      border: 1px solid #52B69A; text-decoration: none; color: #000000ff;
    }
    .btn-submit {
      padding: 0.7rem 1.5rem; border-radius: 8px;
      border: none; background: #52B69A; color: white; font-weight: 600; cursor: pointer;
    }
    .btn-submit:disabled { background: #52B69A; cursor: not-allowed; }
    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class VenteFormComponent implements OnInit {
  form!: FormGroup;
  medicaments: Medicament[] = [];
  clients: Client[] = [];
  total = signal(0);

  lang = computed(() => this.langueService.t());

  constructor(
    private fb: FormBuilder,
    private venteService: VenteService,
    private medicamentService: MedicamentService,
    private clientService: ClientService,
    private router: Router,
    public langueService: LangueService
  ) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      clientId:    ['', Validators.required],
      clientNom:   [''],
      date:        [today, Validators.required],
      ordonnance:  [false],
      total:       [0],
      lignesVente: this.fb.array([])
    });
    this.medicamentService.getAll().subscribe(m => this.medicaments = m);
    this.clientService.getAll().subscribe(c => this.clients = c);
  }

  get lignesVente(): FormArray {
    return this.form.get('lignesVente') as FormArray;
  }

  addLigne(): void {
    this.lignesVente.push(this.fb.group({
      medicamentId:  ['', Validators.required],
      medicamentNom: [''],
      quantite:      [1, [Validators.required, Validators.min(1)]],
      prixUnitaire:  [0]
    }));
  }

  removeLigne(i: number): void {
    this.lignesVente.removeAt(i);
    this.calcTotal();
  }

  onMedChange(i: number): void {
    const ligne = this.lignesVente.at(i);
    const medId = +ligne.get('medicamentId')?.value;
    const med = this.medicaments.find(m => m.id === medId);
    if (med) {
      ligne.patchValue({ prixUnitaire: med.prix, medicamentNom: med.nom });
    }
    this.calcTotal();
  }

  onClientChange(): void {
    const clientId = +this.form.get('clientId')?.value;
    const client = this.clients.find(c => c.id === clientId);
    if (client) this.form.patchValue({ clientNom: client.nom });
  }

  calcTotal(): void {
    const t = this.lignesVente.controls.reduce((sum, l) => {
      return sum + ((l.get('quantite')?.value || 0) * (l.get('prixUnitaire')?.value || 0));
    }, 0);
    this.total.set(t);
    this.form.patchValue({ total: t });
  }

  onSubmit(): void {
    if (this.form.valid && this.lignesVente.length > 0) {
      this.venteService.create(this.form.value).subscribe(() =>
        this.router.navigate(['/ventes'])
      );
    }
  }
}