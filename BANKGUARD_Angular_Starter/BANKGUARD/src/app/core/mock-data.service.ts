import { Injectable } from '@angular/core';
import { BankTransaction, FraudAlert } from './banking.models';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  readonly transactions: BankTransaction[] = [
    { id: 'TXN-90821', customer: 'Aarav Sharma', account: '•••• 4821', type: 'Transfer', amount: 185000, date: new Date('2026-11-03T12:42:00'), status: 'Flagged', location: 'Unknown', riskScore: 92, riskLevel: 'Critical', reason: 'High value + unrecognized location' },
    { id: 'TXN-90820', customer: 'Priya Patel', account: '•••• 1904', type: 'Card Payment', amount: 2450, date: new Date('2026-11-03T12:36:00'), status: 'Completed', location: 'Pune, IN', riskScore: 8, riskLevel: 'Low' },
    { id: 'TXN-90819', customer: 'Rohan Desai', account: '•••• 7732', type: 'Withdrawal', amount: 40000, date: new Date('2026-11-03T12:21:00'), status: 'Pending', location: 'Mumbai, IN', riskScore: 28, riskLevel: 'Medium', reason: 'Unusual withdrawal amount' },
    { id: 'TXN-90818', customer: 'Meera Joshi', account: '•••• 5510', type: 'Deposit', amount: 75000, date: new Date('2026-11-03T12:10:00'), status: 'Completed', location: 'Nashik, IN', riskScore: 12, riskLevel: 'Low' },
    { id: 'TXN-90817', customer: 'Kabir Khan', account: '•••• 0288', type: 'Transfer', amount: 220000, date: new Date('2026-11-03T11:58:00'), status: 'Flagged', location: 'International Gateway', riskScore: 86, riskLevel: 'Critical', reason: 'High-value international transfer' },
    { id: 'TXN-90816', customer: 'Ananya Kulkarni', account: '•••• 6643', type: 'Card Payment', amount: 1299, date: new Date('2026-11-03T11:44:00'), status: 'Failed', location: 'Aurangabad, IN', riskScore: 18, riskLevel: 'Low' },
    { id: 'TXN-90815', customer: 'Ishaan Mehta', account: '•••• 3187', type: 'Transfer', amount: 56000, date: new Date('2026-11-03T11:30:00'), status: 'Completed', location: 'Delhi, IN', riskScore: 32, riskLevel: 'Medium' }
  ];

  readonly alerts: FraudAlert[] = [
    { id: 'ALT-3018', transactionId: 'TXN-90821', customer: 'Aarav Sharma', amount: 185000, riskLevel: 'Critical', reason: 'High-value transfer from an unrecognized location', time: new Date('2026-11-03T12:42:00'), status: 'Open' },
    { id: 'ALT-3017', transactionId: 'TXN-90817', customer: 'Kabir Khan', amount: 220000, riskLevel: 'Critical', reason: 'Unusual international transfer pattern', time: new Date('2026-11-03T11:58:00'), status: 'Investigating' },
    { id: 'ALT-3016', transactionId: 'TXN-90819', customer: 'Rohan Desai', amount: 40000, riskLevel: 'Medium', reason: 'Withdrawal amount differs from normal activity', time: new Date('2026-11-03T12:21:00'), status: 'Open' }
  ];
}