import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LayoutComponent } from './components/layout/layout';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'parametres', loadComponent: () => import('./components/parametres/parametres').then(m => m.SettingsComponent) },
      { path: 'medicaments', loadComponent: () => import('./components/medicaments/medicament-list/medicament-list').then(m => m.MedicamentListComponent) },
      { path: 'medicaments/nouveau', loadComponent: () => import('./components/medicaments/medicament-form/medicament-form').then(m => m.MedicamentFormComponent) },
      { path: 'medicaments/:id/edit', loadComponent: () => import('./components/medicaments/medicament-form/medicament-form').then(m => m.MedicamentFormComponent) },
      { path: 'medicaments/:id', loadComponent: () => import('./components/medicaments/medicament-detail/medicament-detail').then(m => m.MedicamentDetailComponent) },
      { path: 'fournisseurs', loadComponent: () => import('./components/fournisseurs/fournisseur-list/fournisseur-list').then(m => m.FournisseurListComponent) },
      { path: 'fournisseurs/nouveau', loadComponent: () => import('./components/fournisseurs/fournisseur-form/fournisseur-form').then(m => m.FournisseurFormComponent) },
      { path: 'fournisseurs/:id/edit', loadComponent: () => import('./components/fournisseurs/fournisseur-form/fournisseur-form').then(m => m.FournisseurFormComponent) },
      { path: 'clients', loadComponent: () => import('./components/clients/client-list/client-list').then(m => m.ClientListComponent) },
      { path: 'clients/nouveau', loadComponent: () => import('./components/clients/client-form/client-form').then(m => m.ClientFormComponent) },
      { path: 'clients/:id/edit', loadComponent: () => import('./components/clients/client-form/client-form').then(m => m.ClientFormComponent) },
      { path: 'ventes', loadComponent: () => import('./components/ventes/vente-list/vente-list').then(m => m.VenteListComponent) },
      { path: 'ventes/nouvelle', loadComponent: () => import('./components/ventes/vente-form/vente-form').then(m => m.VenteFormComponent) },
      { path: 'ventes/:id/ordonnance', loadComponent: () => import('./components/ventes/ordonnance/ordonnance').then(m => m.OrdonnanceComponent) },
      {
  path: 'recherche',
  loadComponent: () =>
    import('./components/recherche/recherche')
      .then(m => m.RechercheComponent)
},
    ]
  },
  { path: '**', redirectTo: 'login' }
];