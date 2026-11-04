export type TransactionStatus = 'Completed' | 'Pending' | 'Failed' | 'Flagged';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface BankTransaction {
  id: string;
  customer: string;
  account: string;
  type: 'Transfer' | 'Withdrawal' | 'Deposit' | 'Card Payment';
  amount: number;
  date: Date;
  status: TransactionStatus;
  location: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reason?: string;
}

export interface FraudAlert {
  id: string;
  transactionId: string;
  customer: string;
  amount: number;
  riskLevel: RiskLevel;
  reason: string;
  time: Date;
  status: 'Investigating' | 'Open' | 'Resolved';
}