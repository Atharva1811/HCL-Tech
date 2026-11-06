/**
 * BANKGUARD — Enterprise Express REST API Server
 * Complete backend service powering banking operations, customer records,
 * transaction ledgers, audit logs and explainable fraud detection.
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// In-Memory Database Store seeded with realistic demonstration data
const db = {
  users: [
    { id: 'USR-001', username: 'admin', email: 'admin@bankguard.demo', fullName: 'Admin Desk', role: 'Super Admin', isActive: true, lastLogin: '2026-11-04T08:00:00Z' },
    { id: 'USR-002', username: 'pratik.b', email: 'pratik.b@bankguard.demo', fullName: 'Pratik Bairagi', role: 'Banking Administrator', isActive: true, lastLogin: '2026-11-04T09:30:00Z' },
    { id: 'USR-003', username: 'tanvesh.y', email: 'tanvesh.y@bankguard.demo', fullName: 'Tanvesh Yeole', role: 'Fraud Investigator', isActive: true, lastLogin: '2026-11-03T14:20:00Z' },
    { id: 'USR-004', username: 'vikas.k', email: 'vikas.k@bankguard.demo', fullName: 'Vikas Kusmude', role: 'Fraud Investigator', isActive: true, lastLogin: '2026-11-04T07:45:00Z' },
    { id: 'USR-005', username: 'pratik.h', email: 'pratik.h@bankguard.demo', fullName: 'Pratik Hirve', role: 'Banking Administrator', isActive: true, lastLogin: '2026-11-03T16:00:00Z' },
    { id: 'USR-006', username: 'atharva.d', email: 'atharva.d@bankguard.demo', fullName: 'Atharva Deshmukh', role: 'Super Admin', isActive: true, lastLogin: '2026-11-04T10:00:00Z' },
    { id: 'USR-007', username: 'auditor', email: 'auditor@bankguard.demo', fullName: 'Audit Observer', role: 'Read-Only Auditor', isActive: true, lastLogin: '2026-11-02T11:00:00Z' }
  ],

  rules: [
    { id: 'RULE-01', name: 'High-Value Transaction', description: 'Flags transactions where the amount exceeds the configured threshold.', enabled: true, scoreWeight: 20, threshold: 100000, timeWindowMinutes: 0 },
    { id: 'RULE-02', name: 'Rapid Transactions', description: 'Detects multiple transactions from the same account within a short time interval.', enabled: true, scoreWeight: 25, threshold: 3, timeWindowMinutes: 60 },
    { id: 'RULE-03', name: 'Unusual Location', description: 'Flags transactions originating from locations that differ from recorded history.', enabled: true, scoreWeight: 30, threshold: 0, timeWindowMinutes: 0 },
    { id: 'RULE-04', name: 'Multiple Failed Attempts', description: 'Detects repeated failed transactions within a configured time window.', enabled: true, scoreWeight: 20, threshold: 2, timeWindowMinutes: 30 },
    { id: 'RULE-05', name: 'Unusual Behaviour', description: 'Identifies transactions significantly higher than customer historical average.', enabled: true, scoreWeight: 25, threshold: 200, timeWindowMinutes: 0 },
    { id: 'RULE-06', name: 'Suspicious Frequency', description: 'Detects an unusually high number of transactions in a 24-hour period.', enabled: true, scoreWeight: 20, threshold: 5, timeWindowMinutes: 1440 }
  ],

  customers: [
    { id: 'CUS-1001', fullName: 'Aarav Sharma', email: 'aarav.sharma@demo.in', phone: '+91 98765 43210', registrationDate: '2023-03-15T00:00:00Z', status: 'Active', riskClassification: 'High', accountIds: ['ACC-2001'], address: 'Pune, Maharashtra', panNumber: 'ABCDS1234A' },
    { id: 'CUS-1002', fullName: 'Priya Patel', email: 'priya.patel@demo.in', phone: '+91 98765 43211', registrationDate: '2022-08-20T00:00:00Z', status: 'Active', riskClassification: 'Low', accountIds: ['ACC-2002'], address: 'Mumbai, Maharashtra', panNumber: 'BCDEP2345B' },
    { id: 'CUS-1003', fullName: 'Rohan Desai', email: 'rohan.desai@demo.in', phone: '+91 98765 43212', registrationDate: '2021-11-10T00:00:00Z', status: 'Under Review', riskClassification: 'Medium', accountIds: ['ACC-2003'], address: 'Mumbai, Maharashtra', panNumber: 'CDEFR3456C' },
    { id: 'CUS-1004', fullName: 'Meera Joshi', email: 'meera.joshi@demo.in', phone: '+91 98765 43213', registrationDate: '2024-01-05T00:00:00Z', status: 'Active', riskClassification: 'Low', accountIds: ['ACC-2004'], address: 'Nashik, Maharashtra', panNumber: 'DEFGM4567D' },
    { id: 'CUS-1005', fullName: 'Kabir Khan', email: 'kabir.khan@demo.in', phone: '+91 98765 43214', registrationDate: '2023-06-18T00:00:00Z', status: 'Restricted', riskClassification: 'Critical', accountIds: ['ACC-2005'], address: 'Delhi, NCR', panNumber: 'EFGHK5678E' },
    { id: 'CUS-1006', fullName: 'Ananya Kulkarni', email: 'ananya.kulkarni@demo.in', phone: '+91 98765 43215', registrationDate: '2022-04-12T00:00:00Z', status: 'Active', riskClassification: 'Low', accountIds: ['ACC-2006'], address: 'Aurangabad, Maharashtra', panNumber: 'FGHIA6789F' },
    { id: 'CUS-1007', fullName: 'Ishaan Mehta', email: 'ishaan.mehta@demo.in', phone: '+91 98765 43216', registrationDate: '2023-09-25T00:00:00Z', status: 'Active', riskClassification: 'Medium', accountIds: ['ACC-2007'], address: 'Delhi, NCR', panNumber: 'GHIJI7890G' },
    { id: 'CUS-1008', fullName: 'Sneha Reddy', email: 'sneha.reddy@demo.in', phone: '+91 98765 43217', registrationDate: '2024-02-14T00:00:00Z', status: 'Active', riskClassification: 'Low', accountIds: ['ACC-2008'], address: 'Hyderabad, Telangana', panNumber: 'HIJKS8901H' },
    { id: 'CUS-1009', fullName: 'Vikram Singh', email: 'vikram.singh@demo.in', phone: '+91 98765 43218', registrationDate: '2022-12-01T00:00:00Z', status: 'Active', riskClassification: 'Medium', accountIds: ['ACC-2009'], address: 'Jaipur, Rajasthan', panNumber: 'IJKLV9012I' },
    { id: 'CUS-1010', fullName: 'Diya Nair', email: 'diya.nair@demo.in', phone: '+91 98765 43219', registrationDate: '2023-07-08T00:00:00Z', status: 'Active', riskClassification: 'Low', accountIds: ['ACC-2010'], address: 'Kochi, Kerala', panNumber: 'JKLMD0123J' }
  ],

  accounts: [
    { id: 'ACC-2001', accountNumber: '•••• 4821', accountHolder: 'Aarav Sharma', customerId: 'CUS-1001', accountType: 'Savings', balance: 542000, status: 'Active', openedDate: '2023-03-15T00:00:00Z', branch: 'Pune - Hinjewadi', ifscCode: 'BGRD0001234' },
    { id: 'ACC-2002', accountNumber: '•••• 1904', accountHolder: 'Priya Patel', customerId: 'CUS-1002', accountType: 'Current', balance: 1285000, status: 'Active', openedDate: '2022-08-20T00:00:00Z', branch: 'Mumbai - Andheri', ifscCode: 'BGRD0001235' },
    { id: 'ACC-2003', accountNumber: '•••• 7732', accountHolder: 'Rohan Desai', customerId: 'CUS-1003', accountType: 'Savings', balance: 178000, status: 'Under Review', openedDate: '2021-11-10T00:00:00Z', branch: 'Mumbai - Dadar', ifscCode: 'BGRD0001236' },
    { id: 'ACC-2004', accountNumber: '•••• 5510', accountHolder: 'Meera Joshi', customerId: 'CUS-1004', accountType: 'Savings', balance: 892000, status: 'Active', openedDate: '2024-01-05T00:00:00Z', branch: 'Nashik - Main', ifscCode: 'BGRD0001237' },
    { id: 'ACC-2005', accountNumber: '•••• 0288', accountHolder: 'Kabir Khan', customerId: 'CUS-1005', accountType: 'Current', balance: 3560000, status: 'Restricted', openedDate: '2023-06-18T00:00:00Z', branch: 'Delhi - Connaught Place', ifscCode: 'BGRD0001238' },
    { id: 'ACC-2006', accountNumber: '•••• 6643', accountHolder: 'Ananya Kulkarni', customerId: 'CUS-1006', accountType: 'Salary', balance: 67000, status: 'Active', openedDate: '2022-04-12T00:00:00Z', branch: 'Aurangabad - CIDCO', ifscCode: 'BGRD0001239' }
  ],

  transactions: [
    { id: 'TXN-90821', customerId: 'CUS-1001', customer: 'Aarav Sharma', senderAccount: '•••• 4821', receiverAccount: '•••• 9988', type: 'Transfer', amount: 185000, date: '2026-11-03T12:42:00Z', status: 'Under Review', paymentMethod: 'RTGS', location: 'Unknown', riskScore: 92, riskLevel: 'Critical', triggeredRules: ['High-Value Transaction', 'Unusual Location'], description: 'Large RTGS transfer to unverified recipient' },
    { id: 'TXN-90817', customerId: 'CUS-1005', customer: 'Kabir Khan', senderAccount: '•••• 0288', receiverAccount: '•••• 7711', type: 'Transfer', amount: 220000, date: '2026-11-03T11:58:00Z', status: 'Blocked', paymentMethod: 'NEFT', location: 'International Gateway', riskScore: 86, riskLevel: 'Critical', triggeredRules: ['High-Value Transaction', 'Unusual Location', 'Suspicious Frequency'], description: 'International transfer flagged for review' },
    { id: 'TXN-90830', customerId: 'CUS-1015', customer: 'Siddharth Jain', senderAccount: '•••• 3367', receiverAccount: '•••• 2244', type: 'Transfer', amount: 495000, date: '2026-11-03T15:20:00Z', status: 'Blocked', paymentMethod: 'RTGS', location: 'Ahmedabad, IN', riskScore: 95, riskLevel: 'Critical', triggeredRules: ['High-Value Transaction', 'Unusual Behaviour', 'Rapid Transactions'], description: 'Exceptionally high transfer from suspended account' },
    { id: 'TXN-90819', customerId: 'CUS-1003', customer: 'Rohan Desai', senderAccount: '•••• 7732', receiverAccount: 'Cash', type: 'Withdrawal', amount: 40000, date: '2026-11-03T12:21:00Z', status: 'Under Review', paymentMethod: 'Cash', location: 'Mumbai, IN', riskScore: 68, riskLevel: 'High', triggeredRules: ['Unusual Behaviour', 'Multiple Failed Attempts'], description: 'Unusual cash withdrawal pattern' },
    { id: 'TXN-90825', customerId: 'CUS-1013', customer: 'Rahul Gupta', senderAccount: '•••• 1893', receiverAccount: '•••• 5566', type: 'Transfer', amount: 150000, date: '2026-11-03T14:05:00Z', status: 'Under Review', paymentMethod: 'IMPS', location: 'Lucknow, IN', riskScore: 72, riskLevel: 'High', triggeredRules: ['High-Value Transaction', 'Rapid Transactions'], description: 'Multiple high-value transfers in short period' },
    { id: 'TXN-90820', customerId: 'CUS-1002', customer: 'Priya Patel', senderAccount: '•••• 1904', receiverAccount: 'POS Terminal', type: 'Card Payment', amount: 2450, date: '2026-11-03T12:36:00Z', status: 'Completed', paymentMethod: 'Card', location: 'Pune, IN', riskScore: 8, riskLevel: 'Low', triggeredRules: [], description: 'Regular card payment at retail store' },
    { id: 'TXN-90818', customerId: 'CUS-1004', customer: 'Meera Joshi', senderAccount: 'Cash', receiverAccount: '•••• 5510', type: 'Deposit', amount: 75000, date: '2026-11-03T12:10:00Z', status: 'Completed', paymentMethod: 'Cash', location: 'Nashik, IN', riskScore: 12, riskLevel: 'Low', triggeredRules: [], description: 'Branch cash deposit' },
    { id: 'TXN-90816', customerId: 'CUS-1006', customer: 'Ananya Kulkarni', senderAccount: '•••• 6643', receiverAccount: 'POS Terminal', type: 'Card Payment', amount: 1299, date: '2026-11-03T11:44:00Z', status: 'Failed', paymentMethod: 'Card', location: 'Aurangabad, IN', riskScore: 18, riskLevel: 'Low', triggeredRules: [], description: 'Card payment declined — insufficient funds' }
  ],

  alerts: [
    { id: 'ALT-3018', transactionId: 'TXN-90821', customerId: 'CUS-1001', customer: 'Aarav Sharma', amount: 185000, riskScore: 92, riskLevel: 'Critical', category: 'Critical', triggeredRules: ['High-Value Transaction', 'Unusual Location'], explanation: 'Transaction exceeds high-value threshold of ₹1,00,000 and originates from an unrecognized location.', detectedAt: '2026-11-03T12:42:00Z', status: 'Open', assignedTo: '', investigationNotes: [], dismissalJustification: '', resolvedAt: null },
    { id: 'ALT-3017', transactionId: 'TXN-90817', customerId: 'CUS-1005', customer: 'Kabir Khan', amount: 220000, riskScore: 86, riskLevel: 'Critical', category: 'Critical', triggeredRules: ['High-Value Transaction', 'Unusual Location', 'Suspicious Frequency'], explanation: 'International transfer from restricted account.', detectedAt: '2026-11-03T11:58:00Z', status: 'Investigating', assignedTo: 'Fraud Investigator', investigationNotes: [{ id: 'N-001', author: 'System', content: 'Auto-generated by engine.', timestamp: '2026-11-03T11:58:00Z', action: 'Created' }], dismissalJustification: '', resolvedAt: null },
    { id: 'ALT-3016', transactionId: 'TXN-90819', customerId: 'CUS-1003', customer: 'Rohan Desai', amount: 40000, riskScore: 68, riskLevel: 'High', category: 'High', triggeredRules: ['Unusual Behaviour', 'Multiple Failed Attempts'], explanation: 'Cash withdrawal significantly above average after 2 failed attempts.', detectedAt: '2026-11-03T12:21:00Z', status: 'Open', assignedTo: '', investigationNotes: [], dismissalJustification: '', resolvedAt: null }
  ],

  auditLogs: [
    { id: 'LOG-5001', userId: 'USR-001', userName: 'Admin Desk', action: 'LOGIN', target: 'Session', targetId: 'SES-101', details: 'Admin logged in from Render environment', timestamp: '2026-11-04T08:00:00Z', ipAddress: '10.0.0.1' },
    { id: 'LOG-5002', userId: 'USR-003', userName: 'Tanvesh Yeole', action: 'ALERT_INVESTIGATE', target: 'FraudAlert', targetId: 'ALT-3017', details: 'Started investigation on alert ALT-3017', timestamp: '2026-11-03T12:15:00Z', ipAddress: '10.0.0.2' }
  ]
};

// ── HEALTH & ROOT ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'BANKGUARD REST API',
    status: 'ONLINE',
    version: '2.1.0',
    deployment: 'Render Cloud Web Service',
    group: 'Group 10 Main Project (Pratik B., Tanvesh Y., Vikas K., Pratik H., Atharva D.)',
    endpoints: {
      health: '/api/health',
      auth: 'POST /api/auth/login',
      dashboardStats: 'GET /api/dashboard/stats',
      transactions: 'GET /api/transactions',
      alerts: 'GET /api/fraud/alerts',
      customers: 'GET /api/customers',
      accounts: 'GET /api/accounts',
      rules: 'GET /api/rules',
      auditLogs: 'GET /api/audit-logs'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'Render',
    environment: process.env.NODE_ENV || 'production',
    project: 'BANKGUARD - Banking Operations & Fraud Monitoring',
    group: 'Group 10',
    timestamp: new Date().toISOString()
  });
});

// ── AUTHENTICATION ─────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find(u => u.username.toLowerCase() === (username || '').toLowerCase() && u.isActive);
  
  if (!user || password !== 'admin123') {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({
    token: `bearer-token-${user.username}-${Date.now()}`,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  });
});

// ── DASHBOARD AGGREGATES ───────────────────────────────────────
app.get('/api/dashboard/stats', (req, res) => {
  const totalVolume = db.transactions.reduce((s, t) => s + t.amount, 0);
  const successCount = db.transactions.filter(t => t.status === 'Completed').length;
  const failedCount = db.transactions.filter(t => t.status === 'Failed').length;
  const flaggedCount = db.transactions.filter(t => t.status === 'Under Review' || t.status === 'Blocked').length;
  const openAlerts = db.alerts.filter(a => a.status === 'Open' || a.status === 'Investigating').length;

  res.json({
    totalTransactions: db.transactions.length,
    totalVolume,
    successCount,
    failedCount,
    flaggedCount,
    openAlerts,
    criticalAlerts: db.alerts.filter(a => a.category === 'Critical' && a.status !== 'Resolved').length
  });
});

// ── TRANSACTIONS ───────────────────────────────────────────────
app.get('/api/transactions', (req, res) => {
  let list = [...db.transactions];
  const { status, type, method, risk, search } = req.query;

  if (status && status !== 'All') list = list.filter(t => t.status === status);
  if (type && type !== 'All') list = list.filter(t => t.type === type);
  if (method && method !== 'All') list = list.filter(t => t.paymentMethod === method);
  if (risk && risk !== 'All') list = list.filter(t => t.riskLevel === risk);
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(t => [t.id, t.customer, t.senderAccount, t.receiverAccount, t.location].some(v => v.toLowerCase().includes(s)));
  }

  res.json({ count: list.length, data: list });
});

app.get('/api/transactions/:id', (req, res) => {
  const txn = db.transactions.find(t => t.id === req.params.id);
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });
  const linkedAlerts = db.alerts.filter(a => a.transactionId === txn.id);
  res.json({ ...txn, linkedAlerts });
});

app.patch('/api/transactions/:id/status', (req, res) => {
  const txn = db.transactions.find(t => t.id === req.params.id);
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });
  const { status, reason, user } = req.body;
  txn.status = status || txn.status;

  db.auditLogs.unshift({
    id: `LOG-${5000 + db.auditLogs.length + 1}`,
    userId: user?.id || 'USR-001',
    userName: user?.fullName || 'Admin',
    action: 'TRANSACTION_STATUS_CHANGE',
    target: 'Transaction',
    targetId: txn.id,
    details: `Updated status to ${status}. Reason: ${reason || 'Administrative action'}`,
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || '10.0.0.1'
  });

  res.json({ success: true, transaction: txn });
});

// ── FRAUD ALERTS ───────────────────────────────────────────────
app.get('/api/fraud/alerts', (req, res) => {
  res.json(db.alerts);
});

app.get('/api/fraud/alerts/:id', (req, res) => {
  const alert = db.alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  res.json(alert);
});

app.patch('/api/fraud/alerts/:id/status', (req, res) => {
  const alert = db.alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.status = req.body.status || alert.status;
  if (alert.status === 'Resolved' || alert.status === 'Dismissed') {
    alert.resolvedAt = new Date().toISOString();
  }
  res.json(alert);
});

app.post('/api/fraud/alerts/:id/notes', (req, res) => {
  const alert = db.alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  const { author, content } = req.body;
  const newNote = {
    id: `N-${Date.now().toString().slice(-5)}`,
    author: author || 'Analyst',
    content: content || '',
    action: 'Analyst Note',
    timestamp: new Date().toISOString()
  };
  alert.investigationNotes.push(newNote);
  res.json(newNote);
});

// ── CUSTOMERS & ACCOUNTS ───────────────────────────────────────
app.get('/api/customers', (req, res) => res.json(db.customers));
app.get('/api/customers/:id', (req, res) => {
  const c = db.customers.find(item => item.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Customer not found' });
  const accounts = db.accounts.filter(a => a.customerId === c.id);
  const txns = db.transactions.filter(t => t.customerId === c.id);
  res.json({ customer: c, accounts, transactions: txns });
});

app.get('/api/accounts', (req, res) => res.json(db.accounts));
app.get('/api/accounts/:id', (req, res) => {
  const a = db.accounts.find(item => item.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'Account not found' });
  const txns = db.transactions.filter(t => t.senderAccount === a.accountNumber || t.receiverAccount === a.accountNumber);
  res.json({ account: a, transactions: txns });
});

// ── RULES & AUDIT ──────────────────────────────────────────────
app.get('/api/rules', (req, res) => res.json(db.rules));
app.put('/api/rules/:id', (req, res) => {
  const rule = db.rules.find(r => r.id === req.params.id);
  if (!rule) return res.status(404).json({ error: 'Rule not found' });
  Object.assign(rule, req.body);
  res.json(rule);
});

app.get('/api/audit-logs', (req, res) => res.json(db.auditLogs));

// ── FRAUD EVALUATION ENGINE ────────────────────────────────────
app.post('/api/fraud/evaluate', (req, res) => {
  const txn = req.body;
  let score = 0;
  const triggered = [];

  if (txn.amount >= 100000) {
    score += 20;
    triggered.push('High-Value Transaction');
  }
  if (['Unknown', 'International Gateway', 'Dubai, AE', 'Singapore, SG'].includes(txn.location)) {
    score += 30;
    triggered.push('Unusual Location');
  }
  if (txn.status === 'Failed') {
    score += 20;
    triggered.push('Multiple Failed Attempts');
  }

  const normalized = Math.min(score, 100);
  const level = normalized >= 80 ? 'Critical' : normalized >= 60 ? 'High' : normalized >= 30 ? 'Medium' : 'Low';

  res.json({
    score: normalized,
    level,
    triggeredRules: triggered,
    flagged: normalized >= 60,
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BANKGUARD Backend] Server listening on http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;
