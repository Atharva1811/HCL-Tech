// ──────────────────────────────────────────────────────────────
// BANKGUARD — Comprehensive domain models
// All customers, accounts, transactions, alerts, metrics and
// detection thresholds are SYNTHETIC demonstration data.
// ──────────────────────────────────────────────────────────────

/* ── Enums / Union types ────────────────────────────────────── */

export type TransactionStatus = 'Completed' | 'Pending' | 'Failed' | 'Under Review' | 'Blocked';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type PaymentMethod = 'UPI' | 'NEFT' | 'RTGS' | 'IMPS' | 'Card' | 'Cash';
export type TransactionType = 'Transfer' | 'Withdrawal' | 'Deposit' | 'Card Payment';
export type AccountStatus = 'Active' | 'Under Review' | 'Restricted' | 'Suspended';
export type AccountType = 'Savings' | 'Current' | 'Fixed Deposit' | 'Salary';
export type AlertStatus = 'Open' | 'Investigating' | 'Resolved' | 'Dismissed';
export type AlertCategory = 'Critical' | 'High' | 'Medium' | 'Low';
export type UserRole = 'Super Admin' | 'Banking Administrator' | 'Fraud Investigator' | 'Read-Only Auditor';
export type CustomerStatus = 'Active' | 'Under Review' | 'Restricted' | 'Suspended';

/* ── Transaction ────────────────────────────────────────────── */

export interface BankTransaction {
  id: string;
  customerId: string;
  customer: string;
  senderAccount: string;
  receiverAccount: string;
  type: TransactionType;
  amount: number;
  date: Date;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  location: string;
  riskScore: number;
  riskLevel: RiskLevel;
  triggeredRules: string[];
  description: string;
}

/* ── Customer ───────────────────────────────────────────────── */

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  registrationDate: Date;
  status: CustomerStatus;
  riskClassification: RiskLevel;
  accountIds: string[];
  address: string;
  panNumber: string;
}

/* ── Bank Account ───────────────────────────────────────────── */

export interface BankAccount {
  id: string;
  accountNumber: string;        // masked for display
  accountHolder: string;
  customerId: string;
  accountType: AccountType;
  balance: number;              // simulated
  status: AccountStatus;
  openedDate: Date;
  branch: string;
  ifscCode: string;
}

/* ── Fraud Alert ────────────────────────────────────────────── */

export interface FraudAlert {
  id: string;
  transactionId: string;
  customerId: string;
  customer: string;
  amount: number;
  riskScore: number;
  riskLevel: RiskLevel;
  category: AlertCategory;
  triggeredRules: string[];
  explanation: string;
  detectedAt: Date;
  status: AlertStatus;
  assignedTo: string;
  investigationNotes: InvestigationNote[];
  dismissalJustification: string;
  resolvedAt: Date | null;
}

export interface InvestigationNote {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  action: string;
}

/* ── Detection Rule ─────────────────────────────────────────── */

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  scoreWeight: number;
  threshold: number;
  timeWindowMinutes: number;
}

/* ── User ───────────────────────────────────────────────────── */

export interface AppUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  passwordHash: string;          // bcrypt hash – never expose to client
}

/* ── Audit Log ──────────────────────────────────────────────── */

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  targetId: string;
  details: string;
  timestamp: Date;
  ipAddress: string;
}

/* ── Notification ───────────────────────────────────────────── */

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  link: string;
}

/* ── KPI / Dashboard types ──────────────────────────────────── */

export interface KpiMetric {
  label: string;
  value: number;
  previousValue: number;
  changePercent: number;
  icon: string;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan';
}

/* ── Report types ───────────────────────────────────────────── */

export interface ReportFilter {
  startDate: Date;
  endDate: Date;
  type: string;
  status: string;
}

export interface ReportSummary {
  totalTransactions: number;
  totalVolume: number;
  successRate: number;
  failureRate: number;
  averageRiskScore: number;
  flaggedCount: number;
}
