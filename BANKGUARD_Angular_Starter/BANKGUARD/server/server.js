/**
 * BANKGUARD — Express REST API Server
 * Backend service supporting administrative authentication, transactions,
 * rule engine scoring, customer profiles and audit trails.
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory data store for standalone execution / demo
const db = {
  users: [
    { id: 'USR-001', username: 'admin', fullName: 'Admin Desk', role: 'Super Admin', isActive: true },
    { id: 'USR-002', username: 'pratik.b', fullName: 'Pratik Bairagi', role: 'Banking Administrator', isActive: true },
    { id: 'USR-003', username: 'tanvesh.y', fullName: 'Tanvesh Yeole', role: 'Fraud Investigator', isActive: true },
    { id: 'USR-004', username: 'vikas.k', fullName: 'Vikas Kusmude', role: 'Fraud Investigator', isActive: true },
    { id: 'USR-005', username: 'pratik.h', fullName: 'Pratik Hirve', role: 'Banking Administrator', isActive: true },
    { id: 'USR-006', username: 'atharva.d', fullName: 'Atharva Deshmukh', role: 'Super Admin', isActive: true }
  ],
  rules: [
    { id: 'RULE-01', name: 'High-Value Transaction', threshold: 100000, scoreWeight: 20, enabled: true },
    { id: 'RULE-02', name: 'Rapid Transactions', threshold: 3, timeWindowMinutes: 60, scoreWeight: 25, enabled: true },
    { id: 'RULE-03', name: 'Unusual Location', scoreWeight: 30, enabled: true },
    { id: 'RULE-04', name: 'Multiple Failed Attempts', threshold: 2, timeWindowMinutes: 30, scoreWeight: 20, enabled: true },
    { id: 'RULE-05', name: 'Unusual Behaviour', threshold: 200, scoreWeight: 25, enabled: true },
    { id: 'RULE-06', name: 'Suspicious Frequency', threshold: 5, timeWindowMinutes: 1440, scoreWeight: 20, enabled: true }
  ]
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    project: 'BANKGUARD - Banking Operations & Fraud Monitoring',
    group: 'Group 10',
    timestamp: new Date().toISOString()
  });
});

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.users.find(u => u.username.toLowerCase() === (username || '').toLowerCase() && u.isActive);
  
  if (!user || password !== 'admin123') {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({
    token: `demo-jwt-token-for-${user.username}`,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role
    }
  });
});

// Fraud Detection Rules API
app.get('/api/rules', (req, res) => {
  res.json(db.rules);
});

app.put('/api/rules/:id', (req, res) => {
  const rule = db.rules.find(r => r.id === req.params.id);
  if (!rule) return res.status(404).json({ error: 'Rule not found' });
  
  Object.assign(rule, req.body);
  res.json(rule);
});

// Evaluate Transaction for Fraud
app.post('/api/fraud/evaluate', (req, res) => {
  const txn = req.body;
  let score = 0;
  const triggered = [];

  if (txn.amount >= 100000) {
    score += 20;
    triggered.push('High-Value Transaction');
  }
  if (['Unknown', 'International Gateway'].includes(txn.location)) {
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
    flagged: normalized >= 60
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[BANKGUARD Backend] Server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;

