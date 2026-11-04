import { Injectable, signal, computed } from '@angular/core';
import { BankTransaction, TransactionStatus } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private transactionsData = signal<BankTransaction[]>([]);

  readonly transactions = this.transactionsData.asReadonly();
  readonly totalCount = computed(() => this.transactionsData().length);

  constructor(private data: MockDataService) {
    this.transactionsData.set([...this.data.transactions]);
  }

  getAll(): BankTransaction[] {
    return this.transactionsData();
  }

  getById(id: string): BankTransaction | undefined {
    return this.transactionsData().find(t => t.id === id);
  }

  getByCustomerId(customerId: string): BankTransaction[] {
    return this.transactionsData().filter(t => t.customerId === customerId);
  }

  getByAccount(account: string): BankTransaction[] {
    return this.transactionsData().filter(
      t => t.senderAccount === account || t.receiverAccount === account
    );
  }

  updateStatus(id: string, status: TransactionStatus): void {
    this.transactionsData.update(txns =>
      txns.map(t => t.id === id ? { ...t, status } : t)
    );
  }

  search(term: string): BankTransaction[] {
    const lower = term.toLowerCase();
    return this.transactionsData().filter(t =>
      [t.id, t.customer, t.senderAccount, t.receiverAccount, t.location, t.description]
        .some(v => v.toLowerCase().includes(lower))
    );
  }

  filter(filters: {
    status?: string;
    type?: string;
    paymentMethod?: string;
    riskLevel?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
  }): BankTransaction[] {
    return this.transactionsData().filter(t => {
      if (filters.status && filters.status !== 'All' && t.status !== filters.status) return false;
      if (filters.type && filters.type !== 'All' && t.type !== filters.type) return false;
      if (filters.paymentMethod && filters.paymentMethod !== 'All' && t.paymentMethod !== filters.paymentMethod) return false;
      if (filters.riskLevel && filters.riskLevel !== 'All' && t.riskLevel !== filters.riskLevel) return false;
      if (filters.startDate && t.date < filters.startDate) return false;
      if (filters.endDate && t.date > filters.endDate) return false;
      if (filters.minAmount !== undefined && t.amount < filters.minAmount) return false;
      if (filters.maxAmount !== undefined && t.amount > filters.maxAmount) return false;
      return true;
    });
  }

  /** Compute summary statistics for the current transaction set */
  getSummary() {
    const txns = this.transactionsData();
    return {
      total: txns.length,
      totalVolume: txns.reduce((s, t) => s + t.amount, 0),
      completed: txns.filter(t => t.status === 'Completed').length,
      pending: txns.filter(t => t.status === 'Pending').length,
      failed: txns.filter(t => t.status === 'Failed').length,
      underReview: txns.filter(t => t.status === 'Under Review').length,
      blocked: txns.filter(t => t.status === 'Blocked').length,
      avgRiskScore: txns.length > 0 ? Math.round(txns.reduce((s, t) => s + t.riskScore, 0) / txns.length) : 0,
    };
  }

  exportCsv(transactions: BankTransaction[]): void {
    const header = ['Transaction ID', 'Customer', 'Type', 'Amount (INR)', 'Date', 'Status', 'Payment Method', 'Location', 'Risk Score', 'Risk Level', 'Description'];
    const rows = transactions.map(t => [
      t.id, t.customer, t.type, t.amount,
      t.date.toISOString(), t.status, t.paymentMethod,
      t.location, t.riskScore, t.riskLevel, t.description
    ]);
    const csv = [header, ...rows]
      .map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bankguard-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
