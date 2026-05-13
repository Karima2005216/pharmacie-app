import { Component } from '@angular/core';
import { ConfirmService } from '../../../core/services/confirm';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (confirmService.isOpen()) {
      <div class="overlay" (click)="confirmService.cancel()">
        <div class="dialog" (click)="$event.stopPropagation()">

          <div class="dialog-header">
            <span class="dialog-icon">🗑️</span>
            <h3>{{ confirmService.data().titre }}</h3>
          </div>

          <div class="dialog-body">
            <p>{{ confirmService.data().message }}</p>
          </div>

          <div class="dialog-actions">
            <button (click)="confirmService.cancel()" class="btn-cancel">
              {{ confirmService.data().btnCancel }}
            </button>
            <button (click)="confirmService.confirm()" class="btn-confirm">
              {{ confirmService.data().btnConfirm }}
            </button>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease;
    }
    .dialog {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: slideUp 0.2s ease;
    }
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .dialog-icon { font-size: 1.8rem; }
    .dialog-header h3 {
      margin: 0;
      color: #0277bd;
      font-size: 1.2rem;
    }
    .dialog-body {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .dialog-body p {
      margin: 0;
      color: #555;
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    .btn-cancel {
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      border: 1px solid #ddd;
      background: white;
      color: #666;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    .btn-cancel:hover { background: #f5f5f5; }
    .btn-confirm {
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      border: none;
      background: #f44336;
      color: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-confirm:hover { background: #c62828; }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(public confirmService: ConfirmService) {}
}