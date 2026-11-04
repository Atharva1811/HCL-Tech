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
        Workspace <span>/</span> <b>{{ pageTitle() }}</b>
      </div>

      <div class="top-actions">
        <span class="live-indicator">
          <i></i> Demo environment
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
                    <div>
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
      height: 70px;
      background: #fff;
      border-bottom: 1px solid #e9edf3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 38px;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .breadcrumb {
      font-size: 11px;
      color: #98a2b3;
      display: flex;
      align-items: center;
    }
    .toggle-btn {
      background: none;
      border: none;
      font-size: 16px;
      color: #667085;
      cursor: pointer;
      margin-right: 12px;
      padding: 4px;
      border-radius: 4px;
    }
    .toggle-btn:hover {
      background: #f5f7fc;
    }
    .breadcrumb span {
      padding: 0 9px;
      color: #c4cbd5;
    }
    .breadcrumb b {
      color: #344054;
      font-weight: 700;
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 22px;
    }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 10px;
      color: #667085;
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
      font-size: 20px;
      position: relative;
      cursor: pointer;
      padding: 4px;
    }
    .icon-button em {
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ed8c47;
      right: 2px;
      top: 2px;
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
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background: #fff;
      border: 1px solid #e9edf3;
      border-radius: 9px;
      box-shadow: 0 10px 30px rgba(23, 43, 77, 0.12);
      z-index: 100;
      overflow: hidden;
    }

    .notif-menu {
      width: 320px;
    }
    .menu-head {
      padding: 12px 16px;
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
    }
    .notif-list {
      max-height: 320px;
      overflow-y: auto;
    }
    .notif-row {
      padding: 12px 16px;
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
    .notif-row b {
      display: block;
      font-size: 11px;
      color: #172b4d;
    }
    .notif-row p {
      font-size: 10px;
      color: #667085;
      margin: 2px 0 4px;
    }
    .notif-row small {
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
      width: 220px;
      padding: 8px 0;
    }
    .profile-summary {
      padding: 12px 16px;
      border-bottom: 1px solid #edf0f5;
    }
    .profile-summary b {
      display: block;
      font-size: 12px;
      color: #172b4d;
    }
    .profile-summary small {
      display: block;
      font-size: 10px;
      color: #98a2b3;
      margin: 2px 0 6px;
    }
    .badge-role {
      display: inline-block;
      background: #edf3ff;
      color: #315fcb;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
    }
    .menu-link {
      width: 100%;
      text-align: left;
      padding: 9px 16px;
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

    @media (max-width: 760px) {
      .topbar {
        padding: 0 16px;
      }
      .live-indicator {
        display: none;
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
    else if (url.includes('/transactions/')) this.pageTitle.set('Transaction Details');
    else if (url.includes('/transactions')) this.pageTitle.set('Transactions');
    else if (url.includes('/fraud-monitoring')) this.pageTitle.set('Fraud Monitoring');
    else if (url.includes('/fraud-alerts')) this.pageTitle.set('Fraud Alerts');
    else if (url.includes('/customers/')) this.pageTitle.set('Customer Profile');
    else if (url.includes('/customers')) this.pageTitle.set('Customers');
    else if (url.includes('/accounts/')) this.pageTitle.set('Account Details');
    else if (url.includes('/accounts')) this.pageTitle.set('Bank Accounts');
    else if (url.includes('/reports')) this.pageTitle.set('Reports & Analytics');
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
