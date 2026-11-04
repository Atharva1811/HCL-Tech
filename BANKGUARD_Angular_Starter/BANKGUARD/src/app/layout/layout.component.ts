import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';

@Component({
  selector: 'bg-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="app-shell">
      <bg-sidebar 
        [collapsed]="sidebarCollapsed()" 
        (toggle)="toggleSidebar()">
      </bg-sidebar>

      <main class="main-content" [class.expanded]="sidebarCollapsed()">
        <bg-topbar (toggleSidebar)="toggleSidebar()"></bg-topbar>
        
        <div class="page-container">
          <router-outlet></router-outlet>
        </div>

        <footer class="footer no-print">
          <span>© 2026 BANKGUARD · Banking Intelligence Platform (Group 10)</span>
          <span><i class="online-dot"></i> All systems operational</span>
        </footer>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .app-shell {
      min-height: 100vh;
      display: flex;
      background: #f5f7fb;
      color: #1d2939;
    }

    .main-content {
      margin-left: 248px;
      width: calc(100% - 248px);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: margin-left 0.2s ease, width 0.2s ease;
    }
    .main-content.expanded {
      margin-left: 68px;
      width: calc(100% - 68px);
    }

    .page-container {
      padding: 34px 38px 25px;
      flex: 1;
      max-width: 1600px;
      width: 100%;
      margin: 0 auto;
    }

    .footer {
      border-top: 1px solid #e9edf3;
      padding: 15px 38px;
      display: flex;
      justify-content: space-between;
      color: #a1aab8;
      font-size: 9px;
      background: #fff;
    }
    .online-dot {
      width: 7px;
      height: 7px;
      background: #23b77b;
      border-radius: 50%;
      display: inline-block;
      margin-right: 6px;
    }

    @media (max-width: 1100px) {
      .main-content {
        margin-left: 210px;
        width: calc(100% - 210px);
      }
      .page-container {
        padding: 28px 24px;
      }
    }

    @media (max-width: 760px) {
      .main-content {
        margin-left: 68px;
        width: calc(100% - 68px);
      }
      .page-container {
        padding: 20px 14px;
      }
      .footer {
        padding: 12px 14px;
        flex-direction: column;
        gap: 6px;
      }
    }
  `]
})
export class LayoutComponent {
  sidebarCollapsed = signal<boolean>(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
