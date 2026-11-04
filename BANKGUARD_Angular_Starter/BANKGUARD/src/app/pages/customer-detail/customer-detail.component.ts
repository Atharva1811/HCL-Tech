import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { AlertService } from '../../core/services/alert.service';
import { Customer, BankAccount, BankTransaction, FraudAlert, CustomerStatus, RiskLevel } from '../../core/models';

@Component({
  selector: 'bg-customer-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
  template: `
    @if (customer(); as c) {
      <div class="customer-profile-page">
        <!-- Top Nav -->
        <button class="back-link" (click)="goBack()">← Back to Customer Directory</button>

        <div class="page-heading">
          <div class="title-wrap">
            <h1>{{ c.fullName }}</h1>
            <span class="status" [class]="c.status.toLowerCase().replace(' ', '-')">{{ c.status }}</span>
            <span class="risk-pill" [class]="c.riskClassification.toLowerCase()">{{ c.riskClassification }} Risk</span>
          </div>

          <div class="action-buttons">
            <button class="secondary-button" (click)="toggleEdit()">
              {{ isEditing() ? 'Cancel Editing' : 'Edit Customer' }}
            </button>
            <button class="danger-button" (click)="openStatusDialog()">Change KYC / Account Status</button>
          </div>
        </div>

        <!-- Customer Identity Info Card -->
        <article class="panel">
          <div class="panel-heading">
            <h2>KYC & Account Dossier</h2>
            <small>Customer ID: {{ c.id }}</small>
          </div>

          @if (isEditing()) {
            <div class="edit-grid">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" [(ngModel)]="editName" class="form-input">
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" [(ngModel)]="editEmail" class="form-input">
              </div>
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input type="tel" [(ngModel)]="editPhone" class="form-input">
              </div>
              <div class="form-group">
                <label class="form-label">Residential Address</label>
                <input type="text" [(ngModel)]="editAddress" class="form-input">
              </div>
              <div class="form-group">
                <label class="form-label">Risk Classification</label>
                <select [(ngModel)]="editRisk" class="form-select">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            <div class="edit-footer">
              <button class="primary-button" (click)="saveCustomerChanges(c.id)">Save Changes</button>
            </div>
          } @else {
            <dl class="profile-details-grid">
              <dt>Email Address</dt>
              <dd>{{ c.email }}</dd>
              <dt>Registered Phone</dt>
              <dd>{{ c.phone }}</dd>
              <dt>Permanent Address</dt>
              <dd>{{ c.address }}</dd>
              <dt>Tax PAN ID</dt>
              <dd><code>{{ c.panNumber }}</code></dd>
              <dt>Onboarding Date</dt>
              <dd>{{ c.registrationDate | date:'fullDate' }}</dd>
            </dl>
          }
        </article>

        <!-- Linked Bank Accounts -->
        <article class="panel">
          <div class="panel-heading">
            <h2>Linked Bank Accounts ({{ accounts().length }})</h2>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ACCOUNT NUMBER</th>
                  <th>ACCOUNT TYPE</th>
                  <th>SIMULATED BALANCE</th>
                  <th>BRANCH</th>
                  <th>IFSC CODE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                @for (acc of accounts(); track acc.id) {
                  <tr>
                    <td class="id-cell">{{ acc.accountNumber }}</td>
                    <td>{{ acc.accountType }}</td>
                    <td class="amount">{{ acc.balance | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                    <td>{{ acc.branch }}</td>
                    <td><code>{{ acc.ifscCode }}</code></td>
                    <td>
                      <span class="status" [class]="acc.status.toLowerCase().replace(' ', '-')">{{ acc.status }}</span>
                    </td>
                    <td>
                      <button class="secondary-button" (click)="goToAccount(acc.id)">View Ledger →</button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="empty-state">No active accounts mapped to customer profile.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </article>

        <!-- Transaction History Filtered for Customer -->
        <article class="panel">
          <div class="panel-heading">
            <h2>Historical Transaction Activity ({{ transactions().length }})</h2>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>TXN ID</th>
                  <th>TYPE</th>
                  <th>AMOUNT</th>
                  <th>DATE & TIME</th>
                  <th>PAYMENT METHOD</th>
                  <th>LOCATION</th>
                  <th>STATUS</th>
                  <th>RISK</th>
                </tr>
              </thead>
              <tbody>
                @for (t of transactions(); track t.id) {
                  <tr class="clickable-row" (click)="goToTxn(t.id)">
                    <td class="id-cell">{{ t.id }}</td>
                    <td>{{ t.type }}</td>
                    <td class="amount">{{ t.amount | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                    <td>{{ t.date | date:'dd MMM yyyy, hh:mm a' }}</td>
                    <td><span class="method-tag">{{ t.paymentMethod }}</span></td>
                    <td>{{ t.location }}</td>
                    <td><span class="status" [class]="t.status.toLowerCase().replace(' ', '-')">{{ t.status }}</span></td>
                    <td><span class="risk-dot" [class]="t.riskLevel.toLowerCase()"></span>{{ t.riskScore }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="empty-state">No transactions recorded for this customer.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </article>

        <!-- Status Dialog Modal -->
        @if (showStatusModal()) {
          <div class="modal-backdrop" (click)="showStatusModal.set(false)">
            <div class="modal-box" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3>Update Customer KYC & Operational Status</h3>
                <button class="close-btn" (click)="showStatusModal.set(false)">×</button>
              </div>
              <div class="modal-body">
                <p>Modify customer status for <b>{{ c.fullName }}</b>:</p>
                <div class="form-group" style="margin-top: 12px;">
                  <label class="form-label">New Status</label>
                  <select [(ngModel)]="newStatusChoice" class="form-select">
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Restricted">Restricted (Freeze outgoing funds)</option>
                    <option value="Suspended">Suspended (Complete regulatory freeze)</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button class="secondary-button" (click)="showStatusModal.set(false)">Cancel</button>
                <button class="primary-button" (click)="confirmStatusChange(c.id)">Update Status</button>
              </div>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="panel empty-box">
        <h2>Customer record not found</h2>
        <button class="primary-button" (click)="goBack()">Return to customers</button>
      </div>
    }
  `,
  styles: [`
    .customer-profile-page {
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
    .title-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .action-buttons {
      display: flex;
      gap: 10px;
    }

    .profile-details-grid {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 12px;
      margin: 0;
      font-size: 11px;
    }
    .profile-details-grid dt {
      color: #98a2b3;
    }
    .profile-details-grid dd {
      color: #172b4d;
      font-weight: 600;
      margin: 0;
    }

    .edit-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .edit-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 14px;
    }

    .clickable-row {
      cursor: pointer;
    }
    .clickable-row:hover {
      background: #f8fafd;
    }
    .method-tag {
      background: #f1f3f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
    }
    .empty-state {
      padding: 25px;
      text-align: center;
      color: #98a2b3;
      font-size: 11px;
    }
    .empty-box {
      text-align: center;
      padding: 60px 20px;
    }
  `]
})
export class CustomerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customerService = inject(CustomerService);
  private accountService = inject(AccountService);
  private txnService = inject(TransactionService);

  customer = signal<Customer | null>(null);
  accounts = signal<BankAccount[]>([]);
  transactions = signal<BankTransaction[]>([]);

  isEditing = signal(false);
  editName = '';
  editEmail = '';
  editPhone = '';
  editAddress = '';
  editRisk: RiskLevel = 'Low';

  showStatusModal = signal(false);
  newStatusChoice: CustomerStatus = 'Active';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const c = this.customerService.getById(id);
        if (c) {
          this.customer.set(c);
          this.editName = c.fullName;
          this.editEmail = c.email;
          this.editPhone = c.phone;
          this.editAddress = c.address;
          this.editRisk = c.riskClassification;

          this.accounts.set(this.accountService.getByCustomerId(c.id));
          this.transactions.set(this.txnService.getByCustomerId(c.id));
        }
      }
    });
  }

  toggleEdit(): void {
    this.isEditing.update(v => !v);
  }

  saveCustomerChanges(id: string): void {
    this.customerService.update(id, {
      fullName: this.editName,
      email: this.editEmail,
      phone: this.editPhone,
      address: this.editAddress,
      riskClassification: this.editRisk
    });
    const updated = this.customerService.getById(id);
    if (updated) this.customer.set(updated);
    this.isEditing.set(false);
  }

  openStatusDialog(): void {
    if (this.customer()) {
      this.newStatusChoice = this.customer()!.status;
      this.showStatusModal.set(true);
    }
  }

  confirmStatusChange(id: string): void {
    this.customerService.updateStatus(id, this.newStatusChoice);
    const updated = this.customerService.getById(id);
    if (updated) this.customer.set(updated);
    this.showStatusModal.set(false);
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }

  goToAccount(accId: string): void {
    this.router.navigate(['/accounts', accId]);
  }

  goToTxn(txnId: string): void {
    this.router.navigate(['/transactions', txnId]);
  }
}

