import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';
import { Permission } from '../permissions';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const allowedRoles = route.data['roles'] as UserRole[] | undefined;
  const requiredPermissions = route.data['permissions'] as Permission[] | undefined;

  // Check roles if defined
  if (allowedRoles && allowedRoles.length > 0) {
    if (!authService.hasRole(...allowedRoles)) {
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  // Check permissions if defined
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAll = requiredPermissions.every(p => authService.hasPermission(p));
    if (!hasAll) {
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  return true;
};
