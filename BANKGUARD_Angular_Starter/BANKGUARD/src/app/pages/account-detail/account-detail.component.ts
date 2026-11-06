import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { AuthService } from '../../core/services/auth.service';
import { BankAccount, BankTransaction, AccountStatus } from '../../core/models';

@Component({
  selector: 'bg-account-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
  template: `
    @if (account(); as acc) {
      <div class="account-detail-page">
        <button class="back-link" (click)="goBack()">← Back to Bank Accounts</button>

        <div class="page-heading">
          <div>
            <h1>Account {{ acc.accountNumber }}</h1>
            <p>Holder: <b>{{ acc.accountHolder }}</b> (Customer: <a (click)="goToCustomer(acc.customerId)" class="link">{{ acc.customerId }}</a>)</p>
          </div>
          <div class="action-buttons">
            <span class="status" [class]="acc.status.toLowerCase().replace(' ', '-')">{{ acc.status }}</span>
            <button class="secondary-button" (click)="showStatusModal.set(true)">Manage Operational Status</button>
          </div>
        </div>

        <!-- Account Info Card -->
        <div class="cards-grid">
          <article class="panel">
            <div class="panel-heading">
              <h2>Balance & Classification</h2>
            </div>
            <dl class="data-grid">
              <dt>Simulated Balance</dt>
              <dd class="big-amount">{{ acc.balance | currency:'INR':'symbol-narrow':'1.0-0' }}</dd>
              <dt>Account Type</dt>
              <dd><b>{{ acc.accountType }} Account</b></dd>
              <dt>Account Currency</dt>
              <dd>INR (Indian Rupee)</dd>
              <dt>Interest Rate</dt>
              <dd>{{ acc.accountType === 'Savings' ? '3.50% p.a.' : 'N/A' }}</dd>
            </dl>
          </article>

          <article class="panel">
            <div class="panel-heading">
              <h2>Branch & Routing Data</h2>
            </div>
            <dl class="data-grid">
              <dt>Branch Location</dt>
              <dd>{{ acc.branch }}</dd>
              <dt>IFSC Code</dt>
              <dd><code>{{ acc.ifscCode }}</code></dd>
              <dt>Date Opened</dt>
              <dd>{{ acc.openedDate | date:'fullDate' }}</dd>
              <dt>MICR Code</dt>
              <dd>411229002</dd>
            </dl>
          </article>
        </div>

        <!-- Associated Transactions -->
        <article class="panel">
          <div class="panel-heading">
            <h2>Account Transaction Ledger ({{ linkedTransactions().length }})</h2>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>TRANSACTION ID</th>
                  <th>TYPE</th>
                  <th>AMOUNT</th>
                  <th>DATE & TIME</th>
                  <th>CHANNEL</th>
                  <th>STATUS</th>
                  <th>RISK</th>
                </tr>
              </thead>
              <tbody>
                @for (t of linkedTransactions(); track t.id) {
                  <tr class="clickable-row" (click)="goToTxn(t.id)">
                    <td class="id-cell">{{ t.id }}</td>
                    <td>{{ t.type }}</td>
                    <td class="amount">{{ t.amount | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                    <td>{{ t.date | date:'dd MMM yyyy, hh:mm a' }}</td>
                    <td>{{ t.paymentMethod }}</td>
                    <td><span class="status" [class]="t.status.toLowerCase().replace(' ', '-')">{{ t.status }}</span></td>
                    <td><span class="risk-dot" [class]="t.riskLevel.toLowerCase()"></span>{{ t.riskScore }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="empty-state">No transaction records linked directly to this account number.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </article>

        <!-- Status Management Modal -->
        @if (showStatusModal()) {
          <div class="modal-backdrop" (click)="showStatusModal.set(false)">
            <div class="modal-box" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3>Change Account Operational Status</h3>
                <button class="close-btn" (click)="showStatusModal.set(false)">×</button>
              </div>
              <div class="modal-body">
                <p>Select new operational state for account <b>{{ acc.accountNumber }}</b>:</p>
                <div class="form-group" style="margin-top: 12px;">
                  <label class="form-label">Status</label>
                  <select [(ngModel)]="newStatusChoice" class="form-select">
                    <option value="Active">Active (Unrestricted)</option>
                    <option value="Under Review">Under Review (Monitoring active)</option>
                    <option value="Restricted">Restricted (Inbound credits only)</option>
                    <option value="Suspended">Suspended (Complete debit/credit block)</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button class="secondary-button" (click)="showStatusModal.set(false)">Cancel</button>
                <button class="primary-button" (click)="confirmStatusChange(acc.id)">Apply Status Change</button>
              </div>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="panel empty-box">
        <h2>Bank account record not found</h2>
        <button class="primary-button" (click)="goBack()">Return to accounts</button>
      </div>
    }
  `,
  styles: [`
    .account-detail-page {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .back-link {
      background: none;
      border: none;
      color: #315fcb;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      align-self: flex-start;
    }
    .link {
      color: #315fcb;
      cursor: pointer;
      text-decoration: underline;
    }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .data-grid {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 12px;
      margin: 0;
      font-size: 11px;
    }
    .data-grid dt {
      color: #98a2b3;
    }
    .data-grid dd {
      color: #344054;
      font-weight: 600;
      margin: 0;
      word-break: break-word;
    }
    .big-amount {
      font-size: 18px !important;
      font-weight: 800 !important;
      color: #172b4d !important;
    }

    .clickable-row {
      cursor: pointer;
    }
    .clickable-row:hover {
      background: #f8fafd;
    }
    .empty-state {
      padding: 30px;
      text-align: center;
      color: #98a2b3;
      font-size: 11px;
    }
    .empty-box {
      text-align: center;
      padding: 60px 20px;
    }

    @media (max-width: 800px) {
      .cards-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .data-grid {
        grid-template-columns: 1fr;
        gap: 4px;
      }
      .data-grid dt {
        margin-top: 6px;
      }
      .action-buttons {
        width: 100%;
      }
      .action-buttons button {
        width: 100%;
      }
    }
  `]
})
export class AccountDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountService = inject(AccountService);
  private txnService = inject(TransactionService);
  private auditService = inject(AuditLogService);
  private authService = inject(AuthService);

  account = signal<BankAccount | null>(null);
  linkedTransactions = signal<BankTransaction[]>([]);
  showStatusModal = signal(false);
  newStatusChoice: AccountStatus = 'Active';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const found = this.accountService.getById(id);
        if (found) {
          this.account.set(found);
          this.newStatusChoice = found.status;
          this.linkedTransactions.set(this.txnService.getByAccount(found.accountNumber));
        }
      }
    });
  }

  confirmStatusChange(id: string): void {
    this.accountService.updateStatus(id, this.newStatusChoice);
    const updated = this.accountService.getById(id);
    if (updated) this.account.set(updated);

    this.auditService.log({
      userId: this.authService.user()?.id || 'USR-001',
      userName: this.authService.user()?.fullName || 'Admin',
      action: 'ACCOUNT_STATUS_CHANGE',
      target: 'BankAccount',
      targetId: id,
      details: `Updated account status to ${this.newStatusChoice}`
    });

    this.showStatusModal.set(false);
  }

  goBack(): void {
    this.router.navigate(['/accounts']);
  }

  goToCustomer(customerId: string): void {
    this.router.navigate(['/customers', customerId]);
  }

  goToTxn(txnId: string): void {
    this.router.navigate(['/transactions', txnId]);
  }
}

