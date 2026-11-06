import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      // Role-Aware Dashboard Routes
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'dashboard/admin',
        canActivate: [roleGuard],
        data: { roles: ['Super Admin'] },
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'dashboard/banking',
        canActivate: [roleGuard],
        data: { roles: ['Super Admin', 'Banking Administrator'] },
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'dashboard/fraud',
        canActivate: [roleGuard],
        data: { roles: ['Super Admin', 'Fraud Investigator'] },
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'dashboard/audit',
        canActivate: [roleGuard],
        data: { roles: ['Super Admin', 'Read-Only Auditor'] },
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // Transactions (Super Admin, Banking Administrator, Fraud Investigator, Read-Only Auditor)
      {
        path: 'transactions',
        canActivate: [roleGuard],
        data: { permissions: ['transactions.view'] },
        loadComponent: () => import('./pages/transactions/transactions.component').then(m => m.TransactionsComponent)
      },
      {
        path: 'transactions/:id',
        canActivate: [roleGuard],
        data: { permissions: ['transactions.view'] },
        loadComponent: () => import('./pages/transaction-detail/transaction-detail.component').then(m => m.TransactionDetailComponent)
      },

      // Fraud Investigation (Super Admin, Fraud Investigator)
      {
        path: 'fraud-monitoring',
        canActivate: [roleGuard],
        data: { roles: ['Super Admin', 'Fraud Investigator'], permissions: ['fraud.investigate'] },
        loadComponent: () => import('./pages/fraud-monitoring/fraud-monitoring.component').then(m => m.FraudMonitoringComponent)
      },
      {
        path: 'fraud-alerts',
        canActivate: [roleGuard],
        data: { permissions: ['fraud.view'] },
        loadComponent: () => import('./pages/fraud-alerts/fraud-alerts.component').then(m => m.FraudAlertsComponent)
      },

      // Customers (Super Admin, Banking Administrator, Auditor, Investigator read-only)
      {
        path: 'customers',
        canActivate: [roleGuard],
        data: { permissions: ['customers.view'] },
        loadComponent: () => import('./pages/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'customers/:id',
        canActivate: [roleGuard],
        data: { permissions: ['customers.view'] },
        loadComponent: () => import('./pages/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent)
      },

      // Bank Accounts (Super Admin, Banking Administrator, Auditor, Investigator read-only)
      {
        path: 'accounts',
        canActivate: [roleGuard],
        data: { permissions: ['accounts.view'] },
        loadComponent: () => import('./pages/accounts/accounts.component').then(m => m.AccountsComponent)
      },
      {
        path: 'accounts/:id',
        canActivate: [roleGuard],
        data: { permissions: ['accounts.view'] },
        loadComponent: () => import('./pages/account-detail/account-detail.component').then(m => m.AccountDetailComponent)
      },

      // Reports (All roles have reports.view)
      {
        path: 'reports',
        canActivate: [roleGuard],
        data: { permissions: ['reports.view'] },
        loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent)
      },

      // User Management (Super Admin ONLY)
      {
        path: 'user-management',
        canActivate: [roleGuard],
        data: { roles: ['Super Admin'], permissions: ['users.view'] },
        loadComponent: () => import('./pages/user-management/user-management.component').then(m => m.UserManagementComponent)
      },

      // Audit Logs (Super Admin, Read-Only Auditor)
      {
        path: 'audit-logs',
        canActivate: [roleGuard],
        data: { roles: ['Super Admin', 'Read-Only Auditor'], permissions: ['audit.view'] },
        loadComponent: () => import('./pages/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent)
      },

      // Settings (Super Admin ONLY)
      {
        path: 'settings',
        canActivate: [roleGuard],
        data: { roles: ['Super Admin'], permissions: ['settings.manage'] },
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
      },

      // Unauthorized Access Screen
      {
        path: 'unauthorized',
        loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
