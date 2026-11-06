import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../core/services/transaction.service';
import { AlertService } from '../../core/services/alert.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { AuthService } from '../../core/services/auth.service';
import { BankTransaction, FraudAlert, TransactionStatus } from '../../core/models';

@Component({
  selector: 'bg-transaction-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
  template: `
    @if (transaction(); as t) {
      <div class="detail-page">
        <!-- Header -->
        <div class="page-heading">
          <div class="heading-left">
            <button class="back-link" (click)="goBack()">← Back to transactions</button>
            <div class="title-with-badge">
              <h1>Transaction {{ t.id }}</h1>
              <span class="status" [class]="getStatusClass(t.status)">{{ t.status }}</span>
              <span class="risk-pill" [class]="t.riskLevel.toLowerCase()">{{ t.riskLevel }} Risk ({{ t.riskScore }}/100)</span>
            </div>
            <p>Executed on {{ t.date | date:'fullDate' }} at {{ t.date | date:'mediumTime' }}</p>
          </div>

          <div class="heading-actions">
            @if (canUpdateTransaction()) {
              <button class="secondary-button" (click)="openStatusDialog('Under Review')">Mark Under Review</button>
              <button class="danger-button" (click)="openStatusDialog('Blocked')">Block Transaction</button>
              <button class="primary-button" (click)="openStatusDialog('Completed')">Approve / Complete</button>
            } @else {
              <span class="read-only-badge">🔒 Read-Only Record</span>
            }
          </div>
        </div>

        <!-- 3-Column Info Overview -->
        <div class="cards-grid">
          <!-- Overview Card -->
          <article class="panel">
            <div class="panel-heading">
              <h2>Payment Information</h2>
            </div>
            <dl class="data-list">
              <dt>Amount</dt>
              <dd class="big-amount">{{ t.amount | currency:'INR':'symbol-narrow':'1.0-0' }}</dd>
              <dt>Payment Method</dt>
              <dd><span class="tag">{{ t.paymentMethod }}</span></dd>
              <dt>Transaction Type</dt>
              <dd>{{ t.type }}</dd>
              <dt>Location</dt>
              <dd>{{ t.location }}</dd>
              <dt>Description</dt>
              <dd>{{ t.description }}</dd>
            </dl>
          </article>

          <!-- Accounts & Parties -->
          <article class="panel">
            <div class="panel-heading">
              <h2>Sender & Recipient</h2>
            </div>
            <dl class="data-list">
              <dt>Customer Name</dt>
              <dd><b>{{ t.customer }}</b></dd>
              <dt>Customer ID</dt>
              <dd><a (click)="goToCustomer(t.customerId)" class="link">{{ t.customerId }} →</a></dd>
              <dt>Originating Account</dt>
              <dd>{{ t.senderAccount }}</dd>
              <dt>Beneficiary Account</dt>
              <dd>{{ t.receiverAccount }}</dd>
              <dt>Channel</dt>
              <dd>Core Banking Switch</dd>
            </dl>
          </article>

          <!-- Fraud Risk Score Gauge -->
          <article class="panel">
            <div class="panel-heading">
              <h2>Fraud Engine Assessment</h2>
            </div>
            <div class="gauge-box">
              <div class="gauge-score" [class]="t.riskLevel.toLowerCase()">
                <span>{{ t.riskScore }}</span>
                <small>/ 100</small>
              </div>
              <div class="gauge-meta">
                <b>{{ t.riskLevel }} Risk Classification</b>
                <p>Calculated by explainable multi-rule fraud score model.</p>
              </div>
            </div>

            <div class="triggered-rules-box">
              <b>Triggered Detection Rules:</b>
              @if (t.triggeredRules.length > 0) {
                <ul>
                  @for (rule of t.triggeredRules; track rule) {
                    <li>
                      <span class="rule-bullet">⚠</span>
                      <span>{{ rule }}</span>
                    </li>
                  }
                </ul>
              } @else {
                <div class="clean-rule">✓ No abnormal rule violations detected.</div>
              }
            </div>
          </article>
        </div>

        <!-- Transaction Timeline -->
        <article class="panel">
          <div class="panel-heading">
            <h2>Transaction Lifecycle Timeline</h2>
            <p>Cryptographically verifiable operation logs</p>
          </div>
          <div class="timeline">
            <div class="timeline-step done">
              <div class="step-dot">1</div>
              <div class="step-content">
                <b>Transaction Initiated</b>
                <p>Initiated by customer via {{ t.paymentMethod }} from {{ t.location }}</p>
                <small>{{ t.date | date:'hh:mm:ss a' }}</small>
              </div>
            </div>

            <div class="timeline-step done">
              <div class="step-dot">2</div>
              <div class="step-content">
                <b>Rule-Based Fraud Scoring</b>
                <p>Scored {{ t.riskScore }}/100. Rules triggered: {{ t.triggeredRules.join(', ') || 'None' }}</p>
                <small>{{ t.date | date:'hh:mm:ss a' }}</small>
              </div>
            </div>

            <div class="timeline-step" [class.done]="t.status === 'Completed'" [class.alert]="t.status === 'Under Review' || t.status === 'Blocked'">
              <div class="step-dot">3</div>
              <div class="step-content">
                <b>Current Status: {{ t.status }}</b>
                <p>
                  @if (t.status === 'Completed') {
                    Funds settled successfully to beneficiary account.
                  } @else if (t.status === 'Blocked') {
                    Transaction auto-blocked by risk firewall.
                  } @else if (t.status === 'Under Review') {
                    Pending compliance analyst review.
                  } @else {
                    Transaction execution resulted in {{ t.status }}.
                  }
                </p>
              </div>
            </div>
          </div>
        </article>

        <!-- Linked Fraud Alerts -->
        @if (linkedAlerts().length > 0) {
          <article class="panel alert-banner-panel">
            <div class="panel-heading">
              <h2>Associated Security & Fraud Alerts</h2>
            </div>
            @for (alert of linkedAlerts(); track alert.id) {
              <div class="alert-item">
                <span class="alert-icon">⚠</span>
                <div class="alert-body">
                  <b>{{ alert.id }} — {{ alert.riskLevel }} Severity Alert</b>
                  <p>{{ alert.explanation }}</p>
                  <small>Detected at {{ alert.detectedAt | date:'medium' }} · Status: {{ alert.status }}</small>
                </div>
                <button class="primary-button" (click)="goTo('/fraud-monitoring')">Investigate Alert →</button>
              </div>
            }
          </article>
        }

        <!-- Status Change Confirmation Modal -->
        @if (confirmDialogState(); as dialog) {
          <div class="modal-backdrop" (click)="closeDialog()">
            <div class="modal-box" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3>Confirm Administrative Action</h3>
                <button class="close-btn" (click)="closeDialog()">×</button>
              </div>
              <div class="modal-body">
                <p>Are you sure you want to change transaction <b>{{ t.id }}</b> status to <b class="new-status">{{ dialog.newStatus }}</b>?</p>
                <p class="warning-text">This will generate a persistent audit log entry and may trigger compliance notifications.</p>
                
                <div class="form-group" style="margin-top: 14px;">
                  <label class="form-label">Justification / Reason</label>
                  <textarea [(ngModel)]="actionReason" rows="3" class="form-textarea" placeholder="Provide an explanation for this administrative decision..."></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button class="secondary-button" (click)="closeDialog()">Cancel</button>
                <button class="primary-button" (click)="applyStatusChange(t.id, dialog.newStatus)">Confirm & Apply</button>
              </div>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="panel empty-box">
        <h2>Transaction not found</h2>
        <p>The transaction ID provided does not exist in the ledger.</p>
        <button class="primary-button" (click)="goBack()">Return to transactions</button>
      </div>
    }
  `,
  styles: [`
    .detail-page {
      display: flex;
      flex-direction: column;
      gap: 18px;
      max-width: 100%;
      min-width: 0;
    }
    .back-link {
      background: none;
      border: none;
      color: #315fcb;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      margin-bottom: 6px;
    }
    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .heading-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .read-only-badge {
      background: #f1f3f6;
      color: #687589;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      width: 100%;
    }

    .data-list {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 10px;
      margin: 0;
      font-size: 11px;
      word-break: break-word;
    }
    .data-list dt {
      color: #98a2b3;
    }
    .data-list dd {
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
    .tag {
      background: #f1f3f6;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      display: inline-block;
    }
    .link {
      color: #315fcb;
      cursor: pointer;
      text-decoration: underline;
    }

    .gauge-box {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px;
      background: #fafbfd;
      border-radius: 8px;
      border: 1px solid #f0f2f5;
      flex-wrap: wrap;
    }
    .gauge-score {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 18px;
      border: 3px solid;
      flex-shrink: 0;
    }
    .gauge-score.low { border-color: #168a5c; color: #168a5c; background: #e9f8f0; }
    .gauge-score.medium { border-color: #d4a63e; color: #b78a26; background: #fff8e8; }
    .gauge-score.high { border-color: #e28a43; color: #d98136; background: #fff3e8; }
    .gauge-score.critical { border-color: #df5a55; color: #d95b56; background: #fff0ef; }
    .gauge-score small {
      font-size: 8px;
      font-weight: 600;
      margin-top: -3px;
    }

    .gauge-meta b {
      display: block;
      font-size: 12px;
      color: #172b4d;
    }
    .gauge-meta p {
      font-size: 10px;
      color: #98a2b3;
      margin: 2px 0 0;
    }

    .triggered-rules-box {
      margin-top: 14px;
      font-size: 11px;
    }
    .triggered-rules-box b {
      display: block;
      color: #687589;
      margin-bottom: 6px;
    }
    .triggered-rules-box ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .triggered-rules-box li {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #d95b56;
      background: #fff0ef;
      padding: 5px 8px;
      border-radius: 5px;
      font-size: 10px;
      font-weight: 600;
      overflow-wrap: anywhere;
    }
    .clean-rule {
      color: #168a5c;
      background: #e9f8f0;
      padding: 6px 10px;
      border-radius: 6px;
      font-weight: 600;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
      margin-top: 14px;
      padding-left: 20px;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 10px;
      top: 10px;
      bottom: 10px;
      width: 2px;
      background: #e9edf3;
    }
    .timeline-step {
      display: flex;
      gap: 14px;
      position: relative;
    }
    .step-dot {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid #c4cbd5;
      color: #687589;
      display: grid;
      place-items: center;
      font-size: 10px;
      font-weight: 700;
      position: relative;
      z-index: 1;
      margin-left: -21px;
      flex-shrink: 0;
    }
    .timeline-step.done .step-dot {
      border-color: #315fcb;
      background: #315fcb;
      color: #fff;
    }
    .timeline-step.alert .step-dot {
      border-color: #df5a55;
      background: #df5a55;
      color: #fff;
    }
    .step-content {
      min-width: 0;
      flex: 1;
    }
    .step-content b {
      display: block;
      font-size: 12px;
      color: #172b4d;
    }
    .step-content p {
      font-size: 11px;
      color: #687589;
      margin: 2px 0 3px;
      overflow-wrap: break-word;
    }
    .step-content small {
      font-size: 9px;
      color: #a1aab8;
    }

    .alert-banner-panel {
      border-left: 4px solid #df5a55;
    }
    .alert-item {
      display: flex;
      align-items: center;
      gap: 14px;
      background: #fff8f8;
      border: 1px solid #ffe8e8;
      border-radius: 8px;
      padding: 14px 18px;
      flex-wrap: wrap;
    }
    .alert-icon {
      font-size: 20px;
      color: #df5a55;
      flex-shrink: 0;
    }
    .alert-body {
      flex: 1;
      min-width: 0;
    }
    .alert-body b {
      display: block;
      font-size: 12px;
      color: #d95b56;
    }
    .alert-body p {
      font-size: 11px;
      color: #687589;
      margin: 2px 0 3px;
      overflow-wrap: break-word;
    }
    .alert-body small {
      font-size: 9px;
      color: #a1aab8;
    }

    .warning-text {
      font-size: 11px;
      color: #b78a26;
      background: #fffdf5;
      border: 1px solid #fef0c7;
      padding: 8px 12px;
      border-radius: 6px;
      margin-top: 8px;
    }
    .new-status {
      color: #315fcb;
    }
    .empty-box {
      text-align: center;
      padding: 60px 20px;
    }

    @media (max-width: 992px) {
      .read-only-badge {
      background: #f1f3f6;
      color: #687589;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
    }
    .cards-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .data-list {
        grid-template-columns: 1fr;
        gap: 4px;
      }
      .data-list dt {
        margin-top: 6px;
      }
      .heading-actions {
        width: 100%;
      }
      .heading-actions button {
        width: 100%;
      }
      .alert-item {
        flex-direction: column;
        align-items: flex-start;
      }
      .alert-item button {
        width: 100%;
      }
    }
  `]
})
export class TransactionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private txnService = inject(TransactionService);
  private alertService = inject(AlertService);
  private auditService = inject(AuditLogService);
  private authService = inject(AuthService);

  transaction = signal<BankTransaction | null>(null);
  linkedAlerts = signal<FraudAlert[]>([]);
  confirmDialogState = signal<{ newStatus: TransactionStatus } | null>(null);
  actionReason = 'Reviewed by compliance team';

  canUpdateTransaction = computed(() => this.authService.hasPermission('transactions.update_status'));

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const found = this.txnService.getById(id);
        if (found) {
          this.transaction.set(found);
          this.linkedAlerts.set(this.alertService.getByTransactionId(found.id));
        }
      }
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  goBack(): void {
    this.router.navigate(['/transactions']);
  }

  goToCustomer(customerId: string): void {
    this.router.navigate(['/customers', customerId]);
  }

  goTo(route: string): void {
    this.router.navigate([route]);
  }

  openStatusDialog(newStatus: TransactionStatus): void {
    this.confirmDialogState.set({ newStatus });
  }

  closeDialog(): void {
    this.confirmDialogState.set(null);
  }

  applyStatusChange(id: string, newStatus: TransactionStatus): void {
    this.txnService.updateStatus(id, newStatus);
    const updated = this.txnService.getById(id);
    if (updated) this.transaction.set(updated);

    this.auditService.log({
      userId: this.authService.user()?.id || 'USR-001',
      userName: this.authService.user()?.fullName || 'Admin',
      action: 'TRANSACTION_STATUS_CHANGE',
      target: 'Transaction',
      targetId: id,
      details: `Changed status to ${newStatus}. Reason: ${this.actionReason}`
    });

    this.closeDialog();
  }
}

