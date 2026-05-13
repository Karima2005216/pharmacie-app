// =============================================
// FICHIER: src/app/core/services/vente.service.ts
// =============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vente } from '../models/vente';

@Injectable({ providedIn: 'root' })
export class VenteService {
  private apiUrl = 'https://pharmacie-backend-gvw3.vercel.app/ventes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Vente[]> {
    return this.http.get<Vente[]>(this.apiUrl);
  }

  getById(id: number): Observable<Vente> {
    return this.http.get<Vente>(`${this.apiUrl}/${id}`);
  }

  create(v: Vente): Observable<Vente> {
    return this.http.post<Vente>(this.apiUrl, v);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}