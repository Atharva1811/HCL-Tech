/**
 * BANKGUARD — Backend Role-Based Access Control (RBAC) Permissions Definition
 * CommonJS export for Node.js Express server and automated authorization middleware.
 */

const ROLE_PERMISSIONS = {
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

function hasPermission(role, permission) {
  if (!role) return false;
  const list = ROLE_PERMISSIONS[role];
  return Array.isArray(list) && list.includes(permission);
}

module.exports = {
  ROLE_PERMISSIONS,
  hasPermission
};
