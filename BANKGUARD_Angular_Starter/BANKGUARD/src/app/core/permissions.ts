/**
 * BANKGUARD — Centralized Role-Based Access Control (RBAC) Permissions Definition
 * Defines granular application permissions, role definitions, and role-to-permission mappings.
 * Reused across Angular frontend services, guards, and UI components.
 */

import { UserRole } from './models';

export type Permission =
  // User Management
  | 'users.view'
  | 'users.create'
  | 'users.update'
  | 'users.assign_roles'
  | 'users.deactivate'

  // Customer Management
  | 'customers.view'
  | 'customers.create'
  | 'customers.update'
  | 'customers.manage_status'

  // Account Management
  | 'accounts.view'
  | 'accounts.manage_status'

  // Transactions Management
  | 'transactions.view'
  | 'transactions.update_status'

  // Fraud Monitoring & Investigation
  | 'fraud.view'
  | 'fraud.investigate'
  | 'fraud.assign'
  | 'fraud.add_notes'
  | 'fraud.resolve'
  | 'fraud.dismiss'

  // Reports & Analytics
  | 'reports.view'
  | 'reports.export'

  // Audit Logs
  | 'audit.view'
  | 'audit.export'

  // System & Detection Rules Configuration
  | 'settings.manage';

export interface PermissionDefinition {
  id: Permission;
  name: string;
  category: 'Users' | 'Customers' | 'Accounts' | 'Transactions' | 'Fraud' | 'Reports' | 'Audit' | 'Settings';
  description: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  { id: 'users.view', name: 'View Users', category: 'Users', description: 'View institutional staff roster and assigned roles' },
  { id: 'users.create', name: 'Create Users', category: 'Users', description: 'Create internal staff accounts' },
  { id: 'users.update', name: 'Update Users', category: 'Users', description: 'Modify staff member details' },
  { id: 'users.assign_roles', name: 'Assign Roles', category: 'Users', description: 'Assign or modify staff security roles' },
  { id: 'users.deactivate', name: 'Deactivate Users', category: 'Users', description: 'Activate or suspend staff accounts' },

  { id: 'customers.view', name: 'View Customers', category: 'Customers', description: 'View customer directory and KYC profile dossiers' },
  { id: 'customers.create', name: 'Create Customers', category: 'Customers', description: 'Register new retail and corporate banking customers' },
  { id: 'customers.update', name: 'Update Customers', category: 'Customers', description: 'Modify customer KYC and contact records' },
  { id: 'customers.manage_status', name: 'Manage Customer Status', category: 'Customers', description: 'Change KYC status (Active, Under Review, Restricted, Suspended)' },

  { id: 'accounts.view', name: 'View Accounts', category: 'Accounts', description: 'View core bank accounts and balances' },
  { id: 'accounts.manage_status', name: 'Manage Account Status', category: 'Accounts', description: 'Freeze, restrict, or suspend bank accounts' },

  { id: 'transactions.view', name: 'View Transactions', category: 'Transactions', description: 'Inspect banking transactions and ledger entries' },
  { id: 'transactions.update_status', name: 'Update Transaction Status', category: 'Transactions', description: 'Approve, block, or mark transactions under review' },

  { id: 'fraud.view', name: 'View Fraud Alerts', category: 'Fraud', description: 'View fraud monitoring workspace and alert lists' },
  { id: 'fraud.investigate', name: 'Investigate Fraud', category: 'Fraud', description: 'Initiate active fraud alert investigation' },
  { id: 'fraud.assign', name: 'Assign Alerts', category: 'Fraud', description: 'Assign alerts to designated investigators' },
  { id: 'fraud.add_notes', name: 'Add Forensic Notes', category: 'Fraud', description: 'Append investigation notes and audit observations' },
  { id: 'fraud.resolve', name: 'Resolve Alerts', category: 'Fraud', description: 'Mark confirmed alerts as resolved' },
  { id: 'fraud.dismiss', name: 'Dismiss Alerts', category: 'Fraud', description: 'Dismiss false positive alerts with mandatory justification' },

  { id: 'reports.view', name: 'View Reports', category: 'Reports', description: 'Access operational, fraud, and ledger analytics reports' },
  { id: 'reports.export', name: 'Export Reports', category: 'Reports', description: 'Download CSV reports and print analytics' },

  { id: 'audit.view', name: 'View Audit Logs', category: 'Audit', description: 'Inspect regulatory system audit trails' },
  { id: 'audit.export', name: 'Export Audit Logs', category: 'Audit', description: 'Download audit trails as CSV' },

  { id: 'settings.manage', name: 'Manage Settings', category: 'Settings', description: 'Configure fraud detection rules, thresholds, and weights' }
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'Super Admin': [
    'users.view',
    'users.create',
    'users.update',
    'users.assign_roles',
    'users.deactivate',
    'customers.view',
    'customers.create',
    'customers.update',
    'customers.manage_status',
    'accounts.view',
    'accounts.manage_status',
    'transactions.view',
    'transactions.update_status',
    'fraud.view',
    'fraud.investigate',
    'fraud.assign',
    'fraud.add_notes',
    'fraud.resolve',
    'fraud.dismiss',
    'reports.view',
    'reports.export',
    'audit.view',
    'audit.export',
    'settings.manage'
  ],

  'Banking Administrator': [
    'customers.view',
    'customers.create',
    'customers.update',
    'customers.manage_status',
    'accounts.view',
    'accounts.manage_status',
    'transactions.view',
    'transactions.update_status',
    'fraud.view',
    'reports.view',
    'reports.export'
  ],

  'Fraud Investigator': [
    'transactions.view',
    'customers.view',
    'accounts.view',
    'fraud.view',
    'fraud.investigate',
    'fraud.assign',
    'fraud.add_notes',
    'fraud.resolve',
    'fraud.dismiss',
    'reports.view',
    'reports.export'
  ],

  'Read-Only Auditor': [
    'transactions.view',
    'customers.view',
    'accounts.view',
    'fraud.view',
    'reports.view',
    'reports.export',
    'audit.view',
    'audit.export'
  ]
};

/**
 * Checks whether a given role holds a specific permission.
 */
export function roleHasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  const list = ROLE_PERMISSIONS[role];
  return Array.isArray(list) && list.includes(permission);
}

/**
 * Returns default dashboard route according to role.
 */
export function getDefaultDashboardRoute(role: UserRole | null | undefined): string {
  switch (role) {
    case 'Super Admin':
      return '/dashboard/admin';
    case 'Banking Administrator':
      return '/dashboard/banking';
    case 'Fraud Investigator':
      return '/dashboard/fraud';
    case 'Read-Only Auditor':
      return '/dashboard/audit';
    default:
      return '/dashboard/admin';
  }
}

