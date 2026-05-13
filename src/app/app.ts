import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  template: `
    @if (!isLoginPage) {
      <app-navbar />
    }
    <main [class]="isLoginPage ? 'full-page' : 'main-content'">
      <router-outlet />
    </main>
  `,
  styles: [`
    .main-content {
      margin-left: 250px;
      padding: 2rem;
      min-height: 100vh;
      background: #f0f8ff;
    }
    .full-page {
      margin-left: 0;
      padding: 0;
      min-height: 100vh;
    }
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
        padding: 1rem;
      }
    }
  `]
})
export class AppComponent {
  isLoginPage = false;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = event.url.includes('/login');
      }
    });
  }
}