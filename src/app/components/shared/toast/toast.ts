import { Component } from '@angular/core';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of notif.toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.type">
          <span class="toast-icon">{{ toast.icon }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button (click)="notif.remove(toast.id)" class="toast-close">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: 10px;
      min-width: 300px;
      max-width: 400px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
      color: white;
      font-weight: 500;
    }
    .toast-success { background: #2e7d32; }
    .toast-error   { background: #c62828; }
    .toast-warning { background: #e65100; }
    .toast-info    { background: #0277bd; }
    .toast-icon  { font-size: 1.2rem; }
    .toast-message { flex: 1; font-size: 0.95rem; }
    .toast-close {
      background: rgba(255,255,255,0.2);
      border: none; color: white;
      width: 24px; height: 24px;
      border-radius: 50%; cursor: pointer;
      font-size: 0.75rem;
      display: flex; align-items: center; justify-content: center;
    }
    .toast-close:hover { background: rgba(255,255,255,0.3); }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
  `]
})
export class ToastComponent {
  constructor(public notif: NotificationService) {}
}