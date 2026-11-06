import { Component, output, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';

@Component({
  selector: 'bg-topbar',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <header class="topbar">
      <div class="breadcrumb">
        <button class="toggle-btn" (click)="toggleSidebar.emit()" title="Toggle Sidebar">☰</button>
        <span class="bc-root">Workspace</span> 
        <span class="bc-sep">/</span> 
        <b class="bc-title">{{ pageTitle() }}</b>
      </div>

      <div class="top-actions">
        <span class="live-indicator">
          <i></i> Live
        </span>

        <!-- Notifications -->
        <div class="action-dropdown">
          <button class="icon-button" (click)="toggleNotifications()" title="Notifications">
            ♧
            @if (unreadCount() > 0) {
              <em></em>
            }
          </button>

          @if (notificationsOpen()) {
            <div class="dropdown-menu notif-menu">
              <div class="menu-head">
                <span>Notifications ({{ unreadCount() }})</span>
                <button class="clear-btn" (click)="markAllRead()">Clear all</button>
              </div>
              <div class="notif-list">
                @for (item of notifications(); track item.id) {
                  <div class="notif-row" [class.unread]="!item.read" (click)="goTo(item.link)">
                    <span class="notif-dot" [class]="item.type"></span>
                    <div class="notif-body">
                      <b>{{ item.title }}</b>
                      <p>{{ item.message }}</p>
                      <small>{{ item.timestamp | date:'hh:mm a' }}</small>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-notif">No new notifications</div>
                }
              </div>
            </div>
          }
        </div>

        <!-- User Profile Dropdown -->
        <div class="action-dropdown">
          <div class="top-avatar" (click)="toggleProfile()" title="User Profile">
            {{ userInitials }}
          </div>

          @if (profileOpen()) {
            <div class="dropdown-menu profile-menu">
              <div class="profile-summary">
                <b>{{ currentUser()?.fullName || 'Admin Desk' }}</b>
                <small>{{ currentUser()?.email }}</small>
                <span class="badge-role">{{ currentUser()?.role }}</span>
              </div>
              <button class="menu-link" (click)="goTo('/settings')">⚙ Settings</button>
              <button class="menu-link" (click)="goTo('/audit-logs')">📋 Audit Logs</button>
              <div class="menu-hr"></div>
              <button class="menu-link signout" (click)="logout()">Sign out</button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 66px;
      background: #fff;
      border-bottom: 1px solid #e9edf3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      position: sticky;
      top: 0;
      z-index: 50;
      box-sizing: border-box;
      max-width: 100%;
    }

    .breadcrumb {
      font-size: 11px;
      color: #98a2b3;
      display: flex;
      align-items: center;
      min-width: 0;
      overflow: hidden;
    }
    .toggle-btn {
      background: none;
      border: none;
      font-size: 17px;
      color: #667085;
      cursor: pointer;
      margin-right: 10px;
      padding: 6px;
      border-radius: 5px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .toggle-btn:hover {
      background: #f5f7fc;
      color: #172b4d;
    }
    .bc-root {
      color: #98a2b3;
      white-space: nowrap;
    }
    .bc-sep {
      padding: 0 7px;
      color: #c4cbd5;
      flex-shrink: 0;
    }
    .bc-title {
      color: #344054;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 220px;
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      color: #667085;
      font-weight: 600;
    }
    .live-indicator i {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #21b77a;
      box-shadow: 0 0 0 3px #e4f7ee;
    }

    .action-dropdown {
      position: relative;
    }

    .icon-button {
      border: 0;
      background: none;
      color: #667085;
      font-size: 19px;
      position: relative;
      cursor: pointer;
      padding: 6px;
      display: grid;
      place-items: center;
      border-radius: 6px;
    }
    .icon-button:hover {
      background: #f5f7fc;
    }
    .icon-button em {
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ed8c47;
      right: 4px;
      top: 4px;
    }

    .top-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e9efff;
      color: #315fcb;
      display: grid;
      place-items: center;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      user-select: none;
      flex-shrink: 0;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background: #fff;
      border: 1px solid #e9edf3;
      border-radius: 9px;
      box-shadow: 0 10px 30px rgba(23, 43, 77, 0.15);
      z-index: 100;
      overflow: hidden;
      box-sizing: border-box;
    }

    .notif-menu {
      width: min(320px, calc(100vw - 24px));
      max-width: calc(100vw - 24px);
    }
    .menu-head {
      padding: 12px 14px;
      background: #fafbfd;
      border-bottom: 1px solid #edf0f5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 700;
      color: #172b4d;
    }
    .clear-btn {
      background: none;
      border: none;
      color: #315fcb;
      font-size: 10px;
      cursor: pointer;
      padding: 0;
    }
    .notif-list {
      max-height: 300px;
      overflow-y: auto;
    }
    .notif-row {
      padding: 10px 14px;
      border-bottom: 1px solid #f1f3f6;
      display: flex;
      gap: 10px;
      cursor: pointer;
    }
    .notif-row:hover {
      background: #f8fafd;
    }
    .notif-row.unread {
      background: #f4f7ff;
    }
    .notif-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
    }
    .notif-dot.error { background: #df5a55; }
    .notif-dot.warning { background: #e28a43; }
    .notif-dot.info { background: #315fcb; }
    .notif-dot.success { background: #168a5c; }
    .notif-body {
      flex: 1;
      min-width: 0;
    }
    .notif-body b {
      display: block;
      font-size: 11px;
      color: #172b4d;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .notif-body p {
      font-size: 10px;
      color: #667085;
      margin: 2px 0 3px;
      overflow-wrap: break-word;
    }
    .notif-body small {
      font-size: 9px;
      color: #a1aab8;
    }
    .empty-notif {
      padding: 24px;
      text-align: center;
      font-size: 11px;
      color: #98a2b3;
    }

    .profile-menu {
      width: min(220px, calc(100vw - 24px));
      max-width: calc(100vw - 24px);
      padding: 8px 0;
    }
    .profile-summary {
      padding: 10px 14px;
      border-bottom: 1px solid #edf0f5;
    }
    .profile-summary b {
      display: block;
      font-size: 12px;
      color: #172b4d;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .profile-summary small {
      display: block;
      font-size: 10px;
      color: #98a2b3;
      margin: 2px 0 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .badge-role {
      display: inline-block;
      background: #edf3ff;
      color: #315fcb;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .menu-link {
      width: 100%;
      text-align: left;
      padding: 8px 14px;
      background: none;
      border: none;
      font-size: 11px;
      color: #344054;
      cursor: pointer;
    }
    .menu-link:hover {
      background: #f5f7fc;
      color: #315fcb;
    }
    .menu-link.signout {
      color: #df5a55;
    }
    .menu-hr {
      height: 1px;
      background: #edf0f5;
      margin: 4px 0;
    }

    @media (max-width: 860px) {
      .topbar {
        padding: 0 16px;
        height: 58px;
      }
      .bc-title {
        max-width: 150px;
      }
      .live-indicator {
        display: none;
      }
    }

    @media (max-width: 425px) {
      .topbar {
        padding: 0 10px;
        gap: 6px;
      }
      .bc-root, .bc-sep {
        display: none;
      }
      .bc-title {
        max-width: 120px;
        font-size: 12px;
      }
      .top-actions {
        gap: 8px;
      }
    }
  `]
})
export class TopbarComponent {
  toggleSidebar = output<void>();

  private router = inject(Router);
  private authService = inject(AuthService);
  private notifService = inject(NotificationService);

  pageTitle = signal<string>('Overview');
  notificationsOpen = signal<boolean>(false);
  profileOpen = signal<boolean>(false);

  currentUser = this.authService.user;
  notifications = this.notifService.notifications;
  unreadCount = this.notifService.unreadCount;

  get userInitials(): string {
    const name = this.currentUser()?.fullName || 'AD';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.updateTitle(url);
        this.notificationsOpen.set(false);
        this.profileOpen.set(false);
      });
  }

  private updateTitle(url: string): void {
    if (url.includes('/dashboard')) this.pageTitle.set('Overview');
    else if (url.includes('/transactions/')) this.pageTitle.set('Txn Details');
    else if (url.includes('/transactions')) this.pageTitle.set('Transactions');
    else if (url.includes('/fraud-monitoring')) this.pageTitle.set('Fraud Monitoring');
    else if (url.includes('/fraud-alerts')) this.pageTitle.set('Fraud Alerts');
    else if (url.includes('/customers/')) this.pageTitle.set('Customer Dossier');
    else if (url.includes('/customers')) this.pageTitle.set('Customers');
    else if (url.includes('/accounts/')) this.pageTitle.set('Account Ledger');
    else if (url.includes('/accounts')) this.pageTitle.set('Bank Accounts');
    else if (url.includes('/reports')) this.pageTitle.set('Reports');
    else if (url.includes('/user-management')) this.pageTitle.set('User Management');
    else if (url.includes('/audit-logs')) this.pageTitle.set('Audit Logs');
    else if (url.includes('/settings')) this.pageTitle.set('Settings');
    else this.pageTitle.set('Overview');
  }

  toggleNotifications(): void {
    this.notificationsOpen.update(v => !v);
    this.profileOpen.set(false);
  }

  toggleProfile(): void {
    this.profileOpen.update(v => !v);
    this.notificationsOpen.set(false);
  }

  markAllRead(): void {
    this.notifService.markAllAsRead();
  }

  goTo(route: string): void {
    this.notificationsOpen.set(false);
    this.profileOpen.set(false);
    this.router.navigate([route]);
  }

  logout(): void {
    this.profileOpen.set(false);
    this.authService.logout();
  }
}
