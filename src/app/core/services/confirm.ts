import { Injectable, signal } from '@angular/core';

export interface ConfirmData {
  titre: string;
  message: string;
  btnConfirm: string;
  btnCancel: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  isOpen = signal(false);
  data = signal<ConfirmData>({
    titre: 'Confirmation',
    message: 'Êtes-vous sûr ?',
    btnConfirm: 'Confirmer',
    btnCancel: 'Annuler'
  });

  private resolveFn!: (value: boolean) => void;

  open(data: Partial<ConfirmData>): Promise<boolean> {
    this.data.set({ ...this.data(), ...data });
    this.isOpen.set(true);

    return new Promise(resolve => {
      this.resolveFn = resolve;
    });
  }

  confirm(): void {
    this.isOpen.set(false);
    this.resolveFn(true);
  }

  cancel(): void {
    this.isOpen.set(false);
    this.resolveFn(false);
  }
}