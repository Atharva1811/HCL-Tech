import { Injectable } from '@angular/core';
import { BankTransaction, RiskLevel } from './banking.models';

@Injectable({ providedIn: 'root' })
export class FraudEngineService {
  /**
   * Explainable demo rules. These thresholds are illustrative and must be
   * calibrated against a bank's validated policy before real-world use.
   */
  score(transaction: BankTransaction, recentCustomerTransactions: BankTransaction[]): {
    score: number; level: RiskLevel; reasons: string[];
  } {
    let score = 0;
    const reasons: string[] = [];
    if (transaction.amount >= 100000) {
      score += 35; reasons.push('High-value transaction (₹1,00,000 or more)');
    }
    if (recentCustomerTransactions.length >= 3) {
      score += 30; reasons.push('High transaction frequency in recent activity');
    }
    if (['Unknown', 'International Gateway'].includes(transaction.location)) {
      score += 25; reasons.push('Unrecognized transaction location');
    }
    if (transaction.status === 'Failed') {
      score += 10; reasons.push('Failed payment attempt');
    }
    score = Math.min(score, 100);
    const level: RiskLevel = score >= 75 ? 'Critical' : score >= 50 ? 'High' : score >= 25 ? 'Medium' : 'Low';
    return { score, level, reasons };
  }
}