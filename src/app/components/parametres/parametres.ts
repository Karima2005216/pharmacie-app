import { Component, OnInit, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService, User } from '../../core/services/auth.service';
import { LangueService } from '../../core/services/langue';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  templateUrl: './parametres.html',
  styleUrls: ['./parametres.scss']
})
export class SettingsComponent implements OnInit {
  emailForm!: FormGroup;
  passwordForm!: FormGroup;
  currentUser!: User;
  hideNew = true;
  hideConfirm = true;

  lang = computed(() => this.langueService.t());

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public langueService: LangueService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) this.currentUser = user;
    this.currentUser = this.authService.getUser()!;

    this.emailForm = this.fb.group({
      email: [
        this.currentUser?.email || '',
        [Validators.required, Validators.email]
      ]
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: AbstractControl) {
    const newPwd = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return newPwd === confirm ? null : { mismatch: true };
  }

  onUpdateEmail(): void {
    if (this.emailForm.valid && this.currentUser?.id) {
      this.authService.updateEmail(this.currentUser.id, this.emailForm.value.email)
        .subscribe({
          next: () => {
            this.currentUser.email = this.emailForm.value.email;
            this.snackBar.open('✅ ' + this.lang().emailMisAJour, this.lang().fermer, { duration: 3000 });
          },
          error: () => this.snackBar.open('❌ ' + this.lang().erreurMiseAJour, this.lang().fermer, { duration: 3000 })
        });
    }
  }

  onUpdatePassword(): void {
    if (this.passwordForm.valid && this.currentUser?.id) {
      this.authService.updatePassword(this.currentUser.id, this.passwordForm.value.newPassword)
        .subscribe({
          next: () => {
            this.snackBar.open('✅ ' + this.lang().motDePasseMisAJour, this.lang().fermer, { duration: 3000 });
            this.passwordForm.reset();
          },
          error: () => this.snackBar.open('❌ ' + this.lang().erreurMiseAJour, this.lang().fermer, { duration: 3000 })
        });
    }
  }
}