import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
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
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./pages/transactions/transactions.component').then(m => m.TransactionsComponent)
      },
      {
        path: 'transactions/:id',
        loadComponent: () => import('./pages/transaction-detail/transaction-detail.component').then(m => m.TransactionDetailComponent)
      },
      {
        path: 'fraud-monitoring',
        loadComponent: () => import('./pages/fraud-monitoring/fraud-monitoring.component').then(m => m.FraudMonitoringComponent)
      },
      {
        path: 'fraud-alerts',
        loadComponent: () => import('./pages/fraud-alerts/fraud-alerts.component').then(m => m.FraudAlertsComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./pages/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'customers/:id',
        loadComponent: () => import('./pages/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent)
      },
      {
        path: 'accounts',
        loadComponent: () => import('./pages/accounts/accounts.component').then(m => m.AccountsComponent)
      },
      {
        path: 'accounts/:id',
        loadComponent: () => import('./pages/account-detail/account-detail.component').then(m => m.AccountDetailComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'user-management',
        loadComponent: () => import('./pages/user-management/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./pages/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

