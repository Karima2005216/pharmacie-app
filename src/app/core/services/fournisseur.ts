// =============================================
// FICHIER: src/app/core/services/fournisseur.service.ts
// =============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fournisseur } from '../models/fournisseur';

@Injectable({ providedIn: 'root' })
export class FournisseurService {
  private apiUrl = 'http://localhost:3000/fournisseurs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(this.apiUrl);
  }

  getById(id: number): Observable<Fournisseur> {
    return this.http.get<Fournisseur>('${this.apiUrl}/${id}');
  }

  create(f: Fournisseur): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(this.apiUrl, f);
  }

  update(id: number, f: Fournisseur): Observable<Fournisseur> {
    return this.http.put<Fournisseur>('${this.apiUrl}/${id}', f);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>('${this.apiUrl}/${id}');
  }
}
