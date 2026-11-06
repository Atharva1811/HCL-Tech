import { Component, signal, HostListener } from '@angular/core';
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
      @if (mobileSidebarOpen()) {
        <div class="mobile-backdrop" (click)="closeMobileSidebar()" aria-hidden="true"></div>
      }

      <bg-sidebar 
        [collapsed]="sidebarCollapsed()"
        [mobileOpen]="mobileSidebarOpen()"
        (toggle)="toggleSidebar()"
        (closeMobile)="closeMobileSidebar()">
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
      max-width: 100%;
      overflow-x: hidden;
    }

    .app-shell {
      min-height: 100vh;
      display: flex;
      background: #f5f7fb;
      color: #1d2939;
      position: relative;
      max-width: 100%;
      overflow-x: hidden;
    }

    .mobile-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(2px);
      z-index: 90;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .main-content {
      margin-left: 248px;
      width: calc(100% - 248px);
      min-width: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: margin-left 0.2s ease, width 0.2s ease;
      max-width: 100%;
    }
    .main-content.expanded {
      margin-left: 68px;
      width: calc(100% - 68px);
    }

    .page-container {
      padding: 28px 32px 24px;
      flex: 1;
      max-width: 1600px;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
      min-width: 0;
    }

    .footer {
      border-top: 1px solid #e9edf3;
      padding: 15px 32px;
      display: flex;
      justify-content: space-between;
      color: #a1aab8;
      font-size: 9px;
      background: #fff;
      flex-wrap: wrap;
      gap: 8px;
      flex-shrink: 0;
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
        padding: 24px 20px 20px;
      }
    }

    /* Tablet & Mobile Breakpoint: Sidebar becomes an off-canvas drawer */
    @media (max-width: 860px) {
      .main-content, .main-content.expanded {
        margin-left: 0 !important;
        width: 100% !important;
      }
      .page-container {
        padding: 16px 14px 18px;
      }
      .footer {
        padding: 12px 14px;
        flex-direction: column;
        gap: 6px;
      }
    }

    /* Small Mobile Breakpoint (320px - 425px) */
    @media (max-width: 425px) {
      .page-container {
        padding: 12px 10px 14px;
      }
      .footer {
        padding: 10px 10px;
        font-size: 8.5px;
      }
    }
  `]
})
export class LayoutComponent {
  sidebarCollapsed = signal<boolean>(false);
  mobileSidebarOpen = signal<boolean>(false);

  @HostListener('window:resize')
  onResize(): void {
    if (typeof window !== 'undefined' && window.innerWidth > 860) {
      this.mobileSidebarOpen.set(false);
    }
  }

  toggleSidebar(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 860) {
      this.mobileSidebarOpen.update(v => !v);
    } else {
      this.sidebarCollapsed.update(v => !v);
    }
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }
}
