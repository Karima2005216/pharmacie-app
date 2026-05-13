// =============================================
// FICHIER: src/app/core/services/medicament.service.ts
// Description: Service de gestion des médicaments
// Fournit les opérations CRUD et les signaux réactifs
// pour le suivi du stock et des expirations
// =============================================

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Medicament } from '../models/medicament';

@Injectable({ providedIn: 'root' })
export class MedicamentService {

  // URL de base de l'API REST (json-server)
  private apiUrl = 'http://https://https://pharmacie-backend-gvw3.vercel.app/medicaments';

  // ─── Signals ──────────────────────────────────────────────────────────────

  // Signal privé contenant la liste complète des médicaments
  // Utilisé en interne pour les mises à jour réactives
  private _medicaments = signal<Medicament[]>([]);

  // Signal public en lecture seule exposé aux composants
  // Empêche les modifications directes depuis l'extérieur
  medicaments = this._medicaments.asReadonly();

  // ─── Computed Signals ─────────────────────────────────────────────────────

  /**
   * Computed signal: Liste des médicaments en alerte de stock
   * Un médicament est en alerte si sa quantité <= son seuil d'alerte
   * Se met à jour automatiquement quand _medicaments change
   */
  alertes = computed(() =>
    this._medicaments().filter(m => m.quantite <= m.seuilAlerte)
  );

  /**
   * Computed signal: Liste des médicaments expirant dans les 30 prochains jours
   * Calcule dynamiquement la date limite à chaque accès
   */
  expiresBientot = computed(() => {
    const dans30jours = new Date();
    dans30jours.setDate(dans30jours.getDate() + 30);
    return this._medicaments().filter(m =>
      new Date(m.dateExpiration) <= dans30jours
    );
  });

  // ─── Constructeur ─────────────────────────────────────────────────────────

  /**
   * Injection de HttpClient pour les appels API
   * Chargement initial des médicaments au démarrage
   */
  constructor(private http: HttpClient) {
    this.loadAll();
  }

  // ─── Méthodes privées ─────────────────────────────────────────────────────

  /**
   * Charge tous les médicaments depuis l'API
   * et met à jour le signal _medicaments
   * Appelé automatiquement après chaque opération CRUD
   */
  loadAll(): void {
    this.http.get<Medicament[]>(this.apiUrl).subscribe(data => {
      this._medicaments.set(data);
    });
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  /**
   * Récupère tous les médicaments depuis l'API
   * @returns Observable<Medicament[]>
   */
  getAll(): Observable<Medicament[]> {
    return this.http.get<Medicament[]>(this.apiUrl);
  }

  /**
   * Récupère un médicament par son identifiant
   * @param id - Identifiant du médicament
   * @returns Observable<Medicament>
   */
  getById(id: number): Observable<Medicament> {
    return this.http.get<Medicament>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un nouveau médicament et rafraîchit la liste
   * @param med - Données du médicament à créer
   * @returns Observable<Medicament> - Le médicament créé
   */
  create(med: Medicament): Observable<Medicament> {
    return this.http.post<Medicament>(this.apiUrl, med).pipe(
      tap(() => this.loadAll()) // Rafraîchit le signal après création
    );
  }

  /**
   * Met à jour un médicament existant et rafraîchit la liste
   * @param id - Identifiant du médicament à modifier
   * @param med - Nouvelles données du médicament
   * @returns Observable<Medicament> - Le médicament modifié
   */
  update(id: number, med: Medicament): Observable<Medicament> {
    return this.http.put<Medicament>(`${this.apiUrl}/${id}`, med).pipe(
      tap(() => this.loadAll()) // Rafraîchit le signal après modification
    );
  }

  /**
   * Supprime un médicament et rafraîchit la liste
   * @param id - Identifiant du médicament à supprimer
   * @returns Observable<void>
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadAll()) // Rafraîchit le signal après suppression
    );
  }
}