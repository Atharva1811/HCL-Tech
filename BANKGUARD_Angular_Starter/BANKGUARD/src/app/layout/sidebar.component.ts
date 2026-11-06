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
    <aside class="sidebar" 
           [class.collapsed]="collapsed() && !mobileOpen()" 
           [class.mobile-open]="mobileOpen()">
      <div class="brand">
        <div class="brand-mark">B</div>
        @if (!collapsed() || mobileOpen()) {
          <div class="brand-text">
            <strong>BANKGUARD</strong>
            <small>Banking intelligence</small>
          </div>
          <button class="mobile-close-btn" (click)="closeMobile.emit()" title="Close navigation">✕</button>
        }
      </div>

      <div class="workspace-label">
        @if (!collapsed() || mobileOpen()) { WORKSPACE }
      </div>

      <nav>
        @for (item of navItems; track item.route) {
          <a [routerLink]="item.route" 
             routerLinkActive="active" 
             class="nav-item"
             (click)="closeMobile.emit()"
             [title]="item.label">
            <span class="nav-icon">{{ item.iconSymbol }}</span>
            @if (!collapsed() || mobileOpen()) {
              <span class="nav-text">{{ item.label }}</span>
              @if (item.badge && item.badge() > 0) {
                <span class="nav-count">{{ item.badge!() }}</span>
              }
            }
          </a>
        }
      </nav>

      <div class="sidebar-bottom">
        @if (!collapsed() || mobileOpen()) {
          <div class="secure-card">
            <div class="secure-icon">✓</div>
            <div class="secure-text">
              <b>System protected</b>
              <small>All services operational</small>
            </div>
            <span class="online-dot"></span>
          </div>
        }

        <div class="profile">
          <div class="avatar">{{ userInitials }}</div>
          @if (!collapsed() || mobileOpen()) {
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
      padding: 24px 14px 18px;
      z-index: 100;
      transition: width 0.2s ease, transform 0.25s ease;
      box-sizing: border-box;
      max-width: 100vw;
    }
    .sidebar.collapsed {
      width: 68px;
      padding: 24px 8px 18px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 8px 24px;
      position: relative;
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
    .brand-text {
      flex: 1;
      overflow: hidden;
    }
    .brand strong {
      display: block;
      font: 800 14px 'Manrope', sans-serif;
      letter-spacing: 1.1px;
      color: #172b4d;
      white-space: nowrap;
    }
    .brand small {
      display: block;
      color: #98a2b3;
      font-size: 10px;
      margin-top: 2px;
      white-space: nowrap;
    }
    .mobile-close-btn {
      display: none;
      background: none;
      border: none;
      font-size: 16px;
      color: #98a2b3;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
    }

    .workspace-label {
      font-size: 10px;
      letter-spacing: 1.15px;
      font-weight: 700;
      color: #98a2b3;
      padding: 0 10px 8px;
      min-height: 20px;
      text-transform: uppercase;
    }

    nav {
      display: grid;
      gap: 3px;
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      margin-bottom: 12px;
    }

    .nav-item {
      height: 38px;
      border: 0;
      background: transparent;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 10px;
      text-align: left;
      color: #687589;
      font: 600 12px 'DM Sans', sans-serif;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s;
      white-space: nowrap;
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
      flex-shrink: 0;
    }

    .sidebar-bottom {
      margin-top: auto;
      flex-shrink: 0;
    }

    .secure-card {
      background: #f7f9fc;
      border: 1px solid #edf0f5;
      border-radius: 9px;
      padding: 10px 11px;
      display: flex;
      align-items: center;
      gap: 9px;
      margin-bottom: 12px;
    }
    .secure-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: #e5f7ee;
      color: #15945c;
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 11px;
      flex-shrink: 0;
    }
    .secure-text {
      flex: 1;
      overflow: hidden;
    }
    .secure-card b {
      display: block;
      font-size: 10px;
      color: #172b4d;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .secure-card small {
      display: block;
      font-size: 9px;
      color: #98a2b3;
      margin-top: 1px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .online-dot {
      width: 7px;
      height: 7px;
      background: #23b77b;
      border-radius: 50%;
      display: inline-block;
      margin-left: auto;
      flex-shrink: 0;
    }

    .profile {
      border-top: 1px solid #edf0f5;
      padding: 12px 2px 0;
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
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    /* Off-canvas behavior on <= 860px */
    @media (max-width: 860px) {
      .sidebar {
        width: 260px !important;
        transform: translateX(-100%);
        box-shadow: none;
      }
      .sidebar.mobile-open {
        transform: translateX(0) !important;
        box-shadow: 4px 0 28px rgba(23, 43, 77, 0.22);
      }
      .mobile-close-btn {
        display: block;
      }
    }
  `]
})
export class SidebarComponent {
  collapsed = input<boolean>(false);
  mobileOpen = input<boolean>(false);
  toggle = output<void>();
  closeMobile = output<void>();

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
