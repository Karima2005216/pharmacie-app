import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _toasts = signal<Toast[]>([]);
  toasts = this._toasts.asReadonly();
  private counter = 0;

  success(message: string): void {
    this.add(message, 'success', '✅');
  }

  error(message: string): void {
    this.add(message, 'error', '❌');
  }

  warning(message: string): void {
    this.add(message, 'warning', '⚠️');
  }

  info(message: string): void {
    this.add(message, 'info', 'ℹ️');
  }

  private add(
    message: string,
    type: Toast['type'],
    icon: string
  ): void {
    const id = ++this.counter;
    const toast: Toast = { id, message, type, icon };
    this._toasts.update(t => [...t, toast]);
    setTimeout(() => this.remove(id), 3000);
  }

  remove(id: number): void {
    this._toasts.update(t => t.filter(toast => toast.id !== id));
  }
}