import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'bg-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unauth-page">
      <div class="unauth-card">
        <div class="lock-icon">🔒</div>
        <div class="error-badge">403 — ACCESS FORBIDDEN</div>
        <h1>Restricted Security Clearance</h1>
        <p>
          Your authenticated institutional identity (<b>{{ currentUser()?.fullName || 'Anonymous' }}</b>, 
          Role: <span class="role-pill">{{ userRole() || 'Unassigned' }}</span>) does not possess the 
          required permissions or regulatory authorization to view or execute actions on this resource.
        </p>

        <div class="policy-notice">
          <b>Institutional Security Policy:</b>
          <span>Role-Based Access Control (RBAC) is strictly enforced under core banking compliance. All unauthorized traversal attempts are recorded in the immutable audit log.</span>
        </div>

        <div class="unauth-actions">
          <button class="primary-button" (click)="returnToDashboard()">
            ← Return to {{ userRole() || 'Role' }} Dashboard
          </button>
          <button class="secondary-button" (click)="switchAccount()">
            Sign in as Different User
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauth-page {
      min-height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .unauth-card {
      background: #fff;
      border: 1px solid #e9edf3;
      border-radius: 12px;
      padding: 40px 32px;
      max-width: 540px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(23, 43, 77, 0.08);
    }
    .lock-icon {
      font-size: 42px;
      margin-bottom: 14px;
    }
    .error-badge {
      display: inline-block;
      background: #fff0ef;
      color: #df5a55;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.8px;
      padding: 4px 10px;
      border-radius: 20px;
      margin-bottom: 12px;
    }
    .unauth-card h1 {
      font: 800 22px 'Manrope', sans-serif;
      color: #172b4d;
      margin-bottom: 12px;
    }
    .unauth-card p {
      color: #667085;
      font-size: 12px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .role-pill {
      background: #edf3ff;
      color: #315fcb;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
    }
    .policy-notice {
      background: #fafbfd;
      border: 1px solid #edf0f5;
      border-radius: 8px;
      padding: 12px 14px;
      text-align: left;
      font-size: 11px;
      color: #7b8798;
      margin-bottom: 24px;
    }
    .policy-notice b {
      display: block;
      color: #344054;
      margin-bottom: 4px;
    }
    .unauth-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .unauth-actions button {
      min-width: 180px;
    }
  `]
})
export class UnauthorizedComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.user;
  userRole = this.authService.userRole;

  returnToDashboard(): void {
    const route = this.authService.defaultDashboardRoute();
    this.router.navigate([route]);
  }

  switchAccount(): void {
    this.authService.logout();
  }
}

