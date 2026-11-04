import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AlertService } from '../core/services/alert.service';
import { AuthService } from '../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  iconSymbol: string;
  badge?: () => number;
}

@Component({
  selector: 'bg-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <div class="brand">
        <div class="brand-mark">B</div>
        @if (!collapsed()) {
          <div>
            <strong>BANKGUARD</strong>
            <small>Banking intelligence</small>
          </div>
        }
      </div>

      <div class="workspace-label">
        @if (!collapsed()) { WORKSPACE }
      </div>

      <nav>
        @for (item of navItems; track item.route) {
          <a [routerLink]="item.route" 
             routerLinkActive="active" 
             class="nav-item"
             [title]="item.label">
            <span class="nav-icon">{{ item.iconSymbol }}</span>
            @if (!collapsed()) {
              <span class="nav-text">{{ item.label }}</span>
              @if (item.badge && item.badge() > 0) {
                <span class="nav-count">{{ item.badge!() }}</span>
              }
            }
          </a>
        }
      </nav>

      <div class="sidebar-bottom">
        @if (!collapsed()) {
          <div class="secure-card">
            <div class="secure-icon">✓</div>
            <div>
              <b>System protected</b>
              <small>All services operational</small>
            </div>
            <span class="online-dot"></span>
          </div>
        }

        <div class="profile">
          <div class="avatar">{{ userInitials }}</div>
          @if (!collapsed()) {
            <div class="profile-copy">
              <b>{{ currentUser()?.fullName || 'Admin Desk' }}</b>
              <small>{{ currentUser()?.role || 'Super Administrator' }}</small>
            </div>
          }
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 248px;
      background: #fff;
      border-right: 1px solid #e9edf3;
      position: fixed;
      inset: 0 auto 0 0;
      display: flex;
      flex-direction: column;
      padding: 27px 16px 18px;
      z-index: 100;
      transition: width 0.2s ease;
    }
    .sidebar.collapsed {
      width: 68px;
      padding: 27px 8px 18px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 0 10px 32px;
    }
    .brand-mark {
      width: 38px;
      height: 38px;
      background: #315fcb;
      border-radius: 11px;
      color: #fff;
      display: grid;
      place-items: center;
      font: 800 22px 'Manrope', sans-serif;
      box-shadow: 0 5px 12px rgba(49, 95, 203, 0.25);
      flex-shrink: 0;
    }
    .brand strong {
      display: block;
      font: 800 14px 'Manrope', sans-serif;
      letter-spacing: 1.1px;
      color: #172b4d;
    }
    .brand small {
      display: block;
      color: #98a2b3;
      font-size: 10px;
      margin-top: 2px;
    }

    .workspace-label {
      font-size: 10px;
      letter-spacing: 1.15px;
      font-weight: 700;
      color: #98a2b3;
      padding: 0 12px 10px;
      min-height: 22px;
    }

    nav {
      display: grid;
      gap: 4px;
      flex: 1;
      overflow-y: auto;
    }

    .nav-item {
      height: 40px;
      border: 0;
      background: transparent;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 12px;
      text-align: left;
      color: #687589;
      font: 600 12px 'DM Sans', sans-serif;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s;
    }
    .nav-item:hover {
      background: #f5f7fc;
      color: #172b4d;
    }
    .nav-item.active {
      background: #edf3ff;
      color: #315fcb;
      font-weight: 700;
    }
    .nav-icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }
    .nav-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    .nav-count {
      margin-left: auto;
      background: #fff0e8;
      color: #e17b36;
      border-radius: 20px;
      padding: 2px 7px;
      font-size: 10px;
      font-weight: 700;
    }

    .sidebar-bottom {
      margin-top: auto;
    }

    .secure-card {
      background: #f7f9fc;
      border: 1px solid #edf0f5;
      border-radius: 9px;
      padding: 11px 12px;
      display: flex;
      align-items: center;
      gap: 9px;
      margin-bottom: 14px;
    }
    .secure-icon {
      width: 26px;
      height: 26px;
      border-radius: 7px;
      background: #e5f7ee;
      color: #15945c;
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 12px;
      flex-shrink: 0;
    }
    .secure-card b {
      display: block;
      font-size: 10px;
      color: #172b4d;
    }
    .secure-card small {
      display: block;
      font-size: 9px;
      color: #98a2b3;
      margin-top: 1px;
    }
    .online-dot {
      width: 7px;
      height: 7px;
      background: #23b77b;
      border-radius: 50%;
      display: inline-block;
      margin-left: auto;
    }

    .profile {
      border-top: 1px solid #edf0f5;
      padding: 14px 4px 0;
      display: flex;
      align-items: center;
      gap: 9px;
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e9efff;
      color: #315fcb;
      display: grid;
      place-items: center;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .profile-copy {
      flex: 1;
      overflow: hidden;
    }
    .profile-copy b {
      display: block;
      font-size: 11px;
      color: #172b4d;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .profile-copy small {
      display: block;
      font-size: 9px;
      color: #98a2b3;
      margin-top: 2px;
    }
  `]
})
export class SidebarComponent {
  collapsed = input<boolean>(false);
  toggle = output<void>();

  private alertService = inject(AlertService);
  private authService = inject(AuthService);

  currentUser = this.authService.user;

  get userInitials(): string {
    const name = this.currentUser()?.fullName || 'Admin Desk';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  navItems: NavItem[] = [
    { label: 'Overview', route: '/dashboard', iconSymbol: '▦' },
    { label: 'Transactions', route: '/transactions', iconSymbol: '⇄' },
    { label: 'Fraud Monitoring', route: '/fraud-monitoring', iconSymbol: '◈' },
    { label: 'Fraud Alerts', route: '/fraud-alerts', iconSymbol: '⚠', badge: () => this.alertService.criticalActiveCount() + this.alertService.openCount() },
    { label: 'Customers', route: '/customers', iconSymbol: '♙' },
    { label: 'Bank Accounts', route: '/accounts', iconSymbol: '🏦' },
    { label: 'Reports & Analytics', route: '/reports', iconSymbol: '▤' },
    { label: 'User Management', route: '/user-management', iconSymbol: '👥' },
    { label: 'Audit Logs', route: '/audit-logs', iconSymbol: '📋' },
    { label: 'Settings', route: '/settings', iconSymbol: '⚙' },
  ];
}
