import { Injectable } from '@angular/core';
import {
  BankTransaction, RiskLevel, DetectionRule
} from '../models';
import { MockDataService } from './mock-data.service';

/**
 * Explainable rule-based fraud detection engine.
 *
 * IMPORTANT: The thresholds and scores are illustrative.
 * They must be calibrated against a bank's validated policy
 * before any real-world use.
 *
 * ## Scoring scheme
 * | Rule                        | Weight |
 * |-----------------------------|--------|
 * | High-Value Transaction      | +20    |
 * | Rapid Transactions          | +25    |
 * | Unusual Location            | +30    |
 * | Multiple Failed Attempts    | +20    |
 * | Unusual Behaviour           | +25    |
 * | Suspicious Frequency        | +20    |
 *
 * ## Risk levels (after normalisation to 0-100)
 * | Range | Level    |
 * |-------|----------|
 * | 0–29  | Low      |
 * | 30–59 | Medium   |
 * | 60–79 | High     |
 * | 80–100| Critical |
 */
@Injectable({ providedIn: 'root' })
export class FraudEngineService {

  constructor(private data: MockDataService) {}

  /** Known customer locations from transaction history. */
  private customerLocations: Record<string, string[]> = {
    'CUS-1001': ['Pune, IN'],
    'CUS-1002': ['Mumbai, IN', 'Pune, IN'],
    'CUS-1003': ['Mumbai, IN'],
    'CUS-1004': ['Nashik, IN'],
    'CUS-1005': ['Delhi, IN'],
    'CUS-1006': ['Aurangabad, IN'],
    'CUS-1007': ['Delhi, IN'],
    'CUS-1008': ['Hyderabad, IN'],
    'CUS-1009': ['Jaipur, IN'],
    'CUS-1010': ['Kochi, IN'],
    'CUS-1011': ['Bangalore, IN'],
    'CUS-1012': ['Chennai, IN'],
    'CUS-1013': ['Lucknow, IN'],
    'CUS-1014': ['Indore, IN'],
    'CUS-1015': ['Ahmedabad, IN'],
  };

  /** Average transaction amounts per customer (simulated). */
  private customerAverages: Record<string, number> = {
    'CUS-1001': 25000,
    'CUS-1002': 15000,
    'CUS-1003': 12000,
    'CUS-1004': 20000,
    'CUS-1005': 60000,
    'CUS-1006': 8000,
    'CUS-1007': 18000,
    'CUS-1008': 35000,
    'CUS-1009': 22000,
    'CUS-1010': 10000,
    'CUS-1011': 20000,
    'CUS-1012': 15000,
    'CUS-1013': 55000,
    'CUS-1014': 12000,
    'CUS-1015': 80000,
  };

  /**
   * Score a transaction against all enabled detection rules.
   * Returns the normalised score (0–100), risk level, triggered
   * rules and a human-readable explanation for each.
   */
  score(
    transaction: BankTransaction,
    allTransactions: BankTransaction[]
  ): { score: number; level: RiskLevel; rules: string[]; explanations: string[] } {

    const rules = this.data.detectionRules;
    let rawScore = 0;
    const triggeredRules: string[] = [];
    const explanations: string[] = [];

    const recentCustomerTxns = allTransactions.filter(
      t => t.customerId === transaction.customerId &&
           t.id !== transaction.id &&
           Math.abs(transaction.date.getTime() - t.date.getTime()) < 24 * 60 * 60 * 1000
    );

    for (const rule of rules) {
      if (!rule.enabled) continue;

      switch (rule.id) {
        case 'RULE-01': // High-Value Transaction
          if (transaction.amount >= rule.threshold) {
            rawScore += rule.scoreWeight;
            triggeredRules.push(rule.name);
            explanations.push(
              `Transaction amount (₹${transaction.amount.toLocaleString('en-IN')}) exceeds the high-value threshold of ₹${rule.threshold.toLocaleString('en-IN')}.`
            );
          }
          break;

        case 'RULE-02': // Rapid Transactions
          {
            const rapidWindow = rule.timeWindowMinutes * 60 * 1000;
            const rapidTxns = allTransactions.filter(
              t => t.customerId === transaction.customerId &&
                   t.id !== transaction.id &&
                   Math.abs(transaction.date.getTime() - t.date.getTime()) < rapidWindow
            );
            if (rapidTxns.length >= rule.threshold) {
              rawScore += rule.scoreWeight;
              triggeredRules.push(rule.name);
              explanations.push(
                `${rapidTxns.length} transactions detected from the same account within ${rule.timeWindowMinutes} minutes (threshold: ${rule.threshold}).`
              );
            }
          }
          break;

        case 'RULE-03': // Unusual Location
          {
            const knownLocations = this.customerLocations[transaction.customerId] || [];
            const isUnusual = !knownLocations.some(loc =>
              transaction.location.toLowerCase().includes(loc.split(',')[0].toLowerCase())
            );
            if (isUnusual && transaction.location !== '' && knownLocations.length > 0) {
              rawScore += rule.scoreWeight;
              triggeredRules.push(rule.name);
              explanations.push(
                `Transaction location "${transaction.location}" does not match the customer's known locations: ${knownLocations.join(', ')}.`
              );
            }
          }
          break;

        case 'RULE-04': // Multiple Failed Attempts
          {
            const failWindow = rule.timeWindowMinutes * 60 * 1000;
            const failedTxns = allTransactions.filter(
              t => t.customerId === transaction.customerId &&
                   t.status === 'Failed' &&
                   Math.abs(transaction.date.getTime() - t.date.getTime()) < failWindow
            );
            if (failedTxns.length >= rule.threshold) {
              rawScore += rule.scoreWeight;
              triggeredRules.push(rule.name);
              explanations.push(
                `${failedTxns.length} failed transactions detected within ${rule.timeWindowMinutes} minutes (threshold: ${rule.threshold}).`
              );
            }
          }
          break;

        case 'RULE-05': // Unusual Behaviour
          {
            const avgAmount = this.customerAverages[transaction.customerId] || 20000;
            const deviationPercent = ((transaction.amount - avgAmount) / avgAmount) * 100;
            if (deviationPercent >= rule.threshold) {
              rawScore += rule.scoreWeight;
              triggeredRules.push(rule.name);
              explanations.push(
                `Transaction amount is ${deviationPercent.toFixed(0)}% above the customer's average of ₹${avgAmount.toLocaleString('en-IN')} (threshold: ${rule.threshold}% deviation).`
              );
            }
          }
          break;

        case 'RULE-06': // Suspicious Frequency
          {
            if (recentCustomerTxns.length >= rule.threshold) {
              rawScore += rule.scoreWeight;
              triggeredRules.push(rule.name);
              explanations.push(
                `Customer has ${recentCustomerTxns.length + 1} transactions in the past 24 hours (threshold: ${rule.threshold}).`
              );
            }
          }
          break;
      }
    }

    // Normalise to 0-100
    const maxPossible = rules.filter(r => r.enabled).reduce((sum, r) => sum + r.scoreWeight, 0);
    const score = maxPossible > 0 ? Math.min(Math.round((rawScore / maxPossible) * 100), 100) : 0;

    const level: RiskLevel =
      score >= 80 ? 'Critical' :
      score >= 60 ? 'High' :
      score >= 30 ? 'Medium' : 'Low';

    return { score, level, rules: triggeredRules, explanations };
  }

  /** Get the risk level label for a numeric score. */
  getRiskLevel(score: number): RiskLevel {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 30) return 'Medium';
    return 'Low';
  }

  /** Get a colour class name for a risk level. */
  getRiskColor(level: RiskLevel): string {
    switch (level) {
      case 'Critical': return 'red';
      case 'High': return 'amber';
      case 'Medium': return 'purple';
      case 'Low': return 'green';
    }
  }
}
