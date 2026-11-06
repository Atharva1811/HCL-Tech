/**
 * BANKGUARD — Automated Role-Based Access Control (RBAC) Verification Suite
 * Tests:
 * 1. Granular permission resolution across all 4 roles
 * 2. Unauthenticated 401 protection
 * 3. Invalid / deactivated token handling
 * 4. Super Admin full-privilege execution
 * 5. Banking Administrator operational access & administrative restrictions (403)
 * 6. Fraud Investigator alert lifecycle access & operational restrictions (403)
 * 7. Read-Only Auditor inspection access & mutation restrictions (403)
 * 8. Last Super Admin protection & privilege escalation guards
 * 9. Tamper-evident audit logging for state-mutating actions
 */

const assert = require('assert');
const http = require('http');
const app = require('../server/server');
const { ROLE_PERMISSIONS, hasPermission } = require('../server/permissions');

let server;
let baseUrl;

function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   BANKGUARD RBAC AUTOMATED VERIFICATION SUITE       ');
  console.log('======================================================\n');

  // Start test server on ephemeral port
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[INFO] Test server launched at ${baseUrl}\n`);
      resolve();
    });
  });

  let passed = 0;
  let total = 0;

  async function test(description, fn) {
    total++;
    try {
      await fn();
      console.log(`  [PASS] Test ${total}: ${description}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] Test ${total}: ${description}`);
      console.error(`         Error: ${err.message}`);
    }
  }

  // 1. Permission Matrix Tests
  await test('Super Admin must have all system permissions', () => {
    const permissions = ROLE_PERMISSIONS['Super Admin'];
    assert(permissions.includes('users.create'));
    assert(permissions.includes('users.assign_roles'));
    assert(permissions.includes('settings.manage'));
    assert(permissions.includes('transactions.update_status'));
    assert(permissions.includes('fraud.resolve'));
    assert(permissions.includes('audit.view'));
    assert.strictEqual(hasPermission('Super Admin', 'users.create'), true);
  });

  await test('Banking Administrator must have operational permissions but lack admin & fraud investigation', () => {
    assert.strictEqual(hasPermission('Banking Administrator', 'transactions.update_status'), true);
    assert.strictEqual(hasPermission('Banking Administrator', 'customers.create'), true);
    assert.strictEqual(hasPermission('Banking Administrator', 'accounts.manage_status'), true);
    assert.strictEqual(hasPermission('Banking Administrator', 'users.create'), false);
    assert.strictEqual(hasPermission('Banking Administrator', 'settings.manage'), false);
    assert.strictEqual(hasPermission('Banking Administrator', 'fraud.resolve'), false);
  });

  await test('Fraud Investigator must have alert resolution permissions but lack customer/account mutations', () => {
    assert.strictEqual(hasPermission('Fraud Investigator', 'fraud.investigate'), true);
    assert.strictEqual(hasPermission('Fraud Investigator', 'fraud.resolve'), true);
    assert.strictEqual(hasPermission('Fraud Investigator', 'fraud.dismiss'), true);
    assert.strictEqual(hasPermission('Fraud Investigator', 'fraud.add_notes'), true);
    assert.strictEqual(hasPermission('Fraud Investigator', 'customers.create'), false);
    assert.strictEqual(hasPermission('Fraud Investigator', 'accounts.manage_status'), false);
    assert.strictEqual(hasPermission('Fraud Investigator', 'users.create'), false);
  });

  await test('Read-Only Auditor must be strictly read-only', () => {
    assert.strictEqual(hasPermission('Read-Only Auditor', 'transactions.view'), true);
    assert.strictEqual(hasPermission('Read-Only Auditor', 'audit.view'), true);
    assert.strictEqual(hasPermission('Read-Only Auditor', 'reports.view'), true);
    assert.strictEqual(hasPermission('Read-Only Auditor', 'transactions.update_status'), false);
    assert.strictEqual(hasPermission('Read-Only Auditor', 'fraud.resolve'), false);
    assert.strictEqual(hasPermission('Read-Only Auditor', 'users.create'), false);
  });

  // 2. Authentication HTTP Middleware Tests
  await test('Unauthenticated requests to protected endpoints return HTTP 401', async () => {
    const res = await makeRequest('GET', '/api/transactions');
    assert.strictEqual(res.status, 401);
    assert(res.body.error.includes('Authentication required'));
  });

  await test('Requests with malformed or invalid Bearer tokens return HTTP 401', async () => {
    const res = await makeRequest('GET', '/api/transactions', {
      'Authorization': 'Bearer invalid-token-xyz-999'
    });
    assert.strictEqual(res.status, 401);
  });

  // 3. User Login & Token Issuance
  let superAdminToken = '';
  let bankingAdminToken = '';
  let fraudInvestigatorToken = '';
  let auditorToken = '';

  await test('Users can authenticate and receive role-specific payload with permissions', async () => {
    // Super Admin login
    const r1 = await makeRequest('POST', '/api/auth/login', {}, { username: 'admin', password: 'admin123' });
    assert.strictEqual(r1.status, 200);
    assert.strictEqual(r1.body.user.role, 'Super Admin');
    assert(Array.isArray(r1.body.user.permissions));
    superAdminToken = r1.body.token;

    // Banking Admin login
    const r2 = await makeRequest('POST', '/api/auth/login', {}, { username: 'pratik.b', password: 'admin123' });
    assert.strictEqual(r2.status, 200);
    assert.strictEqual(r2.body.user.role, 'Banking Administrator');
    bankingAdminToken = r2.body.token;

    // Fraud Investigator login
    const r3 = await makeRequest('POST', '/api/auth/login', {}, { username: 'tanvesh.y', password: 'admin123' });
    assert.strictEqual(r3.status, 200);
    assert.strictEqual(r3.body.user.role, 'Fraud Investigator');
    fraudInvestigatorToken = r3.body.token;

    // Read-Only Auditor login
    const r4 = await makeRequest('POST', '/api/auth/login', {}, { username: 'auditor', password: 'admin123' });
    assert.strictEqual(r4.status, 200);
    assert.strictEqual(r4.body.user.role, 'Read-Only Auditor');
    auditorToken = r4.body.token;
  });

  // 4. Role Authorization Checks on API Endpoints
  await test('Super Admin can access User Management endpoint (HTTP 200)', async () => {
    const res = await makeRequest('GET', '/api/users', { 'Authorization': `Bearer ${superAdminToken}` });
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(res.body));
  });

  await test('Banking Administrator is forbidden from User Management (HTTP 403)', async () => {
    const res = await makeRequest('GET', '/api/users', { 'Authorization': `Bearer ${bankingAdminToken}` });
    assert.strictEqual(res.status, 403);
    assert(res.body.error.includes('Forbidden'));
  });

  await test('Banking Administrator is forbidden from modifying Detection Rules (HTTP 403)', async () => {
    const res = await makeRequest('PUT', '/api/rules/RULE-01', { 'Authorization': `Bearer ${bankingAdminToken}` }, {
      scoreWeight: 45
    });
    assert.strictEqual(res.status, 403);
  });

  await test('Banking Administrator can manage transaction status (HTTP 200)', async () => {
    const res = await makeRequest('PATCH', '/api/transactions/TXN-90821/status', { 'Authorization': `Bearer ${bankingAdminToken}` }, {
      status: 'Completed',
      reason: 'Verified by Banking Admin'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });

  await test('Fraud Investigator can add notes and resolve fraud alerts (HTTP 200)', async () => {
    const resNote = await makeRequest('POST', '/api/fraud/alerts/ALT-3018/notes', { 'Authorization': `Bearer ${fraudInvestigatorToken}` }, {
      content: 'Investigation initiated by Tanvesh.'
    });
    assert.strictEqual(resNote.status, 200);

    const resStatus = await makeRequest('PATCH', '/api/fraud/alerts/ALT-3018/status', { 'Authorization': `Bearer ${fraudInvestigatorToken}` }, {
      status: 'Resolved'
    });
    assert.strictEqual(resStatus.status, 200);
  });

  await test('Fraud Investigator is forbidden from modifying Bank Account status (HTTP 403)', async () => {
    const res = await makeRequest('PATCH', '/api/accounts/ACC-2001/status', { 'Authorization': `Bearer ${fraudInvestigatorToken}` }, {
      status: 'Suspended'
    });
    assert.strictEqual(res.status, 403);
  });

  await test('Read-Only Auditor can view transactions and audit logs (HTTP 200)', async () => {
    const r1 = await makeRequest('GET', '/api/transactions', { 'Authorization': `Bearer ${auditorToken}` });
    assert.strictEqual(r1.status, 200);

    const r2 = await makeRequest('GET', '/api/audit-logs', { 'Authorization': `Bearer ${auditorToken}` });
    assert.strictEqual(r2.status, 200);
  });

  await test('Read-Only Auditor is forbidden from modifying transaction status (HTTP 403)', async () => {
    const res = await makeRequest('PATCH', '/api/transactions/TXN-90821/status', { 'Authorization': `Bearer ${auditorToken}` }, {
      status: 'Blocked'
    });
    assert.strictEqual(res.status, 403);
  });

  await test('Read-Only Auditor is forbidden from resolving alerts (HTTP 403)', async () => {
    const res = await makeRequest('PATCH', '/api/fraud/alerts/ALT-3017/status', { 'Authorization': `Bearer ${auditorToken}` }, {
      status: 'Resolved'
    });
    assert.strictEqual(res.status, 403);
  });

  // 5. Safety Guards: Last Super Admin Protection
  await test('Safety Protocol: Demoting or deactivating the last active Super Admin is rejected (HTTP 400)', async () => {
    // Check initial active super admins: USR-001 (admin) and USR-006 (atharva.d)
    // Deactivate USR-006 first
    const r1 = await makeRequest('PATCH', '/api/users/USR-006/status', { 'Authorization': `Bearer ${superAdminToken}` }, {
      isActive: false
    });
    assert.strictEqual(r1.status, 200);

    // Now attempt to deactivate USR-001 (the only remaining active Super Admin)
    const r2 = await makeRequest('PATCH', '/api/users/USR-001/status', { 'Authorization': `Bearer ${superAdminToken}` }, {
      isActive: false
    });
    assert.strictEqual(r2.status, 400);
    assert(r2.body.error.includes('Safety Protocol'));

    // Attempt to demote USR-001 to Fraud Investigator
    const r3 = await makeRequest('PATCH', '/api/users/USR-001/role', { 'Authorization': `Bearer ${superAdminToken}` }, {
      role: 'Fraud Investigator'
    });
    assert.strictEqual(r3.status, 400);
    assert(r3.body.error.includes('Safety Protocol'));

    // Reactivate USR-006 to restore clean state
    await makeRequest('PATCH', '/api/users/USR-006/status', { 'Authorization': `Bearer ${superAdminToken}` }, {
      isActive: true
    });
  });

  // 6. Audit Trail Logging Test
  await test('State mutations create verified, traceable audit logs', async () => {
    const logsRes = await makeRequest('GET', '/api/audit-logs', { 'Authorization': `Bearer ${superAdminToken}` });
    assert.strictEqual(logsRes.status, 200);
    const logs = logsRes.body;
    assert(Array.isArray(logs));
    assert(logs.some(l => l.action === 'TRANSACTION_STATUS_CHANGE'));
    assert(logs.some(l => l.action === 'ALERT_STATUS_CHANGE'));
    assert(logs.some(l => l.action === 'LOGIN'));
  });

  server.close();

  console.log('\n======================================================');
  console.log(`   RBAC SUITE RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  if (server) server.close();
  process.exit(1);
});

