import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AppUser, UserRole } from '../models';
import { Permission, ROLE_PERMISSIONS, roleHasPermission, getDefaultDashboardRoute } from '../permissions';
import { MockDataService } from './mock-data.service';

/**
 * Authentication & Authorization Service for BANKGUARD.
 * Manages user credentials, trusted session tokens, role states, and granular RBAC checks.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private currentUser = signal<AppUser | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly userRole = computed<UserRole | null>(() => this.currentUser()?.role ?? null);
  readonly userPermissions = computed<Permission[]>(() => {
    const role = this.userRole();
    return role ? (ROLE_PERMISSIONS[role] || []) : [];
  });
  readonly defaultDashboardRoute = computed(() => getDefaultDashboardRoute(this.userRole()));

  constructor(
    private data: MockDataService,
    private router: Router
  ) {
    this.restoreSession();
  }

  /**
   * Role-based login. Validates credentials and initializes role & permissions.
   */
  login(username: string, _password: string): { success: boolean; message: string; role?: UserRole; redirectUrl?: string } {
    const user = this.data.users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.isActive
    );

    if (!user) {
      return { success: false, message: 'Invalid username or user account is disabled.' };
    }

    if (_password !== 'admin123') {
      return { success: false, message: 'Invalid password. Try admin123 for demo.' };
    }

    this.currentUser.set(user);
    const token = `bearer-token-${user.username}-${Date.now()}`;

    try {
      localStorage.setItem('bg_session', JSON.stringify({
        userId: user.id,
        username: user.username,
        role: user.role,
        loginTime: new Date().toISOString()
      }));
      localStorage.setItem('bg_token', token);
    } catch {
      // LocalStorage fallback
    }

    const redirectUrl = getDefaultDashboardRoute(user.role);
    return {
      success: true,
      message: 'Login successful.',
      role: user.role,
      redirectUrl
    };
  }

  logout(): void {
    this.currentUser.set(null);
    try {
      localStorage.removeItem('bg_session');
      localStorage.removeItem('bg_token');
    } catch {
      // Ignore
    }
    this.router.navigate(['/login']);
  }

  /**
   * Checks whether the current authenticated user belongs to any of the specified roles.
   */
  hasRole(...roles: UserRole[]): boolean {
    const role = this.userRole();
    return role !== null && roles.includes(role);
  }

  /**
   * Checks whether the current authenticated user holds a specific granular permission.
   */
  hasPermission(permission: Permission): boolean {
    return roleHasPermission(this.userRole(), permission);
  }

  /**
   * Retrieves the bearer authorization token if present.
   */
  getAuthToken(): string | null {
    try {
      return localStorage.getItem('bg_token') || (this.currentUser() ? `bearer-token-${this.currentUser()?.username}` : null);
    } catch {
      return null;
    }
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
      localStorage.removeItem('bg_token');
    }
  }
}
