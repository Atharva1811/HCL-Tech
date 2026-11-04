import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../core/services/account.service';
import { BankAccount, AccountStatus, AccountType } from '../../core/models';

@Component({
  selector: 'bg-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="accounts-page">
      <div class="page-heading">
        <div>
          <div class="eyebrow">CORE LEDGER ARCHITECTURE</div>
          <h1>Bank Accounts</h1>
          <p>Supervise retail and corporate bank accounts, simulated balances, and freeze/suspension statuses.</p>
        </div>
        <div class="academic-note">Simulated Core Banking Ledger</div>
      </div>

      <!-- Accounts Aggregate Cards -->
      <div class="aggregate-strip">
        <div class="agg-card">
          <small>Total Accounts</small>
          <b>{{ accounts().length }}</b>
        </div>
        <div class="agg-card">
          <small>Total Ledger Balance</small>
          <b class="blue-text">{{ formatINR(totalBalance()) }}</b>
        </div>
        <div class="agg-card">
          <small>Restricted / Under Review</small>
          <b class="amber-text">{{ restrictedCount() }}</b>
        </div>
        <div class="agg-card">
          <small>Suspended Accounts</small>
          <b class="red-text">{{ suspendedCount() }}</b>
        </div>
      </div>

      <!-- Search & Status Filter -->
      <article class="panel filter-panel">
        <div class="filter-row">
          <input 
            type="text" 
            placeholder="Search account number, holder, branch..." 
            [ngModel]="searchTerm()" 
            (ngModelChange)="searchTerm.set($event)"
            class="form-input">

          <select [ngModel]="typeFilter()" (ngModelChange)="typeFilter.set($event)" class="form-select">
            <option value="All">All Account Types</option>
            <option value="Savings">Savings</option>
            <option value="Current">Current</option>
            <option value="Salary">Salary</option>
            <option value="Fixed Deposit">Fixed Deposit</option>
          </select>

          <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)" class="form-select">
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Restricted">Restricted</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </article>

      <!-- Accounts Table -->
      <article class="panel">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ACCOUNT NO. (MASKED)</th>
                <th>ACCOUNT HOLDER</th>
                <th>TYPE</th>
                <th>SIMULATED BALANCE</th>
                <th>BRANCH</th>
                <th>IFSC CODE</th>
                <th>OPENED DATE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              @for (acc of filteredAccounts(); track acc.id) {
                <tr class="clickable-row" (click)="viewAccount(acc.id)">
                  <td class="id-cell">{{ acc.accountNumber }}</td>
                  <td>
                    <b>{{ acc.accountHolder }}</b>
                    <small class="sub-cell">Customer ID: {{ acc.customerId }}</small>
                  </td>
                  <td><span class="type-pill">{{ acc.accountType }}</span></td>
                  <td class="amount">{{ acc.balance | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                  <td>{{ acc.branch }}</td>
                  <td><code>{{ acc.ifscCode }}</code></td>
                  <td>{{ acc.openedDate | date:'dd MMM yyyy' }}</td>
                  <td>
                    <span class="status" [class]="acc.status.toLowerCase().replace(' ', '-')">{{ acc.status }}</span>
                  </td>
                  <td (click)="$event.stopPropagation()">
                    <button class="secondary-button" (click)="viewAccount(acc.id)">View Ledger →</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="empty-state">No bank accounts match the current filter.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </article>
    </div>
  `,
  styles: [`
    .accounts-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .academic-note {
      font-size: 10px;
      font-weight: 700;
      color: #687589;
      background: #edf3ff;
      border: 1px solid #dbe5ff;
      padding: 6px 12px;
      border-radius: 20px;
    }

    .aggregate-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
    .agg-card {
      background: #fff;
      border: 1px solid #e9edf3;
      border-radius: 9px;
      padding: 14px 18px;
    }
    .agg-card small {
      display: block;
      color: #98a2b3;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .agg-card b {
      display: block;
      font: 800 20px 'Manrope', sans-serif;
      color: #172b4d;
      margin-top: 4px;
    }
    .blue-text { color: #315fcb !important; }
    .amber-text { color: #b78a26 !important; }
    .red-text { color: #df5a55 !important; }

    .filter-panel {
      padding: 14px 20px;
    }
    .filter-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 12px;
    }

    .clickable-row {
      cursor: pointer;
    }
    .clickable-row:hover {
      background: #f8fafd;
    }
    .type-pill {
      background: #f7f9fc;
      border: 1px solid #edf0f5;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      color: #475467;
    }

    .empty-state {
      padding: 40px;
      text-align: center;
      color: #98a2b3;
      font-size: 12px;
    }

    @media (max-width: 800px) {
      .aggregate-strip {
        grid-template-columns: repeat(2, 1fr);
      }
      .filter-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AccountsComponent {
  private accountService = inject(AccountService);
  private router = inject(Router);

  searchTerm = signal('');
  typeFilter = signal('All');
  statusFilter = signal('All');

  accounts = this.accountService.accounts;

  totalBalance = computed(() => this.accounts().reduce((s, a) => s + a.balance, 0));
  restrictedCount = computed(() => this.accounts().filter(a => a.status === 'Restricted' || a.status === 'Under Review').length);
  suspendedCount = computed(() => this.accounts().filter(a => a.status === 'Suspended').length);

  filteredAccounts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const type = this.typeFilter();
    const stat = this.statusFilter();

    return this.accounts().filter(a => {
      const matchSearch = [a.id, a.accountNumber, a.accountHolder, a.branch, a.ifscCode]
        .some(v => v.toLowerCase().includes(term));
      const matchType = type === 'All' || a.accountType === type;
      const matchStat = stat === 'All' || a.status === stat;
      return matchSearch && matchType && matchStat;
    });
  });

  viewAccount(id: string): void {
    this.router.navigate(['/accounts', id]);
  }

  formatINR(val: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }
}

