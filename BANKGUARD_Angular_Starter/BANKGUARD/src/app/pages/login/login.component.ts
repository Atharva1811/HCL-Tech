import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'bg-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="brand-mark">B</div>
          <h1>BANKGUARD</h1>
          <p>Banking Operation & Fraud Monitoring</p>
          <div class="group-tag">HCL Main Project · Group 10</div>
        </div>

        @if (errorMessage()) {
          <div class="error-alert">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="field-group">
            <label for="username">Username / ID</label>
            <input 
              id="username" 
              type="text" 
              name="username"
              [(ngModel)]="username" 
              placeholder="e.g. admin or pratik.b" 
              required>
          </div>

          <div class="field-group">
            <label for="password">Password</label>
            <input 
              id="password" 
              type="password" 
              name="password"
              [(ngModel)]="password" 
              placeholder="••••••••" 
              required>
          </div>

          <button type="submit" class="primary-button login-btn" [disabled]="loading()">
            @if (loading()) {
              <span>Authenticating...</span>
            } @else {
              <span>Sign in to Dashboard →</span>
            }
          </button>
        </form>

        <div class="demo-hints">
          <div class="hints-title">Available Demo Roles (password: <code>admin123</code>):</div>
          <div class="role-chips">
            <button type="button" class="role-chip" (click)="quickFill('admin')">
              <b>Super Admin</b>: <code>admin</code>
            </button>
            <button type="button" class="role-chip" (click)="quickFill('pratik.b')">
              <b>Bank Admin</b>: <code>pratik.b</code>
            </button>
            <button type="button" class="role-chip" (click)="quickFill('tanvesh.y')">
              <b>Fraud Investigator</b>: <code>tanvesh.y</code>
            </button>
            <button type="button" class="role-chip" (click)="quickFill('auditor')">
              <b>Auditor</b>: <code>auditor</code>
            </button>
          </div>
        </div>

        <div class="login-footer">
          <span>Protected by Rule-Based Fraud Detection System</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      background: #f5f7fb;
      display: grid;
      place-items: center;
      padding: 20px;
    }
    .login-card {
      width: 100%;
      max-width: 440px;
      background: #fff;
      border: 1px solid #e9edf3;
      border-radius: 12px;
      padding: 36px 32px;
      box-shadow: 0 10px 30px rgba(23, 43, 77, 0.08);
    }
    .login-header {
      text-align: center;
      margin-bottom: 26px;
    }
    .brand-mark {
      width: 46px;
      height: 46px;
      background: #315fcb;
      border-radius: 12px;
      color: #fff;
      display: grid;
      place-items: center;
      font: 800 26px 'Manrope', sans-serif;
      margin: 0 auto 12px;
      box-shadow: 0 6px 14px rgba(49, 95, 203, 0.28);
    }
    .login-header h1 {
      font: 800 20px 'Manrope', sans-serif;
      letter-spacing: 1.2px;
      color: #172b4d;
      margin: 0;
    }
    .login-header p {
      color: #98a2b3;
      font-size: 12px;
      margin: 4px 0 8px;
    }
    .group-tag {
      display: inline-block;
      background: #edf3ff;
      color: #315fcb;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 20px;
    }

    .error-alert {
      background: #fff0ef;
      color: #d95b56;
      border: 1px solid #ffd8d6;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 12px;
      margin-bottom: 18px;
    }

    .login-form {
      display: grid;
      gap: 16px;
    }
    .field-group {
      display: grid;
      gap: 6px;
    }
    .field-group label {
      font-size: 11px;
      font-weight: 700;
      color: #687589;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .field-group input {
      border: 1px solid #e8ecf2;
      border-radius: 8px;
      padding: 11px 14px;
      font: 12px 'DM Sans', sans-serif;
      color: #172b4d;
      outline: none;
      transition: border-color 0.15s;
    }
    .field-group input:focus {
      border-color: #315fcb;
    }

    .login-btn {
      width: 100%;
      padding: 12px;
      font-size: 12px;
      justify-content: center;
      margin-top: 6px;
    }

    .demo-hints {
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid #f0f2f5;
    }
    .hints-title {
      font-size: 10px;
      font-weight: 700;
      color: #98a2b3;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .role-chips {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .role-chip {
      background: #f7f9fc;
      border: 1px solid #edf0f5;
      border-radius: 6px;
      padding: 6px 8px;
      text-align: left;
      font-size: 10px;
      color: #687589;
      cursor: pointer;
    }
    .role-chip:hover {
      background: #edf3ff;
      border-color: #c9dbff;
      color: #315fcb;
    }
    .role-chip code {
      background: #eef1f6;
      padding: 1px 4px;
      border-radius: 3px;
    }

    .login-footer {
      margin-top: 20px;
      text-align: center;
      font-size: 10px;
      color: #a1aab8;
    }

    @media (max-width: 380px) {
      .login-card {
        padding: 24px 16px;
      }
      .role-chips {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = 'admin';
  password = 'admin123';
  loading = signal(false);
  errorMessage = signal('');

  quickFill(user: string): void {
    this.username = user;
    this.password = 'admin123';
  }

  onLogin(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    setTimeout(() => {
      const res = this.authService.login(this.username, this.password);
      this.loading.set(false);

      if (res.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage.set(res.message);
      }
    }, 300);
  }
}

