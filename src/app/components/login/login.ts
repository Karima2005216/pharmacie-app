import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">

        <div class="login-header">
          <span class="logo-icon">💊</span>
          <h1>PharmaGest</h1>
          <p>Connexion</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <div class="form-group">
            <label>Email</label>
            <input formControlName="email"
              type="email"
              placeholder="admin@pharmacie.ma" />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="error">Email invalide</span>
            }
          </div>

          <div class="form-group">
            <label>Mot de passe</label>
            <div class="password-field">
              <input formControlName="password"
                [type]="showPassword ? 'text' : 'password'"
                placeholder="••••••••" />
              <button type="button"
                (click)="showPassword = !showPassword"
                class="toggle-pwd">
                {{ showPassword ? '👁' : '👁' }}
              </button>
            </div>
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="error">Mot de passe obligatoire</span>
            }
          </div>

          @if (loginError) {
            <div class="error-box">
              ❌ Email ou mot de passe incorrect
            </div>
          }

          <button type="submit" [disabled]="form.invalid" class="btn-login">
            Se connecter
          </button>

        </form>


      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #e1f5fe, #b3e5fc);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .login-card {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 10px 40px rgba(2, 136, 209, 0.15);
    }
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .logo-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.5rem;
    }
    .login-header h1 {
      color: #52B69A;
      font-size: 1.8rem;
      margin-bottom: 0.3rem;
    }
    .login-header p {
      color: #52B69A;
      font-size: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 1.2rem;
    }
    label {
      font-weight: 600;
      font-size: 0.9rem;
      color: #52B69A;
    }
    input {
      padding: 0.75rem 1rem;
      border: 1.5px solid #b3e5fc;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: border-color 0.2s;
      width: 100%;
    }
    input:focus {
      outline: none;
      border-color: #52B69A;
      box-shadow: 0 0 0 3px rgba(2,136,209,0.1);
    }
    .password-field {
      position: relative;
    }
    .password-field input {
      padding-right: 3rem;
    }
    .toggle-pwd {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }
    .error { color: #f44336; font-size: 0.8rem; }
    .error-box {
      background: #ffebee;
      color: #f44336;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      text-align: center;
    }
    .btn-login {
      width: 100%;
      padding: 0.85rem;
      background: #52B69A;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 0.5rem;
    }
    .btn-login:hover { background: #52B69A; }
    .btn-login:disabled { background: #ccc; cursor: not-allowed; }
    .login-footer {
      margin-top: 1.5rem;
      text-align: center;
      border-top: 1px solid #e1f5fe;
      padding-top: 1rem;
    }
    .hint {
      font-size: 0.8rem;
      color: #999;
      background: #f0f8ff;
      padding: 0.5rem;
      border-radius: 6px;
    }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loginError = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
  if (this.form.valid) {
    const { email, password } = this.form.value;
    
    // ✅ login() يرجع Observable وليس boolean
    this.authService.login(email, password).subscribe({
      next: (users) => {
        if (users.length > 0) {
          this.router.navigate(['/dashboard']);
        } else {
          this.loginError = true;
        }
      },
      error: () => {
        this.loginError = true;
      }
    });
  }
}
}