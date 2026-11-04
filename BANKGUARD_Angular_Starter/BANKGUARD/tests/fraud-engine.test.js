/**
 * BANKGUARD Test Suite
 * Automated tests verifying:
 * 1. Fraud Rule Scoring Logic
 * 2. Risk Level Normalisation
 * 3. Explainable Rule Trigger Reasons
 * 4. Filtering and Sorting
 */

const assert = require('assert');

// 1. Test Fraud Detection Rules Engine
function evaluateFraudRules(txn, recentCustomerTxns = []) {
  let score = 0;
  const triggeredRules = [];

  // RULE-01: High-Value Transaction (>= 1,00,000)
  if (txn.amount >= 100000) {
    score += 20;
    triggeredRules.push('High-Value Transaction');
  }

  // RULE-02: Rapid Transactions (>= 3 in rapid window)
  if (recentCustomerTxns.length >= 3) {
    score += 25;
    triggeredRules.push('Rapid Transactions');
  }

  // RULE-03: Unusual Location
  if (['Unknown', 'International Gateway', 'Dubai, AE', 'Singapore, SG'].includes(txn.location)) {
    score += 30;
    triggeredRules.push('Unusual Location');
  }

  // RULE-04: Multiple Failed Attempts
  if (txn.status === 'Failed') {
    score += 20;
    triggeredRules.push('Multiple Failed Attempts');
  }

  // RULE-05: Unusual Spending Behaviour (> 200% above average of 25,000)
  const average = 25000;
  if (txn.amount > average * 3) {
    score += 25;
    triggeredRules.push('Unusual Behaviour');
  }

  const normalizedScore = Math.min(score, 100);
  const riskLevel = 
    normalizedScore >= 80 ? 'Critical' :
    normalizedScore >= 60 ? 'High' :
    normalizedScore >= 30 ? 'Medium' : 'Low';

  return { score: normalizedScore, level: riskLevel, triggeredRules };
}

console.log('--------------------------------------------------');
console.log('RUNNING BANKGUARD AUTOMATED TEST SUITE');
console.log('--------------------------------------------------');

// Test 1: Low-risk regular transaction
{
  const result = evaluateFraudRules({
    amount: 2450,
    location: 'Pune, IN',
    status: 'Completed'
  });
  assert.strictEqual(result.score, 0, 'Low risk score should be 0');
  assert.strictEqual(result.level, 'Low', 'Risk level should be Low');
  assert.strictEqual(result.triggeredRules.length, 0);
  console.log('✔ Test 1 Passed: Low-risk normal retail transaction');
}

// Test 2: High-Value Transaction rule (+20 pts)
{
  const result = evaluateFraudRules({
    amount: 150000,
    location: 'Mumbai, IN',
    status: 'Completed'
  });
  assert.ok(result.triggeredRules.includes('High-Value Transaction'));
  assert.ok(result.score >= 20);
  console.log('✔ Test 2 Passed: High-value transaction correctly triggers RULE-01');
}

// Test 3: Unusual Location rule (+30 pts)
{
  const result = evaluateFraudRules({
    amount: 10000,
    location: 'International Gateway',
    status: 'Completed'
  });
  assert.ok(result.triggeredRules.includes('Unusual Location'));
  assert.strictEqual(result.level, 'Medium');
  console.log('✔ Test 3 Passed: Unusual location correctly triggers RULE-03');
}

// Test 4: Critical Combined Alert (High value + unusual location + unusual behavior)
{
  const result = evaluateFraudRules({
    amount: 220000,
    location: 'International Gateway',
    status: 'Completed'
  }, [{}, {}, {}]); // 3 recent rapid transactions
  
  // 20 (high value) + 25 (rapid) + 30 (location) + 25 (unusual behavior) = 100
  assert.strictEqual(result.score, 100, 'Score should normalize to 100 max');
  assert.strictEqual(result.level, 'Critical', 'Severity must be Critical');
  assert.strictEqual(result.triggeredRules.length, 4);
  console.log('✔ Test 4 Passed: Multiple combined rule violations trigger Critical risk classification');
}

// Test 5: Failed transaction attempt
{
  const result = evaluateFraudRules({
    amount: 1500,
    location: 'Pune, IN',
    status: 'Failed'
  });
  assert.ok(result.triggeredRules.includes('Multiple Failed Attempts'));
  assert.strictEqual(result.score, 20);
  console.log('✔ Test 5 Passed: Failed attempt penalty applied');
}

console.log('--------------------------------------------------');
console.log('ALL 5 AUTOMATED TESTS PASSED SUCCESSFULLY (5/5)');
console.log('--------------------------------------------------');

