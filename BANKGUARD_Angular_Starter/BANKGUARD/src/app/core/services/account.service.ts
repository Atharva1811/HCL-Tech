import { Injectable, signal } from '@angular/core';
import { BankAccount, AccountStatus } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private accountsData = signal<BankAccount[]>([]);

  readonly accounts = this.accountsData.asReadonly();

  constructor(private data: MockDataService) {
    this.accountsData.set([...this.data.accounts]);
  }

  getAll(): BankAccount[] {
    return this.accountsData();
  }

  getById(id: string): BankAccount | undefined {
    return this.accountsData().find(a => a.id === id);
  }

  getByCustomerId(customerId: string): BankAccount[] {
    return this.accountsData().filter(a => a.customerId === customerId);
  }

  search(term: string): BankAccount[] {
    const lower = term.toLowerCase();
    return this.accountsData().filter(a =>
      [a.id, a.accountNumber, a.accountHolder, a.branch]
        .some(v => v.toLowerCase().includes(lower))
    );
  }

  updateStatus(id: string, status: AccountStatus): void {
    this.accountsData.update(list =>
      list.map(a => a.id === id ? { ...a, status } : a)
    );
  }

  getSummary() {
    const accounts = this.accountsData();
    return {
      total: accounts.length,
      active: accounts.filter(a => a.status === 'Active').length,
      underReview: accounts.filter(a => a.status === 'Under Review').length,
      restricted: accounts.filter(a => a.status === 'Restricted').length,
      suspended: accounts.filter(a => a.status === 'Suspended').length,
      totalBalance: accounts.reduce((s, a) => s + a.balance, 0),
      byType: {
        savings: accounts.filter(a => a.accountType === 'Savings').length,
        current: accounts.filter(a => a.accountType === 'Current').length,
        fixedDeposit: accounts.filter(a => a.accountType === 'Fixed Deposit').length,
        salary: accounts.filter(a => a.accountType === 'Salary').length,
      }
    };
  }
}
