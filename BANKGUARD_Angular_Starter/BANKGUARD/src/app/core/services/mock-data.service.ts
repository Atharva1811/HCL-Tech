import { Injectable } from '@angular/core';
import {
  BankTransaction, Customer, BankAccount, FraudAlert,
  AppUser, AuditLog, DetectionRule, AppNotification
} from '../models';

/**
 * Provides synthetic demonstration data for BANKGUARD.
 * All customers, accounts, transactions and alerts are fictional.
 * This data must not be used for real financial decisions.
 */
@Injectable({ providedIn: 'root' })
export class MockDataService {

  /* ── Customers ──────────────────────────────────────────────── */

  readonly customers: Customer[] = [
    { id: 'CUS-1001', fullName: 'Aarav Sharma', email: 'aarav.sharma@demo.in', phone: '+91 98765 43210', registrationDate: new Date('2023-03-15'), status: 'Active', riskClassification: 'High', accountIds: ['ACC-2001'], address: 'Pune, Maharashtra', panNumber: 'ABCDS1234A' },
    { id: 'CUS-1002', fullName: 'Priya Patel', email: 'priya.patel@demo.in', phone: '+91 98765 43211', registrationDate: new Date('2022-08-20'), status: 'Active', riskClassification: 'Low', accountIds: ['ACC-2002'], address: 'Mumbai, Maharashtra', panNumber: 'BCDEP2345B' },
    { id: 'CUS-1003', fullName: 'Rohan Desai', email: 'rohan.desai@demo.in', phone: '+91 98765 43212', registrationDate: new Date('2021-11-10'), status: 'Under Review', riskClassification: 'Medium', accountIds: ['ACC-2003'], address: 'Mumbai, Maharashtra', panNumber: 'CDEFR3456C' },
    { id: 'CUS-1004', fullName: 'Meera Joshi', email: 'meera.joshi@demo.in', phone: '+91 98765 43213', registrationDate: new Date('2024-01-05'), status: 'Active', riskClassification: 'Low', accountIds: ['ACC-2004'], address: 'Nashik, Maharashtra', panNumber: 'DEFGM4567D' },
    { id: 'CUS-1005', fullName: 'Kabir Khan', email: 'kabir.khan@demo.in', phone: '+91 98765 43214', registrationDate: new Date('2023-06-18'), status: 'Restricted', riskClassification: 'Critical', accountIds: ['ACC-2005'], address: 'Delhi, NCR', panNumber: 'EFGHK5678E' },
    { id: 'CUS-1006', fullName: 'Ananya Kulkarni', email: 'ananya.kulkarni@demo.in', phone: '+91 98765 43215', registrationDate: new Date('2022-04-12'), status: 'Active', riskClassification: 'Low', accountIds: ['ACC-2006'], address: 'Aurangabad, Maharashtra', panNumber: 'FGHIA6789F' },
    { id: 'CUS-1007', fullName: 'Ishaan Mehta', email: 'ishaan.mehta@demo.in', phone: '+91 98765 43216', registrationDate: new Date('2023-09-25'), status: 'Active', riskClassification: 'Medium', accountIds: ['ACC-2007'], address: 'Delhi, NCR', panNumber: 'GHIJI7890G' },
    { id: 'CUS-1008', fullName: 'Sneha Reddy', email: 'sneha.reddy@demo.in', phone: '+91 98765 43217', registrationDate: new Date('2024-02-14'), status: 'Active', riskClassification: 'Low', accountIds: ['ACC-2008'], address: 'Hyderabad, Telangana', panNumber: 'HIJKS8901H' },
    { id: 'CUS-1009', fullName: 'Vikram Singh', email: 'vikram.singh@demo.in', phone: '+91 98765 43218', registrationDate: new Date('2022-12-01'), status: 'Active', riskClassification: 'Medium', accountIds: ['ACC-2009'], address: 'Jaipur, Rajasthan', panNumber: 'IJKLV9012I' },
    { id: 'CUS-1010', fullName: 'Diya Nair', email: 'diya.nair@demo.in', phone: '+91 98765 43219', registrationDate: new Date('2023-07-08'), status: 'Active', riskClassification: 'Low', accountIds: ['ACC-2010'], address: 'Kochi, Kerala', panNumber: 'JKLMD0123J' },
    { id: 'CUS-1011', fullName: 'Arjun Rao', email: 'arjun.rao@demo.in', phone: '+91 98765 43220', registrationDate: new Date('2024-04-22'), status: 'Active', riskClassification: 'Low', accountIds: ['ACC-2011'], address: 'Bangalore, Karnataka', panNumber: 'KLMNA1234K' },
    { id: 'CUS-1012', fullName: 'Kavya Iyer', email: 'kavya.iyer@demo.in', phone: '+91 98765 43221', registrationDate: new Date('2023-02-17'), status: 'Active', riskClassification: 'Medium', accountIds: ['ACC-2012'], address: 'Chennai, Tamil Nadu', panNumber: 'LMNOK2345L' },
    { id: 'CUS-1013', fullName: 'Rahul Gupta', email: 'rahul.gupta@demo.in', phone: '+91 98765 43222', registrationDate: new Date('2022-10-30'), status: 'Active', riskClassification: 'High', accountIds: ['ACC-2013'], address: 'Lucknow, UP', panNumber: 'MNOPQ3456M' },
    { id: 'CUS-1014', fullName: 'Nisha Verma', email: 'nisha.verma@demo.in', phone: '+91 98765 43223', registrationDate: new Date('2024-06-01'), status: 'Active', riskClassification: 'Low', accountIds: ['ACC-2014'], address: 'Indore, MP', panNumber: 'NOPQR4567N' },
    { id: 'CUS-1015', fullName: 'Siddharth Jain', email: 'siddharth.jain@demo.in', phone: '+91 98765 43224', registrationDate: new Date('2023-05-11'), status: 'Suspended', riskClassification: 'Critical', accountIds: ['ACC-2015'], address: 'Ahmedabad, Gujarat', panNumber: 'OPQRS5678O' },
  ];

  /* ── Bank Accounts ──────────────────────────────────────────── */

  readonly accounts: BankAccount[] = [
    { id: 'ACC-2001', accountNumber: '•••• 4821', accountHolder: 'Aarav Sharma', customerId: 'CUS-1001', accountType: 'Savings', balance: 542000, status: 'Active', openedDate: new Date('2023-03-15'), branch: 'Pune - Hinjewadi', ifscCode: 'BGRD0001234' },
    { id: 'ACC-2002', accountNumber: '•••• 1904', accountHolder: 'Priya Patel', customerId: 'CUS-1002', accountType: 'Current', balance: 1285000, status: 'Active', openedDate: new Date('2022-08-20'), branch: 'Mumbai - Andheri', ifscCode: 'BGRD0001235' },
    { id: 'ACC-2003', accountNumber: '•••• 7732', accountHolder: 'Rohan Desai', customerId: 'CUS-1003', accountType: 'Savings', balance: 178000, status: 'Under Review', openedDate: new Date('2021-11-10'), branch: 'Mumbai - Dadar', ifscCode: 'BGRD0001236' },
    { id: 'ACC-2004', accountNumber: '•••• 5510', accountHolder: 'Meera Joshi', customerId: 'CUS-1004', accountType: 'Savings', balance: 892000, status: 'Active', openedDate: new Date('2024-01-05'), branch: 'Nashik - Main', ifscCode: 'BGRD0001237' },
    { id: 'ACC-2005', accountNumber: '•••• 0288', accountHolder: 'Kabir Khan', customerId: 'CUS-1005', accountType: 'Current', balance: 3560000, status: 'Restricted', openedDate: new Date('2023-06-18'), branch: 'Delhi - Connaught Place', ifscCode: 'BGRD0001238' },
    { id: 'ACC-2006', accountNumber: '•••• 6643', accountHolder: 'Ananya Kulkarni', customerId: 'CUS-1006', accountType: 'Salary', balance: 67000, status: 'Active', openedDate: new Date('2022-04-12'), branch: 'Aurangabad - CIDCO', ifscCode: 'BGRD0001239' },
    { id: 'ACC-2007', accountNumber: '•••• 3187', accountHolder: 'Ishaan Mehta', customerId: 'CUS-1007', accountType: 'Savings', balance: 415000, status: 'Active', openedDate: new Date('2023-09-25'), branch: 'Delhi - Rajouri Garden', ifscCode: 'BGRD0001240' },
    { id: 'ACC-2008', accountNumber: '•••• 9451', accountHolder: 'Sneha Reddy', customerId: 'CUS-1008', accountType: 'Current', balance: 2180000, status: 'Active', openedDate: new Date('2024-02-14'), branch: 'Hyderabad - Banjara Hills', ifscCode: 'BGRD0001241' },
    { id: 'ACC-2009', accountNumber: '•••• 2756', accountHolder: 'Vikram Singh', customerId: 'CUS-1009', accountType: 'Savings', balance: 330000, status: 'Active', openedDate: new Date('2022-12-01'), branch: 'Jaipur - MI Road', ifscCode: 'BGRD0001242' },
    { id: 'ACC-2010', accountNumber: '•••• 8134', accountHolder: 'Diya Nair', customerId: 'CUS-1010', accountType: 'Savings', balance: 156000, status: 'Active', openedDate: new Date('2023-07-08'), branch: 'Kochi - MG Road', ifscCode: 'BGRD0001243' },
    { id: 'ACC-2011', accountNumber: '•••• 4590', accountHolder: 'Arjun Rao', customerId: 'CUS-1011', accountType: 'Current', balance: 780000, status: 'Active', openedDate: new Date('2024-04-22'), branch: 'Bangalore - Koramangala', ifscCode: 'BGRD0001244' },
    { id: 'ACC-2012', accountNumber: '•••• 6278', accountHolder: 'Kavya Iyer', customerId: 'CUS-1012', accountType: 'Savings', balance: 245000, status: 'Active', openedDate: new Date('2023-02-17'), branch: 'Chennai - T Nagar', ifscCode: 'BGRD0001245' },
    { id: 'ACC-2013', accountNumber: '•••• 1893', accountHolder: 'Rahul Gupta', customerId: 'CUS-1013', accountType: 'Current', balance: 1950000, status: 'Active', openedDate: new Date('2022-10-30'), branch: 'Lucknow - Gomti Nagar', ifscCode: 'BGRD0001246' },
    { id: 'ACC-2014', accountNumber: '•••• 5042', accountHolder: 'Nisha Verma', customerId: 'CUS-1014', accountType: 'Salary', balance: 89000, status: 'Active', openedDate: new Date('2024-06-01'), branch: 'Indore - Vijay Nagar', ifscCode: 'BGRD0001247' },
    { id: 'ACC-2015', accountNumber: '•••• 3367', accountHolder: 'Siddharth Jain', customerId: 'CUS-1015', accountType: 'Current', balance: 4720000, status: 'Suspended', openedDate: new Date('2023-05-11'), branch: 'Ahmedabad - SG Highway', ifscCode: 'BGRD0001248' },
  ];

  /* ── Transactions ───────────────────────────────────────────── */

  readonly transactions: BankTransaction[] = [
    // --- Critical / Flagged ---
    { id: 'TXN-90821', customerId: 'CUS-1001', customer: 'Aarav Sharma', senderAccount: '•••• 4821', receiverAccount: '•••• 9988', type: 'Transfer', amount: 185000, date: new Date('2026-11-03T12:42:00'), status: 'Under Review', paymentMethod: 'RTGS', location: 'Unknown', riskScore: 92, riskLevel: 'Critical', triggeredRules: ['High-Value Transaction', 'Unusual Location'], description: 'Large RTGS transfer to unverified recipient' },
    { id: 'TXN-90817', customerId: 'CUS-1005', customer: 'Kabir Khan', senderAccount: '•••• 0288', receiverAccount: '•••• 7711', type: 'Transfer', amount: 220000, date: new Date('2026-11-03T11:58:00'), status: 'Blocked', paymentMethod: 'NEFT', location: 'International Gateway', riskScore: 86, riskLevel: 'Critical', triggeredRules: ['High-Value Transaction', 'Unusual Location', 'Suspicious Frequency'], description: 'International transfer flagged for review' },
    { id: 'TXN-90830', customerId: 'CUS-1015', customer: 'Siddharth Jain', senderAccount: '•••• 3367', receiverAccount: '•••• 2244', type: 'Transfer', amount: 495000, date: new Date('2026-11-03T15:20:00'), status: 'Blocked', paymentMethod: 'RTGS', location: 'Ahmedabad, IN', riskScore: 95, riskLevel: 'Critical', triggeredRules: ['High-Value Transaction', 'Unusual Behaviour', 'Rapid Transactions'], description: 'Exceptionally high transfer from suspended account' },

    // --- High risk ---
    { id: 'TXN-90819', customerId: 'CUS-1003', customer: 'Rohan Desai', senderAccount: '•••• 7732', receiverAccount: 'Cash', type: 'Withdrawal', amount: 40000, date: new Date('2026-11-03T12:21:00'), status: 'Under Review', paymentMethod: 'Cash', location: 'Mumbai, IN', riskScore: 68, riskLevel: 'High', triggeredRules: ['Unusual Behaviour', 'Multiple Failed Attempts'], description: 'Unusual cash withdrawal pattern' },
    { id: 'TXN-90825', customerId: 'CUS-1013', customer: 'Rahul Gupta', senderAccount: '•••• 1893', receiverAccount: '•••• 5566', type: 'Transfer', amount: 150000, date: new Date('2026-11-03T14:05:00'), status: 'Under Review', paymentMethod: 'IMPS', location: 'Lucknow, IN', riskScore: 72, riskLevel: 'High', triggeredRules: ['High-Value Transaction', 'Rapid Transactions'], description: 'Multiple high-value transfers in short period' },
    { id: 'TXN-90828', customerId: 'CUS-1005', customer: 'Kabir Khan', senderAccount: '•••• 0288', receiverAccount: '•••• 3344', type: 'Transfer', amount: 95000, date: new Date('2026-11-03T14:45:00'), status: 'Blocked', paymentMethod: 'NEFT', location: 'Dubai, AE', riskScore: 78, riskLevel: 'High', triggeredRules: ['Unusual Location', 'Rapid Transactions', 'Suspicious Frequency'], description: 'Second international transfer within hours' },

    // --- Medium risk ---
    { id: 'TXN-90815', customerId: 'CUS-1007', customer: 'Ishaan Mehta', senderAccount: '•••• 3187', receiverAccount: '•••• 8899', type: 'Transfer', amount: 56000, date: new Date('2026-11-03T11:30:00'), status: 'Completed', paymentMethod: 'IMPS', location: 'Delhi, IN', riskScore: 32, riskLevel: 'Medium', triggeredRules: ['Unusual Behaviour'], description: 'Transfer amount higher than usual pattern' },
    { id: 'TXN-90823', customerId: 'CUS-1009', customer: 'Vikram Singh', senderAccount: '•••• 2756', receiverAccount: '•••• 4455', type: 'Transfer', amount: 75000, date: new Date('2026-11-03T13:15:00'), status: 'Completed', paymentMethod: 'NEFT', location: 'Jaipur, IN', riskScore: 38, riskLevel: 'Medium', triggeredRules: ['Unusual Behaviour'], description: 'First-time large NEFT transfer' },
    { id: 'TXN-90826', customerId: 'CUS-1012', customer: 'Kavya Iyer', senderAccount: '•••• 6278', receiverAccount: '•••• 7788', type: 'Card Payment', amount: 28000, date: new Date('2026-11-03T14:20:00'), status: 'Completed', paymentMethod: 'Card', location: 'Chennai, IN', riskScore: 42, riskLevel: 'Medium', triggeredRules: ['Unusual Behaviour'], description: 'Card payment significantly above average' },

    // --- Low risk / Normal ---
    { id: 'TXN-90820', customerId: 'CUS-1002', customer: 'Priya Patel', senderAccount: '•••• 1904', receiverAccount: 'POS Terminal', type: 'Card Payment', amount: 2450, date: new Date('2026-11-03T12:36:00'), status: 'Completed', paymentMethod: 'Card', location: 'Pune, IN', riskScore: 8, riskLevel: 'Low', triggeredRules: [], description: 'Regular card payment at retail store' },
    { id: 'TXN-90818', customerId: 'CUS-1004', customer: 'Meera Joshi', senderAccount: 'Cash', receiverAccount: '•••• 5510', type: 'Deposit', amount: 75000, date: new Date('2026-11-03T12:10:00'), status: 'Completed', paymentMethod: 'Cash', location: 'Nashik, IN', riskScore: 12, riskLevel: 'Low', triggeredRules: [], description: 'Branch cash deposit' },
    { id: 'TXN-90816', customerId: 'CUS-1006', customer: 'Ananya Kulkarni', senderAccount: '•••• 6643', receiverAccount: 'POS Terminal', type: 'Card Payment', amount: 1299, date: new Date('2026-11-03T11:44:00'), status: 'Failed', paymentMethod: 'Card', location: 'Aurangabad, IN', riskScore: 18, riskLevel: 'Low', triggeredRules: [], description: 'Card payment declined — insufficient funds' },
    { id: 'TXN-90822', customerId: 'CUS-1008', customer: 'Sneha Reddy', senderAccount: '•••• 9451', receiverAccount: '•••• 2233', type: 'Transfer', amount: 15000, date: new Date('2026-11-03T13:00:00'), status: 'Completed', paymentMethod: 'UPI', location: 'Hyderabad, IN', riskScore: 5, riskLevel: 'Low', triggeredRules: [], description: 'Regular UPI transfer' },
    { id: 'TXN-90824', customerId: 'CUS-1010', customer: 'Diya Nair', senderAccount: '•••• 8134', receiverAccount: 'Merchant', type: 'Card Payment', amount: 3200, date: new Date('2026-11-03T13:30:00'), status: 'Completed', paymentMethod: 'Card', location: 'Kochi, IN', riskScore: 4, riskLevel: 'Low', triggeredRules: [], description: 'Online shopping payment' },
    { id: 'TXN-90827', customerId: 'CUS-1011', customer: 'Arjun Rao', senderAccount: '•••• 4590', receiverAccount: '•••• 1122', type: 'Transfer', amount: 8500, date: new Date('2026-11-03T14:30:00'), status: 'Completed', paymentMethod: 'UPI', location: 'Bangalore, IN', riskScore: 6, riskLevel: 'Low', triggeredRules: [], description: 'Regular UPI payment' },
    { id: 'TXN-90829', customerId: 'CUS-1014', customer: 'Nisha Verma', senderAccount: '•••• 5042', receiverAccount: 'Merchant', type: 'Card Payment', amount: 4500, date: new Date('2026-11-03T15:00:00'), status: 'Completed', paymentMethod: 'Card', location: 'Indore, IN', riskScore: 3, riskLevel: 'Low', triggeredRules: [], description: 'Grocery store payment' },

    // --- Additional transactions for volume ---
    { id: 'TXN-90831', customerId: 'CUS-1002', customer: 'Priya Patel', senderAccount: '•••• 1904', receiverAccount: '•••• 6677', type: 'Transfer', amount: 45000, date: new Date('2026-11-02T10:15:00'), status: 'Completed', paymentMethod: 'NEFT', location: 'Mumbai, IN', riskScore: 10, riskLevel: 'Low', triggeredRules: [], description: 'Rent payment transfer' },
    { id: 'TXN-90832', customerId: 'CUS-1004', customer: 'Meera Joshi', senderAccount: '•••• 5510', receiverAccount: 'Merchant', type: 'Card Payment', amount: 6800, date: new Date('2026-11-02T11:30:00'), status: 'Completed', paymentMethod: 'Card', location: 'Nashik, IN', riskScore: 5, riskLevel: 'Low', triggeredRules: [], description: 'Pharmacy purchase' },
    { id: 'TXN-90833', customerId: 'CUS-1007', customer: 'Ishaan Mehta', senderAccount: '•••• 3187', receiverAccount: '•••• 1100', type: 'Transfer', amount: 12000, date: new Date('2026-11-02T09:45:00'), status: 'Completed', paymentMethod: 'UPI', location: 'Delhi, IN', riskScore: 7, riskLevel: 'Low', triggeredRules: [], description: 'Monthly subscription payment' },
    { id: 'TXN-90834', customerId: 'CUS-1009', customer: 'Vikram Singh', senderAccount: '•••• 2756', receiverAccount: 'Cash', type: 'Withdrawal', amount: 20000, date: new Date('2026-11-02T14:20:00'), status: 'Completed', paymentMethod: 'Cash', location: 'Jaipur, IN', riskScore: 14, riskLevel: 'Low', triggeredRules: [], description: 'ATM cash withdrawal' },
    { id: 'TXN-90835', customerId: 'CUS-1013', customer: 'Rahul Gupta', senderAccount: '•••• 1893', receiverAccount: '•••• 9900', type: 'Transfer', amount: 85000, date: new Date('2026-11-02T16:05:00'), status: 'Completed', paymentMethod: 'IMPS', location: 'Lucknow, IN', riskScore: 28, riskLevel: 'Low', triggeredRules: [], description: 'Business vendor payment' },
    { id: 'TXN-90836', customerId: 'CUS-1001', customer: 'Aarav Sharma', senderAccount: '•••• 4821', receiverAccount: 'Merchant', type: 'Card Payment', amount: 3500, date: new Date('2026-11-02T18:30:00'), status: 'Completed', paymentMethod: 'Card', location: 'Pune, IN', riskScore: 4, riskLevel: 'Low', triggeredRules: [], description: 'Restaurant bill payment' },
    { id: 'TXN-90837', customerId: 'CUS-1003', customer: 'Rohan Desai', senderAccount: '•••• 7732', receiverAccount: '•••• 4455', type: 'Transfer', amount: 5000, date: new Date('2026-11-02T12:00:00'), status: 'Failed', paymentMethod: 'UPI', location: 'Mumbai, IN', riskScore: 15, riskLevel: 'Low', triggeredRules: [], description: 'UPI transfer failed — server timeout' },
    { id: 'TXN-90838', customerId: 'CUS-1003', customer: 'Rohan Desai', senderAccount: '•••• 7732', receiverAccount: '•••• 4455', type: 'Transfer', amount: 5000, date: new Date('2026-11-02T12:02:00'), status: 'Failed', paymentMethod: 'UPI', location: 'Mumbai, IN', riskScore: 22, riskLevel: 'Low', triggeredRules: [], description: 'Retry failed — bank server unavailable' },
    { id: 'TXN-90839', customerId: 'CUS-1003', customer: 'Rohan Desai', senderAccount: '•••• 7732', receiverAccount: '•••• 4455', type: 'Transfer', amount: 5000, date: new Date('2026-11-02T12:05:00'), status: 'Completed', paymentMethod: 'UPI', location: 'Mumbai, IN', riskScore: 18, riskLevel: 'Low', triggeredRules: [], description: 'Retry succeeded on third attempt' },
    { id: 'TXN-90840', customerId: 'CUS-1006', customer: 'Ananya Kulkarni', senderAccount: '•••• 6643', receiverAccount: '•••• 8800', type: 'Transfer', amount: 22000, date: new Date('2026-11-01T10:30:00'), status: 'Completed', paymentMethod: 'NEFT', location: 'Aurangabad, IN', riskScore: 8, riskLevel: 'Low', triggeredRules: [], description: 'EMI payment transfer' },
    { id: 'TXN-90841', customerId: 'CUS-1008', customer: 'Sneha Reddy', senderAccount: '•••• 9451', receiverAccount: 'Merchant', type: 'Card Payment', amount: 12500, date: new Date('2026-11-01T15:45:00'), status: 'Completed', paymentMethod: 'Card', location: 'Hyderabad, IN', riskScore: 9, riskLevel: 'Low', triggeredRules: [], description: 'Electronics store purchase' },
    { id: 'TXN-90842', customerId: 'CUS-1010', customer: 'Diya Nair', senderAccount: '•••• 8134', receiverAccount: '•••• 3300', type: 'Transfer', amount: 7500, date: new Date('2026-11-01T09:00:00'), status: 'Completed', paymentMethod: 'UPI', location: 'Kochi, IN', riskScore: 3, riskLevel: 'Low', triggeredRules: [], description: 'Utility bill payment' },
    { id: 'TXN-90843', customerId: 'CUS-1011', customer: 'Arjun Rao', senderAccount: '•••• 4590', receiverAccount: 'Merchant', type: 'Card Payment', amount: 18000, date: new Date('2026-11-01T13:20:00'), status: 'Completed', paymentMethod: 'Card', location: 'Bangalore, IN', riskScore: 11, riskLevel: 'Low', triggeredRules: [], description: 'Clothing store purchase' },
    { id: 'TXN-90844', customerId: 'CUS-1012', customer: 'Kavya Iyer', senderAccount: '•••• 6278', receiverAccount: '•••• 5500', type: 'Transfer', amount: 35000, date: new Date('2026-11-01T11:10:00'), status: 'Completed', paymentMethod: 'NEFT', location: 'Chennai, IN', riskScore: 15, riskLevel: 'Low', triggeredRules: [], description: 'Insurance premium payment' },
    { id: 'TXN-90845', customerId: 'CUS-1014', customer: 'Nisha Verma', senderAccount: 'Employer', receiverAccount: '•••• 5042', type: 'Deposit', amount: 55000, date: new Date('2026-11-01T08:00:00'), status: 'Completed', paymentMethod: 'NEFT', location: 'Indore, IN', riskScore: 2, riskLevel: 'Low', triggeredRules: [], description: 'Salary credit' },
    { id: 'TXN-90846', customerId: 'CUS-1015', customer: 'Siddharth Jain', senderAccount: '•••• 3367', receiverAccount: '•••• 6600', type: 'Transfer', amount: 320000, date: new Date('2026-11-02T08:30:00'), status: 'Blocked', paymentMethod: 'RTGS', location: 'Ahmedabad, IN', riskScore: 88, riskLevel: 'Critical', triggeredRules: ['High-Value Transaction', 'Suspicious Frequency'], description: 'High-value transfer from flagged account' },
    { id: 'TXN-90847', customerId: 'CUS-1005', customer: 'Kabir Khan', senderAccount: '•••• 0288', receiverAccount: '•••• 1133', type: 'Transfer', amount: 175000, date: new Date('2026-11-02T09:15:00'), status: 'Blocked', paymentMethod: 'NEFT', location: 'Singapore, SG', riskScore: 82, riskLevel: 'Critical', triggeredRules: ['High-Value Transaction', 'Unusual Location', 'Rapid Transactions'], description: 'Transfer to overseas account from restricted customer' },
    { id: 'TXN-90848', customerId: 'CUS-1013', customer: 'Rahul Gupta', senderAccount: '•••• 1893', receiverAccount: '•••• 7722', type: 'Transfer', amount: 120000, date: new Date('2026-11-02T16:30:00'), status: 'Under Review', paymentMethod: 'RTGS', location: 'Lucknow, IN', riskScore: 62, riskLevel: 'High', triggeredRules: ['Rapid Transactions', 'High-Value Transaction'], description: 'Second large transfer same day' },
    // Nov 4 entries
    { id: 'TXN-90849', customerId: 'CUS-1002', customer: 'Priya Patel', senderAccount: '•••• 1904', receiverAccount: 'Merchant', type: 'Card Payment', amount: 1800, date: new Date('2026-11-04T09:30:00'), status: 'Completed', paymentMethod: 'Card', location: 'Mumbai, IN', riskScore: 3, riskLevel: 'Low', triggeredRules: [], description: 'Morning coffee and breakfast' },
    { id: 'TXN-90850', customerId: 'CUS-1004', customer: 'Meera Joshi', senderAccount: '•••• 5510', receiverAccount: '•••• 2200', type: 'Transfer', amount: 10000, date: new Date('2026-11-04T10:15:00'), status: 'Completed', paymentMethod: 'UPI', location: 'Nashik, IN', riskScore: 6, riskLevel: 'Low', triggeredRules: [], description: 'School fees transfer' },
    { id: 'TXN-90851', customerId: 'CUS-1008', customer: 'Sneha Reddy', senderAccount: '•••• 9451', receiverAccount: '•••• 4400', type: 'Transfer', amount: 250000, date: new Date('2026-11-04T11:00:00'), status: 'Pending', paymentMethod: 'RTGS', location: 'Hyderabad, IN', riskScore: 35, riskLevel: 'Medium', triggeredRules: ['High-Value Transaction'], description: 'Property advance payment' },
    { id: 'TXN-90852', customerId: 'CUS-1011', customer: 'Arjun Rao', senderAccount: '•••• 4590', receiverAccount: 'Merchant', type: 'Card Payment', amount: 42000, date: new Date('2026-11-04T12:30:00'), status: 'Completed', paymentMethod: 'Card', location: 'Bangalore, IN', riskScore: 22, riskLevel: 'Low', triggeredRules: [], description: 'Laptop purchase at electronics store' },
  ];

  /* ── Fraud Alerts ───────────────────────────────────────────── */

  readonly alerts: FraudAlert[] = [
    { id: 'ALT-3018', transactionId: 'TXN-90821', customerId: 'CUS-1001', customer: 'Aarav Sharma', amount: 185000, riskScore: 92, riskLevel: 'Critical', category: 'Critical', triggeredRules: ['High-Value Transaction', 'Unusual Location'], explanation: 'This transaction was flagged because the amount (₹1,85,000) exceeds the high-value threshold of ₹1,00,000 AND the transaction originated from an unrecognized location not matching the customer\'s recorded activity in Pune, Maharashtra.', detectedAt: new Date('2026-11-03T12:42:00'), status: 'Open', assignedTo: '', investigationNotes: [], dismissalJustification: '', resolvedAt: null },
    { id: 'ALT-3017', transactionId: 'TXN-90817', customerId: 'CUS-1005', customer: 'Kabir Khan', amount: 220000, riskScore: 86, riskLevel: 'Critical', category: 'Critical', triggeredRules: ['High-Value Transaction', 'Unusual Location', 'Suspicious Frequency'], explanation: 'This transaction was flagged because: (1) Amount ₹2,20,000 exceeds the ₹1,00,000 high-value threshold, (2) Transaction originated from International Gateway which is inconsistent with the customer\'s usual Delhi-based activity, (3) Customer has made 3+ transfers in the past 24 hours.', detectedAt: new Date('2026-11-03T11:58:00'), status: 'Investigating', assignedTo: 'Fraud Investigator', investigationNotes: [{ id: 'N-001', author: 'System', content: 'Alert auto-generated by fraud detection engine.', timestamp: new Date('2026-11-03T11:58:00'), action: 'Created' }, { id: 'N-002', author: 'Admin', content: 'Escalated for immediate review. Customer account restricted pending investigation.', timestamp: new Date('2026-11-03T12:15:00'), action: 'Escalated' }], dismissalJustification: '', resolvedAt: null },
    { id: 'ALT-3019', transactionId: 'TXN-90830', customerId: 'CUS-1015', customer: 'Siddharth Jain', amount: 495000, riskScore: 95, riskLevel: 'Critical', category: 'Critical', triggeredRules: ['High-Value Transaction', 'Unusual Behaviour', 'Rapid Transactions'], explanation: 'Exceptionally high-value transfer of ₹4,95,000 from a suspended account. The amount is 3x the customer\'s average transaction and was attempted within 30 minutes of a previous blocked transfer. Account is currently suspended.', detectedAt: new Date('2026-11-03T15:20:00'), status: 'Open', assignedTo: '', investigationNotes: [], dismissalJustification: '', resolvedAt: null },
    { id: 'ALT-3016', transactionId: 'TXN-90819', customerId: 'CUS-1003', customer: 'Rohan Desai', amount: 40000, riskScore: 68, riskLevel: 'High', category: 'High', triggeredRules: ['Unusual Behaviour', 'Multiple Failed Attempts'], explanation: 'Cash withdrawal of ₹40,000 is significantly higher than the customer\'s average withdrawal of ₹10,000. Additionally, the customer had 2 failed transaction attempts immediately before this withdrawal.', detectedAt: new Date('2026-11-03T12:21:00'), status: 'Open', assignedTo: '', investigationNotes: [], dismissalJustification: '', resolvedAt: null },
    { id: 'ALT-3020', transactionId: 'TXN-90825', customerId: 'CUS-1013', customer: 'Rahul Gupta', amount: 150000, riskScore: 72, riskLevel: 'High', category: 'High', triggeredRules: ['High-Value Transaction', 'Rapid Transactions'], explanation: 'Transfer of ₹1,50,000 via IMPS. Customer has initiated 3 high-value transfers in the last 6 hours totalling over ₹3,50,000, which is unusual for this account\'s historical pattern.', detectedAt: new Date('2026-11-03T14:05:00'), status: 'Investigating', assignedTo: 'Banking Administrator', investigationNotes: [{ id: 'N-003', author: 'System', content: 'Alert auto-generated. Multiple high-value transfers detected.', timestamp: new Date('2026-11-03T14:05:00'), action: 'Created' }], dismissalJustification: '', resolvedAt: null },
    { id: 'ALT-3021', transactionId: 'TXN-90828', customerId: 'CUS-1005', customer: 'Kabir Khan', amount: 95000, riskScore: 78, riskLevel: 'High', category: 'High', triggeredRules: ['Unusual Location', 'Rapid Transactions', 'Suspicious Frequency'], explanation: 'Second international transfer in 3 hours from a restricted account. The destination (Dubai, AE) is not in the customer\'s usual transaction locations. Combined with ALT-3017, this indicates potentially coordinated fund movement.', detectedAt: new Date('2026-11-03T14:45:00'), status: 'Open', assignedTo: '', investigationNotes: [], dismissalJustification: '', resolvedAt: null },
    { id: 'ALT-3022', transactionId: 'TXN-90846', customerId: 'CUS-1015', customer: 'Siddharth Jain', amount: 320000, riskScore: 88, riskLevel: 'Critical', category: 'Critical', triggeredRules: ['High-Value Transaction', 'Suspicious Frequency'], explanation: 'Large transfer attempt from a suspended account. Customer attempted ₹3,20,000 RTGS transfer despite account suspension, suggesting potential unauthorized access.', detectedAt: new Date('2026-11-02T08:30:00'), status: 'Resolved', assignedTo: 'Super Admin', investigationNotes: [{ id: 'N-004', author: 'System', content: 'Transfer auto-blocked. Account is suspended.', timestamp: new Date('2026-11-02T08:30:00'), action: 'Blocked' }, { id: 'N-005', author: 'Super Admin', content: 'Confirmed unauthorized access attempt. Account credentials reset. Customer notified.', timestamp: new Date('2026-11-02T10:00:00'), action: 'Resolved' }], dismissalJustification: '', resolvedAt: new Date('2026-11-02T10:00:00') },
    { id: 'ALT-3023', transactionId: 'TXN-90847', customerId: 'CUS-1005', customer: 'Kabir Khan', amount: 175000, riskScore: 82, riskLevel: 'Critical', category: 'Critical', triggeredRules: ['High-Value Transaction', 'Unusual Location', 'Rapid Transactions'], explanation: 'Transfer of ₹1,75,000 to Singapore-based account. Customer\'s activity pattern shows Delhi-based transactions only. Three international transfers in 48 hours from a restricted account.', detectedAt: new Date('2026-11-02T09:15:00'), status: 'Investigating', assignedTo: 'Fraud Investigator', investigationNotes: [{ id: 'N-006', author: 'Fraud Investigator', content: 'Correlated with ALT-3017 and ALT-3021. Preparing comprehensive report for compliance team.', timestamp: new Date('2026-11-02T11:30:00'), action: 'Investigating' }], dismissalJustification: '', resolvedAt: null },
    { id: 'ALT-3024', transactionId: 'TXN-90848', customerId: 'CUS-1013', customer: 'Rahul Gupta', amount: 120000, riskScore: 62, riskLevel: 'High', category: 'High', triggeredRules: ['Rapid Transactions', 'High-Value Transaction'], explanation: 'Second large RTGS transfer on the same day. Combined with TXN-90835 (₹85,000) and TXN-90825 (₹1,50,000), total day transfers exceed ₹3,55,000.', detectedAt: new Date('2026-11-02T16:30:00'), status: 'Dismissed', assignedTo: 'Banking Administrator', investigationNotes: [{ id: 'N-007', author: 'Banking Administrator', content: 'Verified with customer. Business-related payments for quarterly vendor settlements. Customer provided invoices.', timestamp: new Date('2026-11-02T17:00:00'), action: 'Dismissed' }], dismissalJustification: 'Verified legitimate business payments. Customer provided supporting invoices for vendor settlements.', resolvedAt: new Date('2026-11-02T17:00:00') },
    { id: 'ALT-3025', transactionId: 'TXN-90851', customerId: 'CUS-1008', customer: 'Sneha Reddy', amount: 250000, riskScore: 35, riskLevel: 'Medium', category: 'Medium', triggeredRules: ['High-Value Transaction'], explanation: 'High-value RTGS transfer of ₹2,50,000. Amount exceeds the ₹1,00,000 threshold. However, the customer has a Current account with sufficient balance and the destination is within India.', detectedAt: new Date('2026-11-04T11:00:00'), status: 'Open', assignedTo: '', investigationNotes: [], dismissalJustification: '', resolvedAt: null },
  ];

  /* ── Detection Rules ────────────────────────────────────────── */

  readonly detectionRules: DetectionRule[] = [
    { id: 'RULE-01', name: 'High-Value Transaction', description: 'Flags transactions where the amount exceeds the configured threshold.', enabled: true, scoreWeight: 20, threshold: 100000, timeWindowMinutes: 0 },
    { id: 'RULE-02', name: 'Rapid Transactions', description: 'Detects multiple transactions from the same account within a short time interval.', enabled: true, scoreWeight: 25, threshold: 3, timeWindowMinutes: 60 },
    { id: 'RULE-03', name: 'Unusual Location', description: 'Flags transactions originating from locations that differ from the customer\'s recorded activity history.', enabled: true, scoreWeight: 30, threshold: 0, timeWindowMinutes: 0 },
    { id: 'RULE-04', name: 'Multiple Failed Attempts', description: 'Detects repeated failed transactions within a configured time window.', enabled: true, scoreWeight: 20, threshold: 2, timeWindowMinutes: 30 },
    { id: 'RULE-05', name: 'Unusual Behaviour', description: 'Identifies transactions that significantly differ from the customer\'s historical transaction pattern (amount, type, frequency).', enabled: true, scoreWeight: 25, threshold: 200, timeWindowMinutes: 0 },
    { id: 'RULE-06', name: 'Suspicious Frequency', description: 'Detects an unusually high number of transactions in a 24-hour period.', enabled: true, scoreWeight: 20, threshold: 5, timeWindowMinutes: 1440 },
  ];

  /* ── Users ──────────────────────────────────────────────────── */

  readonly users: AppUser[] = [
    { id: 'USR-001', username: 'admin', email: 'admin@bankguard.demo', fullName: 'Admin Desk', role: 'Super Admin', isActive: true, lastLogin: new Date('2026-11-04T08:00:00'), createdAt: new Date('2023-01-01'), passwordHash: '$2b$10$demohashadmin' },
    { id: 'USR-002', username: 'pratik.b', email: 'pratik.b@bankguard.demo', fullName: 'Pratik Bairagi', role: 'Banking Administrator', isActive: true, lastLogin: new Date('2026-11-04T09:30:00'), createdAt: new Date('2023-06-15'), passwordHash: '$2b$10$demohashpratik' },
    { id: 'USR-003', username: 'tanvesh.y', email: 'tanvesh.y@bankguard.demo', fullName: 'Tanvesh Yeole', role: 'Fraud Investigator', isActive: true, lastLogin: new Date('2026-11-03T14:20:00'), createdAt: new Date('2023-06-15'), passwordHash: '$2b$10$demohashtanvesh' },
    { id: 'USR-004', username: 'vikas.k', email: 'vikas.k@bankguard.demo', fullName: 'Vikas Kusmude', role: 'Fraud Investigator', isActive: true, lastLogin: new Date('2026-11-04T07:45:00'), createdAt: new Date('2023-06-15'), passwordHash: '$2b$10$demohashvikas' },
    { id: 'USR-005', username: 'pratik.h', email: 'pratik.h@bankguard.demo', fullName: 'Pratik Hirve', role: 'Banking Administrator', isActive: true, lastLogin: new Date('2026-11-03T16:00:00'), createdAt: new Date('2023-06-15'), passwordHash: '$2b$10$demohashpratikh' },
    { id: 'USR-006', username: 'atharva.d', email: 'atharva.d@bankguard.demo', fullName: 'Atharva Deshmukh', role: 'Super Admin', isActive: true, lastLogin: new Date('2026-11-04T10:00:00'), createdAt: new Date('2023-06-15'), passwordHash: '$2b$10$demohashatharva' },
    { id: 'USR-007', username: 'auditor', email: 'auditor@bankguard.demo', fullName: 'Audit Observer', role: 'Read-Only Auditor', isActive: true, lastLogin: new Date('2026-11-02T11:00:00'), createdAt: new Date('2024-01-10'), passwordHash: '$2b$10$demohashauditor' },
  ];

  /* ── Audit Logs ─────────────────────────────────────────────── */

  readonly auditLogs: AuditLog[] = [
    { id: 'LOG-5001', userId: 'USR-001', userName: 'Admin Desk', action: 'LOGIN', target: 'Session', targetId: 'SES-101', details: 'Admin logged in from 192.168.1.10', timestamp: new Date('2026-11-04T08:00:00'), ipAddress: '192.168.1.10' },
    { id: 'LOG-5002', userId: 'USR-003', userName: 'Tanvesh Yeole', action: 'ALERT_INVESTIGATE', target: 'FraudAlert', targetId: 'ALT-3017', details: 'Started investigation on alert ALT-3017 for Kabir Khan', timestamp: new Date('2026-11-03T12:15:00'), ipAddress: '192.168.1.22' },
    { id: 'LOG-5003', userId: 'USR-001', userName: 'Admin Desk', action: 'ACCOUNT_RESTRICT', target: 'BankAccount', targetId: 'ACC-2005', details: 'Restricted account ACC-2005 (Kabir Khan) pending fraud investigation', timestamp: new Date('2026-11-03T12:20:00'), ipAddress: '192.168.1.10' },
    { id: 'LOG-5004', userId: 'USR-002', userName: 'Pratik Bairagi', action: 'ALERT_DISMISS', target: 'FraudAlert', targetId: 'ALT-3024', details: 'Dismissed alert ALT-3024 — verified legitimate business payments', timestamp: new Date('2026-11-02T17:00:00'), ipAddress: '192.168.1.15' },
    { id: 'LOG-5005', userId: 'USR-006', userName: 'Atharva Deshmukh', action: 'ALERT_RESOLVE', target: 'FraudAlert', targetId: 'ALT-3022', details: 'Resolved alert ALT-3022 — unauthorized access confirmed and mitigated', timestamp: new Date('2026-11-02T10:00:00'), ipAddress: '192.168.1.30' },
    { id: 'LOG-5006', userId: 'USR-001', userName: 'Admin Desk', action: 'ACCOUNT_SUSPEND', target: 'BankAccount', targetId: 'ACC-2015', details: 'Suspended account ACC-2015 (Siddharth Jain) due to repeated fraud alerts', timestamp: new Date('2026-11-02T10:30:00'), ipAddress: '192.168.1.10' },
    { id: 'LOG-5007', userId: 'USR-004', userName: 'Vikas Kusmude', action: 'CUSTOMER_UPDATE', target: 'Customer', targetId: 'CUS-1005', details: 'Updated risk classification from High to Critical for Kabir Khan', timestamp: new Date('2026-11-03T13:00:00'), ipAddress: '192.168.1.25' },
    { id: 'LOG-5008', userId: 'USR-005', userName: 'Pratik Hirve', action: 'TRANSACTION_REVIEW', target: 'Transaction', targetId: 'TXN-90825', details: 'Moved transaction TXN-90825 to Under Review status', timestamp: new Date('2026-11-03T14:10:00'), ipAddress: '192.168.1.28' },
    { id: 'LOG-5009', userId: 'USR-003', userName: 'Tanvesh Yeole', action: 'REPORT_EXPORT', target: 'Report', targetId: 'RPT-001', details: 'Exported daily fraud detection report for 2026-11-03', timestamp: new Date('2026-11-03T17:30:00'), ipAddress: '192.168.1.22' },
    { id: 'LOG-5010', userId: 'USR-006', userName: 'Atharva Deshmukh', action: 'USER_CREATE', target: 'User', targetId: 'USR-007', details: 'Created read-only auditor account for Audit Observer', timestamp: new Date('2024-01-10T10:00:00'), ipAddress: '192.168.1.30' },
    { id: 'LOG-5011', userId: 'USR-001', userName: 'Admin Desk', action: 'RULE_UPDATE', target: 'DetectionRule', targetId: 'RULE-01', details: 'Updated high-value threshold from ₹50,000 to ₹1,00,000', timestamp: new Date('2026-10-15T09:00:00'), ipAddress: '192.168.1.10' },
    { id: 'LOG-5012', userId: 'USR-002', userName: 'Pratik Bairagi', action: 'LOGIN', target: 'Session', targetId: 'SES-102', details: 'Banking Administrator logged in', timestamp: new Date('2026-11-04T09:30:00'), ipAddress: '192.168.1.15' },
  ];

  /* ── Notifications ──────────────────────────────────────────── */

  readonly notifications: AppNotification[] = [
    { id: 'NTF-001', title: 'Critical Alert', message: 'New critical fraud alert ALT-3019 requires immediate attention', type: 'error', timestamp: new Date('2026-11-03T15:20:00'), read: false, link: '/fraud-alerts' },
    { id: 'NTF-002', title: 'Account Restricted', message: 'Account ACC-2005 (Kabir Khan) has been restricted', type: 'warning', timestamp: new Date('2026-11-03T12:20:00'), read: true, link: '/accounts' },
    { id: 'NTF-003', title: 'Investigation Update', message: 'ALT-3017 moved to Investigating status', type: 'info', timestamp: new Date('2026-11-03T12:15:00'), read: true, link: '/fraud-monitoring' },
    { id: 'NTF-004', title: 'Alert Resolved', message: 'ALT-3022 has been resolved successfully', type: 'success', timestamp: new Date('2026-11-02T10:00:00'), read: true, link: '/fraud-alerts' },
    { id: 'NTF-005', title: 'New Pending Transaction', message: 'TXN-90851 (₹2,50,000) requires review', type: 'warning', timestamp: new Date('2026-11-04T11:00:00'), read: false, link: '/transactions' },
  ];

  /* ── Daily Aggregates (for charts) ──────────────────────────── */

  readonly dailyAggregates = [
    { date: '2026-10-29', transactions: 42, volume: 1850000, successful: 38, failed: 4, flagged: 2 },
    { date: '2026-10-30', transactions: 55, volume: 2340000, successful: 49, failed: 3, flagged: 3 },
    { date: '2026-10-31', transactions: 48, volume: 1920000, successful: 44, failed: 2, flagged: 2 },
    { date: '2026-11-01', transactions: 61, volume: 2780000, successful: 55, failed: 3, flagged: 3 },
    { date: '2026-11-02', transactions: 58, volume: 3150000, successful: 48, failed: 5, flagged: 5 },
    { date: '2026-11-03', transactions: 67, volume: 3480000, successful: 54, failed: 4, flagged: 9 },
    { date: '2026-11-04', transactions: 35, volume: 1620000, successful: 31, failed: 1, flagged: 3 },
  ];

  readonly transactionTypeDistribution = [
    { type: 'Transfer', count: 24, percentage: 40 },
    { type: 'Card Payment', count: 18, percentage: 30 },
    { type: 'Withdrawal', count: 9, percentage: 15 },
    { type: 'Deposit', count: 9, percentage: 15 },
  ];

  readonly paymentChannelDistribution = [
    { channel: 'UPI', count: 15, percentage: 25 },
    { channel: 'NEFT', count: 12, percentage: 20 },
    { channel: 'Card', count: 12, percentage: 20 },
    { channel: 'IMPS', count: 9, percentage: 15 },
    { channel: 'RTGS', count: 7, percentage: 12 },
    { channel: 'Cash', count: 5, percentage: 8 },
  ];

  readonly geographicDistribution = [
    { location: 'Mumbai, IN', count: 12, percentage: 20 },
    { location: 'Pune, IN', count: 8, percentage: 13 },
    { location: 'Delhi, IN', count: 7, percentage: 12 },
    { location: 'Bangalore, IN', count: 5, percentage: 8 },
    { location: 'Hyderabad, IN', count: 5, percentage: 8 },
    { location: 'Chennai, IN', count: 4, percentage: 7 },
    { location: 'Nashik, IN', count: 4, percentage: 7 },
    { location: 'Other IN', count: 10, percentage: 17 },
    { location: 'International', count: 5, percentage: 8 },
  ];
}
