import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AppUser, UserRole } from '../models';
import { MockDataService } from './mock-data.service';

/**
 * Authentication service for BANKGUARD.
 * Uses local storage to persist session state in the demo.
 * In production, this would communicate with the Express backend.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private currentUser = signal<AppUser | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly userRole = computed(() => this.currentUser()?.role ?? null);

  constructor(
    private data: MockDataService,
    private router: Router
  ) {
    this.restoreSession();
  }

  /**
   * Demo login. Matches username against mock users.
   * Password check is simulated — in production use bcrypt comparison via API.
   */
  login(username: string, _password: string): { success: boolean; message: string } {
    const user = this.data.users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.isActive
    );

    if (!user) {
      return { success: false, message: 'Invalid username or account is disabled.' };
    }

    // In the demo, accept 'admin123' for all users
    if (_password !== 'admin123') {
      return { success: false, message: 'Invalid password.' };
    }

    this.currentUser.set(user);
    localStorage.setItem('bg_session', JSON.stringify({
      userId: user.id,
      loginTime: new Date().toISOString()
    }));

    return { success: true, message: 'Login successful.' };
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('bg_session');
    this.router.navigate(['/login']);
  }

  hasRole(...roles: UserRole[]): boolean {
    const role = this.userRole();
    return role !== null && roles.includes(role);
  }

  hasPermission(action: string): boolean {
    const role = this.userRole();
    if (!role) return false;

    const permissions: Record<UserRole, string[]> = {
      'Super Admin': ['*'],
      'Banking Administrator': ['view', 'edit', 'create', 'export', 'investigate', 'manage_customers', 'manage_accounts'],
      'Fraud Investigator': ['view', 'investigate', 'export', 'add_notes'],
      'Read-Only Auditor': ['view', 'export'],
    };

    const userPermissions = permissions[role];
    return userPermissions.includes('*') || userPermissions.includes(action);
  }

  private restoreSession(): void {
    try {
      const session = localStorage.getItem('bg_session');
      if (session) {
        const parsed = JSON.parse(session);
        const user = this.data.users.find(u => u.id === parsed.userId);
        if (user && user.isActive) {
          this.currentUser.set(user);
        }
      }
    } catch {
      localStorage.removeItem('bg_session');
    }
  }
}
