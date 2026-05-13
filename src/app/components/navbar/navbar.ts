import { Component, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MedicamentService } from '../../core/services/medicament';
import { ThemeService } from '../../core/services/theme';
import { LangueService, Langue } from '../../core/services/langue';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    @if (!isLoginPage()) {
      <nav class="sidebar">
        <div class="logo">
          <span>💊</span>
          <span>PharmaGest</span>
        </div>

        @if (medicamentService.alertes().length > 0) {
          <div class="alert-banner">
            ⚠️ {{ medicamentService.alertes().length }}
            {{ lang().alertes }}
          </div>
        }

        <ul class="nav-links">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active">
              📊 {{ lang().dashboard }}
            </a>
          </li>
          <li>
            <a routerLink="/medicaments" routerLinkActive="active">
              💊 {{ lang().medicaments }}
              @if (medicamentService.alertes().length > 0) {
                <span class="badge">{{ medicamentService.alertes().length }}</span>
              }
            </a>
          </li>
          <li>
            <a routerLink="/fournisseurs" routerLinkActive="active">
              🏭 {{ lang().fournisseurs }}
            </a>
          </li>
          <li>
            <a routerLink="/clients" routerLinkActive="active">
              👥 {{ lang().clients }}
            </a>
          </li>
          <li>
            <a routerLink="/ventes" routerLinkActive="active">
              🧾 {{ lang().ventes }}
            </a>
          </li>
          <li>
            <a routerLink="/recherche" routerLinkActive="active">
              🔍 {{ lang().recherche }}
            </a>
          </li>
          <li>
            <a routerLink="/parametres" routerLinkActive="active">
              ⚙️ {{ lang().parametres }}
            </a>
          </li>
        </ul>

        <div class="lang-selector">
          <button
            (click)="langueService.setLangue('fr')"
            [class.active-lang]="langueService.langue() === 'fr'"
            class="lang-btn">
            🇫🇷 FR
          </button>
          <button
            (click)="langueService.setLangue('ar')"
            [class.active-lang]="langueService.langue() === 'ar'"
            class="lang-btn">
            🇲🇦 AR
          </button>
          <button
            (click)="langueService.setLangue('en')"
            [class.active-lang]="langueService.langue() === 'en'"
            class="lang-btn">
            🇬🇧 EN
          </button>
        </div>

        <div class="theme-toggle" (click)="themeService.toggle()">
          @if (themeService.isDark()) {
            ☀️ {{ lang().modeClaire }}
          } @else {
            🌙 {{ lang().modeSombre }}
          }
        </div>

        <div class="logout" (click)="logout()">
          🚪 {{ lang().deconnexion }}
        </div>

        <div class="sidebar-footer">
          🏥 Pharmacie Manager
        </div>
      </nav>
    }
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0; top: 0;
      width: 250px;
      height: 100vh;
      background: linear-gradient(180deg, #377a5fff, #52B69A);
      color: white;
      padding: 1.5rem 0;
      z-index: 100;
      display: flex;
      flex-direction: column;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1.5rem 1.5rem;
      font-size: 1.3rem;
      font-weight: bold;
      border-bottom: 1px solid rgba(255,255,255,0.2);
      color: white;
    }
    .alert-banner {
      background: #f44336;
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
      text-align: center;
      margin: 0.75rem 1rem;
      border-radius: 6px;
    }
    .nav-links {
      list-style: none;
      padding: 1rem 0;
      margin: 0;
      flex: 1;
    }
    .nav-links li a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.9rem 1.5rem;
      color: rgba(255,255,255,0.9);
      text-decoration: none;
      transition: all 0.2s;
      font-size: 0.95rem;
    }
    .nav-links li a:hover,
    .nav-links li a.active {
      background: rgba(255,255,255,0.15);
      color: white;
      border-left: 3px solid #B7E4C7;
    }
    .badge {
      background: #f44336;
      color: white;
      border-radius: 50%;
      width: 20px; height: 20px;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: auto;
    }
    .lang-selector {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .lang-btn {
      flex: 1;
      padding: 0.4rem;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 6px;
      background: transparent;
      color: rgba(255,255,255,0.7);
      cursor: pointer;
      font-size: 0.75rem;
      transition: all 0.2s;
    }
    .lang-btn:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    .lang-btn.active-lang {
      background: rgba(255,255,255,0.25);
      color: white;
      border-color: white;
      font-weight: bold;
    }
    .theme-toggle {
      padding: 0.75rem 1.5rem;
      color: rgba(255,255,255,0.8);
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.9rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .theme-toggle:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    .logout {
      padding: 1rem 1.5rem;
      color: rgba(255,255,255,1);
      cursor: pointer;
      border-top: 1px solid rgba(255,255,255,0.2);
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .logout:hover {
      background: rgba(255,0,0,0.2);
      color: white;
    }
    .sidebar-footer {
      padding: 1rem 1.5rem;
      font-size: 0.75rem;
      opacity: 0.6;
      border-top: 1px solid rgba(255,255,255,0.2);
      text-align: center;
    }
    @media (max-width: 768px) {
      .sidebar { width: 100%; height: auto; position: relative; }
    }
  `]
})
export class NavbarComponent {

  lang = computed(() => this.langueService.t());

  constructor(
    public medicamentService: MedicamentService,
    public themeService: ThemeService,
    public langueService: LangueService,
    private authService: AuthService,
    private router: Router
  ) {}

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  logout(): void {
    this.authService.logout();
  }
}