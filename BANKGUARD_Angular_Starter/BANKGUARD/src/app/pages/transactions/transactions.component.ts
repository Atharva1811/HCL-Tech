import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../core/services/transaction.service';
import { BankTransaction, TransactionStatus, RiskLevel } from '../../core/models';

@Component({
  selector: 'bg-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="transactions-page">
      <div class="page-heading">
        <div>
          <div class="eyebrow">BANKING OPERATIONS</div>
          <h1>Transactions</h1>
          <p>Review, search, filter and monitor all retail and corporate banking transactions.</p>
        </div>
        <div class="header-actions">
          <button class="secondary-button" (click)="resetFilters()">Reset Filters</button>
          <button class="primary-button" (click)="exportCsv()">↓ Export CSV</button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <article class="panel filter-panel">
        <div class="toolbar-grid">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search ID, customer, account or location..." 
              [ngModel]="searchTerm()" 
              (ngModelChange)="searchTerm.set($event)">
          </div>

          <div class="filter-group">
            <label>Status</label>
            <select [ngModel]="selectedStatus()" (ngModelChange)="selectedStatus.set($event)">
              <option value="All">All statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Blocked">Blocked</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Type</label>
            <select [ngModel]="selectedType()" (ngModelChange)="selectedType.set($event)">
              <option value="All">All types</option>
              <option value="Transfer">Transfer</option>
              <option value="Card Payment">Card Payment</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Deposit">Deposit</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Payment Method</label>
            <select [ngModel]="selectedMethod()" (ngModelChange)="selectedMethod.set($event)">
              <option value="All">All methods</option>
              <option value="UPI">UPI</option>
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
              <option value="IMPS">IMPS</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Risk Level</label>
            <select [ngModel]="selectedRisk()" (ngModelChange)="selectedRisk.set($event)">
              <option value="All">All risk levels</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </article>

      <!-- Transactions Table -->
      <article class="panel">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th (click)="sort('id')" class="sortable">
                  TXN ID <span class="sort-icon">{{ getSortIndicator('id') }}</span>
                </th>
                <th (click)="sort('customer')" class="sortable">
                  CUSTOMER <span class="sort-icon">{{ getSortIndicator('customer') }}</span>
                </th>
                <th (click)="sort('type')" class="sortable">
                  TYPE <span class="sort-icon">{{ getSortIndicator('type') }}</span>
                </th>
                <th (click)="sort('amount')" class="sortable">
                  AMOUNT <span class="sort-icon">{{ getSortIndicator('amount') }}</span>
                </th>
                <th>PAYMENT METHOD</th>
                <th (click)="sort('date')" class="sortable">
                  DATE & TIME <span class="sort-icon">{{ getSortIndicator('date') }}</span>
                </th>
                <th>STATUS</th>
                <th (click)="sort('riskScore')" class="sortable">
                  RISK SCORE <span class="sort-icon">{{ getSortIndicator('riskScore') }}</span>
                </th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              @for (t of paginatedTransactions(); track t.id) {
                <tr class="clickable-row" (click)="viewDetail(t.id)">
                  <td class="id-cell">{{ t.id }}</td>
                  <td>
                    <b>{{ t.customer }}</b>
                    <small class="sub-cell">{{ t.senderAccount }} → {{ t.receiverAccount }}</small>
                  </td>
                  <td>{{ t.type }}</td>
                  <td class="amount">{{ t.amount | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                  <td><span class="method-tag">{{ t.paymentMethod }}</span></td>
                  <td>
                    <span>{{ t.date | date:'dd MMM yyyy' }}</span>
                    <small class="sub-cell">{{ t.date | date:'hh:mm a' }}</small>
                  </td>
                  <td>
                    <span class="status" [class]="getStatusClass(t.status)">{{ t.status }}</span>
                  </td>
                  <td>
                    <span class="risk-dot" [class]="t.riskLevel.toLowerCase()"></span>
                    <b>{{ t.riskScore }}</b>
                    <small class="sub-cell">{{ t.riskLevel }} risk</small>
                  </td>
                  <td (click)="$event.stopPropagation()">
                    <button class="action-btn" (click)="viewDetail(t.id)">Inspect →</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="empty-state">
                    No transactions match your search and filter criteria.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="pagination-footer">
          <div class="page-meta">
            Showing {{ pageStartIndex() + 1 }} to {{ pageEndIndex() }} of {{ filteredTransactions().length }} transactions
            <span class="dataset-tag">Demo dataset</span>
          </div>

          <div class="page-controls">
            <button class="page-btn" [disabled]="currentPage() === 1" (click)="setPage(currentPage() - 1)">‹ Prev</button>
            @for (p of totalPagesArray(); track p) {
              <button class="page-btn num" [class.active]="p === currentPage()" (click)="setPage(p)">
                {{ p }}
              </button>
            }
            <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="setPage(currentPage() + 1)">Next ›</button>
          </div>
        </div>
      </article>
    </div>
  `,
  styles: [`
    .transactions-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 100%;
      min-width: 0;
    }
    .header-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .filter-panel {
      padding: 16px 20px;
      min-width: 0;
    }
    .toolbar-grid {
      display: grid;
      grid-template-columns: 2fr repeat(4, minmax(0, 1fr));
      gap: 12px;
      align-items: center;
      width: 100%;
    }
    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      min-width: 0;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      font-size: 12px;
      color: #98a2b3;
    }
    .search-box input {
      width: 100%;
      border: 1px solid #e8ecf2;
      border-radius: 7px;
      padding: 9px 12px 9px 34px;
      font: 11px 'DM Sans', sans-serif;
      outline: none;
      color: #172b4d;
    }
    .search-box input:focus {
      border-color: #315fcb;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .filter-group label {
      font-size: 9px;
      font-weight: 700;
      color: #98a2b3;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .filter-group select {
      width: 100%;
      border: 1px solid #e8ecf2;
      border-radius: 7px;
      padding: 8px 10px;
      font: 11px 'DM Sans', sans-serif;
      color: #344054;
      background: #fff;
      outline: none;
    }

    .sortable {
      cursor: pointer;
      user-select: none;
    }
    .sortable:hover {
      background: #f1f4f9;
    }
    .sort-icon {
      font-size: 9px;
      margin-left: 4px;
      color: #687589;
    }

    .method-tag {
      background: #f7f9fc;
      border: 1px solid #edf0f5;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      color: #475467;
    }

    .action-btn {
      border: 1px solid #dbe5ff;
      background: #edf3ff;
      color: #315fcb;
      padding: 4px 9px;
      border-radius: 5px;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
    }
    .action-btn:hover {
      background: #dce7ff;
    }

    .clickable-row {
      cursor: pointer;
    }
    .clickable-row:hover {
      background: #f7fafd;
    }
    .empty-state {
      padding: 40px;
      text-align: center;
      color: #98a2b3;
      font-size: 12px;
    }

    .pagination-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #f1f3f6;
      flex-wrap: wrap;
      gap: 10px;
    }
    .page-meta {
      font-size: 11px;
      color: #98a2b3;
    }
    .dataset-tag {
      margin-left: 8px;
      background: #f1f3f6;
      color: #687589;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
    }

    .page-controls {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
    .page-btn {
      border: 1px solid #e8ecf2;
      background: #fff;
      color: #344054;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }
    .page-btn.num.active {
      background: #315fcb;
      border-color: #315fcb;
      color: #fff;
    }
    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    @media (max-width: 1000px) {
      .toolbar-grid {
        grid-template-columns: 1fr 1fr;
      }
      .search-box {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 540px) {
      .toolbar-grid {
        grid-template-columns: 1fr;
      }
      .header-actions {
        width: 100%;
      }
      .header-actions button {
        flex: 1 1 auto;
      }
      .pagination-footer {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class TransactionsComponent {
  private txnService = inject(TransactionService);
  private router = inject(Router);

  searchTerm = signal('');
  selectedStatus = signal('All');
  selectedType = signal('All');
  selectedMethod = signal('All');
  selectedRisk = signal('All');

  sortField = signal<keyof BankTransaction>('date');
  sortAsc = signal(false);

  currentPage = signal(1);
  pageSize = signal(8);

  transactions = this.txnService.transactions;

  filteredTransactions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.selectedStatus();
    const type = this.selectedType();
    const method = this.selectedMethod();
    const risk = this.selectedRisk();
    const field = this.sortField();
    const asc = this.sortAsc();

    let list = this.transactions().filter(t => {
      const matchSearch = [t.id, t.customer, t.senderAccount, t.receiverAccount, t.location, t.description]
        .some(v => v.toLowerCase().includes(term));
      const matchStatus = status === 'All' || t.status === status;
      const matchType = type === 'All' || t.type === type;
      const matchMethod = method === 'All' || t.paymentMethod === method;
      const matchRisk = risk === 'All' || t.riskLevel === risk;
      return matchSearch && matchStatus && matchType && matchMethod && matchRisk;
    });

    list = [...list].sort((a: any, b: any) => {
      let va = a[field];
      let vb = b[field];
      if (va instanceof Date) va = va.getTime();
      if (vb instanceof Date) vb = vb.getTime();
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();

      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return 0;
    });

    return list;
  });

  totalPages = computed(() => Math.ceil(this.filteredTransactions().length / this.pageSize()) || 1);

  totalPagesArray = computed(() => {
    const count = this.totalPages();
    return Array.from({ length: count }, (_, i) => i + 1);
  });

  pageStartIndex = computed(() => (this.currentPage() - 1) * this.pageSize());
  pageEndIndex = computed(() => Math.min(this.pageStartIndex() + this.pageSize(), this.filteredTransactions().length));

  paginatedTransactions = computed(() => {
    return this.filteredTransactions().slice(this.pageStartIndex(), this.pageEndIndex());
  });

  sort(field: keyof BankTransaction): void {
    if (this.sortField() === field) {
      this.sortAsc.update(v => !v);
    } else {
      this.sortField.set(field);
      this.sortAsc.set(true);
    }
  }

  getSortIndicator(field: keyof BankTransaction): string {
    if (this.sortField() !== field) return '↕';
    return this.sortAsc() ? '↑' : '↓';
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('All');
    this.selectedType.set('All');
    this.selectedMethod.set('All');
    this.selectedRisk.set('All');
    this.currentPage.set(1);
  }

  exportCsv(): void {
    this.txnService.exportCsv(this.filteredTransactions());
  }

  viewDetail(id: string): void {
    this.router.navigate(['/transactions', id]);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }
}

