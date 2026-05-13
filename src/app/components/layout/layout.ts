import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent} from '../navbar/navbar';
import { ToastComponent } from '../shared/toast/toast';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent,ToastComponent,ConfirmDialogComponent],
  template: `
    <div style="display:flex">
      <app-navbar></app-navbar>
      <div style="flex:1">
        <router-outlet></router-outlet>
      </div>
    </div>
    <app-toast />
    <app-confirm-dialog />
  `
})
export class LayoutComponent {}