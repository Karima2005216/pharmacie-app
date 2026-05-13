import { Injectable, signal, effect, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';


export interface User {
  id?: string;
  username?: string;
  email: string;
  password: string;
  nom?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://https://https://pharmacie-backend-gvw3.vercel.app/users';

  // ─── Signals ──────────────────────────────────────
  private _isLoggedIn = signal(false);
  private _currentUser = signal<User | null>(null);

  // Readonly Signals
  isLoggedIn = this._isLoggedIn.asReadonly();
  currentUser = this._currentUser.asReadonly();

  // Computed Signal
  userDisplayName = computed(() => {
    const user = this._currentUser();
    return user?.nom || user?.username || user?.email || 'Utilisateur';
  });

  isAdmin = computed(() => {
    return this._currentUser()?.role === 'admin';
  });

  constructor(private http: HttpClient, private router: Router) {
    // استرجاع الجلسة عند بدء التطبيق
    const saved = localStorage.getItem('pharma_user');
    if (saved) {
      this._isLoggedIn.set(true);
      this._currentUser.set(JSON.parse(saved));
    }

    // ✅ effect() لمراقبة تغييرات حالة المصادقة
    effect(() => {
      const loggedIn = this._isLoggedIn();
      const user = this._currentUser();
    });
  }

  // ─── Authentication ───────────────────────────────

  login(email: string, password: string): Observable<User[]> {
    return this.http.get<User[]>(
      `${this.apiUrl}?email=${email}&password=${password}`
    ).pipe(
      tap(users => {
        if (users.length > 0) {
          localStorage.setItem('pharma_user', JSON.stringify(users[0]));
          this._isLoggedIn.set(true);
          this._currentUser.set(users[0]);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('pharma_user');
    this._isLoggedIn.set(false);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // ─── Current User ─────────────────────────────────

  getUser(): User | null {
    return this._currentUser();
  }

  // ─── Update Profile ───────────────────────────────

  updateEmail(userId: string, newEmail: string): Observable<User> {
    return this.http.patch<User>(
      `${this.apiUrl}/${userId}`,
      { email: newEmail }
    ).pipe(
      tap(updated => this.refreshLocalUser(updated))
    );
  }

  updatePassword(userId: string, newPassword: string): Observable<User> {
    return this.http.patch<User>(
      `${this.apiUrl}/${userId}`,
      { password: newPassword }
    ).pipe(
      tap(updated => this.refreshLocalUser(updated))
    );
  }

  // ─── Helper ───────────────────────────────────────

  private refreshLocalUser(updated: User): void {
    const current = this.getUser();
    if (current) {
      const merged = { ...current, ...updated };
      localStorage.setItem('pharma_user', JSON.stringify(merged));
      this._currentUser.set(merged);
    }
  }
}