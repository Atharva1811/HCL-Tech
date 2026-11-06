import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { FraudAlert, AlertCategory, AlertStatus } from '../../core/models';

@Component({
  selector: 'bg-fraud-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="alerts-page">
      <div class="page-heading">
        <div>
          <div class="eyebrow">RISK & THREAT MANAGEMENT</div>
          <h1>Fraud Alerts Ledger</h1>
          <p>Comprehensive incident inventory, category breakdown and investigation histories.</p>
        </div>
        <button class="primary-button" (click)="goToMonitoring()">Open Live Console →</button>
      </div>

      <!-- Category Statistics Strip -->
      <div class="category-strip">
        <div class="category-card critical">
          <div class="strip-count">{{ criticalCount() }}</div>
          <div class="strip-label">Critical Severity</div>
          <small>Immediate freeze required</small>
        </div>
        <div class="category-card high">
          <div class="strip-count">{{ highCount() }}</div>
          <div class="strip-label">High Severity</div>
          <small>Flagged for same-day review</small>
        </div>
        <div class="category-card medium">
          <div class="strip-count">{{ mediumCount() }}</div>
          <div class="strip-label">Medium Severity</div>
          <small>Behavioral anomalies</small>
        </div>
        <div class="category-card low">
          <div class="strip-count">{{ lowCount() }}</div>
          <div class="strip-label">Low Severity</div>
          <small>Monitored events</small>
        </div>
      </div>

      <!-- Filters & Search -->
      <article class="panel filter-panel">
        <div class="filter-row">
          <div class="search-wrap">
            <input 
              type="text" 
              placeholder="Search alert ID, customer, transaction ID or trigger explanation..." 
              [ngModel]="searchTerm()" 
              (ngModelChange)="searchTerm.set($event)"
              class="form-input">
          </div>

          <div class="select-wrap">
            <select [ngModel]="categoryFilter()" (ngModelChange)="categoryFilter.set($event)" class="form-select">
              <option value="All">All Categories</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div class="select-wrap">
            <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)" class="form-select">
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
              <option value="Dismissed">Dismissed</option>
            </select>
          </div>
        </div>
      </article>

      <!-- Alerts Master Table -->
      <article class="panel">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ALERT ID</th>
                <th>CUSTOMER</th>
                <th>TRANSACTION</th>
                <th>AMOUNT</th>
                <th>CATEGORY</th>
                <th>RISK SCORE</th>
                <th>TRIGGERED RULES</th>
                <th>DETECTED AT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              @for (a of paginatedAlerts(); track a.id) {
                <tr class="alert-table-row" (click)="toggleExpand(a.id)">
                  <td class="id-cell">{{ a.id }}</td>
                  <td>
                    <b>{{ a.customer }}</b>
                    <small class="sub-cell">ID: {{ a.customerId }}</small>
                  </td>
                  <td>
                    <span class="txn-link" (click)="goToTxn(a.transactionId, $event)">{{ a.transactionId }} ↗</span>
                  </td>
                  <td class="amount">{{ a.amount | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                  <td>
                    <span class="risk-pill" [class]="a.category.toLowerCase()">{{ a.category }}</span>
                  </td>
                  <td>
                    <span class="risk-dot" [class]="a.riskLevel.toLowerCase()"></span>
                    <b>{{ a.riskScore }}</b>
                  </td>
                  <td>
                    <div class="rule-chips">
                      @for (r of a.triggeredRules; track r) {
                        <span class="rule-chip">{{ r }}</span>
                      }
                    </div>
                  </td>
                  <td>{{ a.detectedAt | date:'dd MMM yyyy, hh:mm a' }}</td>
                  <td>
                    <span class="status" [class]="a.status.toLowerCase()">{{ a.status }}</span>
                  </td>
                  <td>
                    <button class="secondary-button" (click)="goToInvestigation(a.id, $event)">Investigate →</button>
                  </td>
                </tr>

                <!-- Expanded Details Drawer -->
                @if (expandedAlertId() === a.id) {
                  <tr class="expanded-drawer">
                    <td colspan="10">
                      <div class="drawer-content">
                        <div class="drawer-item">
                          <b>Detection Explanation:</b>
                          <p>{{ a.explanation }}</p>
                        </div>
                        <div class="drawer-item">
                          <b>Assigned Investigator:</b>
                          <span>{{ a.assignedTo || 'Unassigned' }}</span>
                        </div>
                        @if (a.investigationNotes.length > 0) {
                          <div class="drawer-item">
                            <b>Notes ({{ a.investigationNotes.length }}):</b>
                            <div class="drawer-notes">
                              @for (n of a.investigationNotes; track n.id) {
                                <div><b>{{ n.author }}</b>: {{ n.content }} <small>({{ n.timestamp | date:'short' }})</small></div>
                              }
                            </div>
                          </div>
                        }
                      </div>
                    </td>
                  </tr>
                }
              } @empty {
                <tr>
                  <td colspan="10" class="empty-state">No fraud alerts matching filter criteria.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-footer">
          <div class="page-meta">
            Showing {{ pageStart() + 1 }} to {{ pageEnd() }} of {{ filteredAlerts().length }} alerts
          </div>
          <div class="page-controls">
            <button class="secondary-button" [disabled]="currentPage() === 1" (click)="setPage(currentPage() - 1)">‹ Prev</button>
            <span class="page-current">Page {{ currentPage() }} of {{ totalPages() }}</span>
            <button class="secondary-button" [disabled]="currentPage() === totalPages()" (click)="setPage(currentPage() + 1)">Next ›</button>
          </div>
        </div>
      </article>
    </div>
  `,
  styles: [`
    .alerts-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .category-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
    .category-card {
      background: #fff;
      border: 1px solid #e9edf3;
      border-radius: 10px;
      padding: 16px 20px;
      box-shadow: 0 2px 7px rgba(23, 43, 77, 0.04);
      border-top: 3px solid;
    }
    .category-card.critical { border-top-color: #df5a55; }
    .category-card.high { border-top-color: #e28a43; }
    .category-card.medium { border-top-color: #d4a63e; }
    .category-card.low { border-top-color: #24a572; }

    .strip-count {
      font: 800 24px 'Manrope', sans-serif;
      color: #172b4d;
    }
    .strip-label {
      font-size: 11px;
      font-weight: 700;
      color: #344054;
      margin-top: 2px;
    }
    .category-card small {
      font-size: 9px;
      color: #98a2b3;
    }

    .filter-panel {
      padding: 14px 20px;
    }
    .filter-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 12px;
    }

    .rule-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      max-width: 240px;
    }
    .rule-chip {
      background: #f1f3f6;
      color: #475467;
      font-size: 9px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .txn-link {
      color: #315fcb;
      cursor: pointer;
      font-weight: 600;
    }
    .txn-link:hover {
      text-decoration: underline;
    }

    .alert-table-row {
      cursor: pointer;
    }
    .expanded-drawer td {
      background: #fafcff;
      border-bottom: 2px solid #e9edf3;
      padding: 16px 24px;
    }
    .drawer-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
      font-size: 11px;
    }
    .drawer-item b {
      color: #172b4d;
      margin-right: 6px;
    }
    .drawer-item p {
      margin: 4px 0 0;
      color: #687589;
      line-height: 1.5;
    }
    .drawer-notes {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 4px;
      padding-left: 10px;
      border-left: 2px solid #315fcb;
    }

    .pagination-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
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
    .page-controls {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .page-current {
      font-size: 11px;
      color: #344054;
      font-weight: 600;
    }

    .empty-state {
      padding: 40px;
      text-align: center;
      color: #98a2b3;
      font-size: 12px;
    }

    @media (max-width: 900px) {
      .category-strip {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .filter-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 520px) {
      .category-strip {
        grid-template-columns: minmax(0, 1fr);
      }
      .pagination-footer {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class FraudAlertsComponent {
  private alertService = inject(AlertService);
  private router = inject(Router);

  searchTerm = signal('');
  categoryFilter = signal('All');
  statusFilter = signal('All');
  expandedAlertId = signal<string | null>(null);

  currentPage = signal(1);
  pageSize = signal(8);

  alerts = this.alertService.alerts;

  criticalCount = computed(() => this.alerts().filter(a => a.category === 'Critical').length);
  highCount = computed(() => this.alerts().filter(a => a.category === 'High').length);
  mediumCount = computed(() => this.alerts().filter(a => a.category === 'Medium').length);
  lowCount = computed(() => this.alerts().filter(a => a.category === 'Low').length);

  filteredAlerts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const cat = this.categoryFilter();
    const stat = this.statusFilter();

    return this.alerts().filter(a => {
      const matchSearch = [a.id, a.customer, a.transactionId, a.explanation, a.assignedTo]
        .some(v => v.toLowerCase().includes(term));
      const matchCat = cat === 'All' || a.category === cat;
      const matchStat = stat === 'All' || a.status === stat;
      return matchSearch && matchCat && matchStat;
    });
  });

  totalPages = computed(() => Math.ceil(this.filteredAlerts().length / this.pageSize()) || 1);
  pageStart = computed(() => (this.currentPage() - 1) * this.pageSize());
  pageEnd = computed(() => Math.min(this.pageStart() + this.pageSize(), this.filteredAlerts().length));

  paginatedAlerts = computed(() => {
    return this.filteredAlerts().slice(this.pageStart(), this.pageEnd());
  });

  toggleExpand(id: string): void {
    this.expandedAlertId.update(cur => cur === id ? null : id);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  goToTxn(txnId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/transactions', txnId]);
  }

  goToInvestigation(alertId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/fraud-monitoring']);
  }

  goToMonitoring(): void {
    this.router.navigate(['/fraud-monitoring']);
  }
}

