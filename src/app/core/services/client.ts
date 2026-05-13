// =============================================
// FICHIER: src/app/core/services/client.service.ts
// =============================================
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private apiUrl = 'https://pharmacie-backend-gvw3.vercel.app/clients';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  create(c: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, c);
  }

  update(id: number, c: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, c);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
