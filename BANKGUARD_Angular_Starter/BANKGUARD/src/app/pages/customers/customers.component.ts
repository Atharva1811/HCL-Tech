import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../core/services/customer.service';
import { Customer, CustomerStatus, RiskLevel } from '../../core/models';

@Component({
  selector: 'bg-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="customers-page">
      <div class="page-heading">
        <div>
          <div class="eyebrow">RELATIONSHIP DIRECTORY</div>
          <h1>Customer Management</h1>
          <p>Maintain retail & corporate banking customer profiles, risk classifications and KYC statuses.</p>
        </div>
        <button class="primary-button" (click)="openAddModal()">+ Add New Customer</button>
      </div>

      <!-- Customer Summary Row -->
      <div class="summary-grid">
        <div class="sum-card">
          <small>Total Customers</small>
          <b>{{ customers().length }}</b>
        </div>
        <div class="sum-card">
          <small>Active Accounts</small>
          <b class="green-text">{{ activeCount() }}</b>
        </div>
        <div class="sum-card">
          <small>Under Review</small>
          <b class="amber-text">{{ underReviewCount() }}</b>
        </div>
        <div class="sum-card">
          <small>High / Critical Risk</small>
          <b class="red-text">{{ highRiskCount() }}</b>
        </div>
      </div>

      <!-- Toolbar -->
      <article class="panel filter-panel">
        <div class="toolbar-flex">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Search by customer name, ID, email, PAN or phone..." 
              [ngModel]="searchTerm()" 
              (ngModelChange)="searchTerm.set($event)"
              class="form-input">
          </div>

          <div class="select-box">
            <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)" class="form-select">
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Restricted">Restricted</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div class="select-box">
            <select [ngModel]="riskFilter()" (ngModelChange)="riskFilter.set($event)" class="form-select">
              <option value="All">All risk tiers</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </article>

      <!-- Customer Table -->
      <article class="panel">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>CUSTOMER ID</th>
                <th>FULL NAME</th>
                <th>CONTACT DETAILS</th>
                <th>PAN CARD</th>
                <th>REGISTRATION DATE</th>
                <th>ACCOUNT STATUS</th>
                <th>RISK CLASSIFICATION</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              @for (c of filteredCustomers(); track c.id) {
                <tr class="clickable-row" (click)="viewCustomer(c.id)">
                  <td class="id-cell">{{ c.id }}</td>
                  <td>
                    <b>{{ c.fullName }}</b>
                    <small class="sub-cell">{{ c.address }}</small>
                  </td>
                  <td>
                    <span>{{ c.email }}</span>
                    <small class="sub-cell">{{ c.phone }}</small>
                  </td>
                  <td><code>{{ c.panNumber }}</code></td>
                  <td>{{ c.registrationDate | date:'dd MMM yyyy' }}</td>
                  <td>
                    <span class="status" [class]="c.status.toLowerCase().replace(' ', '-')">{{ c.status }}</span>
                  </td>
                  <td>
                    <span class="risk-pill" [class]="c.riskClassification.toLowerCase()">{{ c.riskClassification }}</span>
                  </td>
                  <td (click)="$event.stopPropagation()">
                    <button class="secondary-button" (click)="viewCustomer(c.id)">View Profile →</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-state">No customers match the active filters.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </article>

      <!-- Add Customer Modal -->
      @if (showAddModal()) {
        <div class="modal-backdrop" (click)="showAddModal.set(false)">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Register New Banking Customer</h3>
              <button class="close-btn" (click)="showAddModal.set(false)">×</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Full Legal Name</label>
                <input type="text" [(ngModel)]="newCustomerName" class="form-input" placeholder="e.g. Rajesh Kumar Verma">
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" [(ngModel)]="newCustomerEmail" class="form-input" placeholder="e.g. rajesh.verma@example.in">
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" [(ngModel)]="newCustomerPhone" class="form-input" placeholder="+91 98765 00000">
              </div>
              <div class="form-group">
                <label class="form-label">PAN Number</label>
                <input type="text" [(ngModel)]="newCustomerPan" class="form-input" placeholder="ABCDE1234F">
              </div>
              <div class="form-group">
                <label class="form-label">Residential Address / City</label>
                <input type="text" [(ngModel)]="newCustomerAddress" class="form-input" placeholder="e.g. Mumbai, Maharashtra">
              </div>
            </div>
            <div class="modal-footer">
              <button class="secondary-button" (click)="showAddModal.set(false)">Cancel</button>
              <button class="primary-button" [disabled]="!newCustomerName.trim()" (click)="submitNewCustomer()">
                Create Customer Profile
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .customers-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
    .sum-card {
      background: #fff;
      border: 1px solid #e9edf3;
      border-radius: 9px;
      padding: 14px 18px;
    }
    .sum-card small {
      display: block;
      color: #98a2b3;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .sum-card b {
      display: block;
      font: 800 20px 'Manrope', sans-serif;
      color: #172b4d;
      margin-top: 4px;
    }
    .green-text { color: #168a5c !important; }
    .amber-text { color: #b78a26 !important; }
    .red-text { color: #df5a55 !important; }

    .filter-panel {
      padding: 14px 20px;
    }
    .toolbar-flex {
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
    .empty-state {
      padding: 40px;
      text-align: center;
      color: #98a2b3;
      font-size: 12px;
    }

    @media (max-width: 800px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .toolbar-flex {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CustomersComponent {
  private customerService = inject(CustomerService);
  private router = inject(Router);

  searchTerm = signal('');
  statusFilter = signal('All');
  riskFilter = signal('All');

  showAddModal = signal(false);
  newCustomerName = '';
  newCustomerEmail = '';
  newCustomerPhone = '';
  newCustomerPan = '';
  newCustomerAddress = '';

  customers = this.customerService.customers;

  activeCount = computed(() => this.customers().filter(c => c.status === 'Active').length);
  underReviewCount = computed(() => this.customers().filter(c => c.status === 'Under Review').length);
  highRiskCount = computed(() => this.customers().filter(c => c.riskClassification === 'High' || c.riskClassification === 'Critical').length);

  filteredCustomers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const stat = this.statusFilter();
    const risk = this.riskFilter();

    return this.customers().filter(c => {
      const matchSearch = [c.id, c.fullName, c.email, c.phone, c.panNumber, c.address]
        .some(v => v.toLowerCase().includes(term));
      const matchStat = stat === 'All' || c.status === stat;
      const matchRisk = risk === 'All' || c.riskClassification === risk;
      return matchSearch && matchStat && matchRisk;
    });
  });

  viewCustomer(id: string): void {
    this.router.navigate(['/customers', id]);
  }

  openAddModal(): void {
    this.newCustomerName = '';
    this.newCustomerEmail = '';
    this.newCustomerPhone = '';
    this.newCustomerPan = '';
    this.newCustomerAddress = '';
    this.showAddModal.set(true);
  }

  submitNewCustomer(): void {
    if (!this.newCustomerName.trim()) return;

    this.customerService.add({
      fullName: this.newCustomerName,
      email: this.newCustomerEmail || 'customer@demo.in',
      phone: this.newCustomerPhone || '+91 98000 00000',
      registrationDate: new Date(),
      status: 'Active',
      riskClassification: 'Low',
      accountIds: [],
      address: this.newCustomerAddress || 'Pune, IN',
      panNumber: this.newCustomerPan || 'AAAAA0000A'
    });

    this.showAddModal.set(false);
  }
}

