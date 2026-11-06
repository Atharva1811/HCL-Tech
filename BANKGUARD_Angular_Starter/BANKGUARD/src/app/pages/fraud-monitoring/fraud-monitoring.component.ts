import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { FraudAlert, AlertStatus, RiskLevel } from '../../core/models';

@Component({
  selector: 'bg-fraud-monitoring',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="monitoring-page">
      <div class="page-heading">
        <div>
          <div class="eyebrow">SECURITY & COMPLIANCE ENGINE</div>
          <h1>Fraud Monitoring Workspace</h1>
          <p>Investigate suspicious banking activities, evaluate rule violations and manage alert lifecycles.</p>
        </div>
        <div class="heading-status">
          <span class="live-pulse-badge">
            <i></i> Rule Engine Polling Active
          </span>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="metric-grid compact">
        <article class="metric-card">
          <div class="metric-top">
            <span>Open alerts</span>
            <span class="metric-icon orange">!</span>
          </div>
          <div class="metric-value">{{ alertService.openCount() }}</div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <span>Under investigation</span>
            <span class="metric-icon purple">⌕</span>
          </div>
          <div class="metric-value">{{ alertService.investigatingCount() }}</div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <span>Critical alerts</span>
            <span class="metric-icon red">⚑</span>
          </div>
          <div class="metric-value">{{ alertService.criticalActiveCount() }}</div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <span>Resolved</span>
            <span class="metric-icon green">✓</span>
          </div>
          <div class="metric-value">{{ alertService.resolvedCount() }}</div>
        </article>
      </div>

      <!-- Split Layout: Alert Queue & Investigation Console -->
      <div class="fraud-layout">
        <!-- Alert Queue Panel -->
        <article class="panel queue-panel">
          <div class="panel-heading">
            <div>
              <h2>Prioritized Alert Queue</h2>
              <p>Filter by risk severity or status</p>
            </div>
            <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)" class="mini-select">
              <option value="All">All statuses</option>
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
              <option value="Dismissed">Dismissed</option>
            </select>
          </div>

          <div class="queue-list">
            @for (alert of filteredAlerts(); track alert.id) {
              <button 
                class="queue-item" 
                [class.selected]="selectedAlert()?.id === alert.id" 
                (click)="selectAlert(alert)">
                <span class="alert-symbol" [class]="alert.riskLevel.toLowerCase()">!</span>
                <span class="alert-copy">
                  <b>{{ alert.customer }}</b>
                  <small>{{ alert.transactionId }} · {{ alert.detectedAt | date:'dd MMM, hh:mm a' }}</small>
                  <small class="reason-text">{{ alert.explanation }}</small>
                </span>
                <div class="queue-meta">
                  <span class="risk-pill" [class]="alert.riskLevel.toLowerCase()">{{ alert.riskLevel }}</span>
                  <span class="status-tiny" [class]="alert.status.toLowerCase()">{{ alert.status }}</span>
                </div>
              </button>
            } @empty {
              <div class="empty-queue">No alerts match the selected status filter.</div>
            }
          </div>
        </article>

        <!-- Investigation Detail Console -->
        <article class="panel detail-panel">
          @if (selectedAlert(); as a) {
            <div class="detail-header">
              <div>
                <h2>Alert Investigation: {{ a.id }}</h2>
                <p>Transaction Reference: <a (click)="goToTxn(a.transactionId)" class="link">{{ a.transactionId }} ↗</a></p>
              </div>
              <span class="status" [class]="a.status.toLowerCase()">{{ a.status }}</span>
            </div>

            <!-- Risk Banner -->
            <div class="detail-risk-banner" [class]="a.riskLevel.toLowerCase()">
              <span class="risk-badge-symbol">!</span>
              <div>
                <b>{{ a.riskLevel }} Severity — Score {{ a.riskScore }}/100</b>
                <small>Requires immediate analyst review and response.</small>
              </div>
            </div>

            <!-- Details Table -->
            <dl class="detail-grid">
              <dt>Target Customer</dt>
              <dd><b>{{ a.customer }}</b> (ID: {{ a.customerId }})</dd>
              <dt>Transaction Amount</dt>
              <dd><b>{{ formatINR(a.amount) }}</b></dd>
              <dt>Detection Trigger</dt>
              <dd class="explanation-box">{{ a.explanation }}</dd>
              <dt>Detection Time</dt>
              <dd>{{ a.detectedAt | date:'dd MMM yyyy, hh:mm:ss a' }}</dd>
              <dt>Assigned Analyst</dt>
              <dd>
                @if (canAssignAlerts()) {
                  <select [ngModel]="a.assignedTo" (ngModelChange)="assignInvestigator(a.id, $event)" class="assign-select">
                    <option value="">-- Unassigned --</option>
                    @for (user of mockData.users; track user.id) {
                      <option [value]="user.fullName">{{ user.fullName }} ({{ user.role }})</option>
                    }
                  </select>
                } @else {
                  <span>{{ a.assignedTo || 'Unassigned' }}</span>
                }
              </dd>
              @if (a.dismissalJustification) {
                <dt>Dismissal Reason</dt>
                <dd class="dismissal-text">{{ a.dismissalJustification }}</dd>
              }
            </dl>

            <!-- Investigation Notes Section -->
            <div class="notes-section">
              <h3>Investigation Notes & Audit Trail</h3>
              <div class="notes-list">
                @for (note of a.investigationNotes; track note.id) {
                  <div class="note-card">
                    <div class="note-head">
                      <b>{{ note.author }}</b>
                      <span>{{ note.action }} · {{ note.timestamp | date:'short' }}</span>
                    </div>
                    <p>{{ note.content }}</p>
                  </div>
                } @empty {
                  <div class="empty-notes">No notes logged yet for this alert.</div>
                }
              </div>

              <!-- Add Note Form -->
              @if (canAddNotes()) {
                <div class="add-note-box">
                  <input 
                    type="text" 
                    [(ngModel)]="newNoteContent" 
                    placeholder="Add analyst observation or finding..." 
                    (keyup.enter)="addNote(a.id)">
                  <button class="primary-button" (click)="addNote(a.id)" [disabled]="!newNoteContent.trim()">Add Note</button>
                </div>
              }
            </div>

            <!-- Action Buttons -->
            <div class="detail-actions">
              @if (canInvestigate()) {
                <button class="secondary-button" (click)="markInvestigating(a)">Mark Investigating</button>
              }
              @if (canDismiss()) {
                <button class="secondary-button" (click)="openDismissDialog(a)">Dismiss False Positive</button>
              }
              @if (canResolve()) {
                <button class="primary-button" (click)="resolveAlert(a)">Resolve Alert</button>
              }
            </div>
          } @else {
            <div class="empty-detail">
              <div class="empty-icon">◎</div>
              <b>Select an alert to investigate</b>
              <p>Choose an item from the prioritized queue on the left to review triggered detection rules and document investigation steps.</p>
            </div>
          }
        </article>
      </div>

      <!-- Dismiss Justification Modal -->
      @if (dismissingAlert(); as alert) {
        <div class="modal-backdrop" (click)="dismissingAlert.set(null)">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Dismiss Alert as False Positive</h3>
              <button class="close-btn" (click)="dismissingAlert.set(null)">×</button>
            </div>
            <div class="modal-body">
              <p>Mandatory justification required to dismiss alert <b>{{ alert.id }}</b>:</p>
              <div class="form-group" style="margin-top: 10px;">
                <textarea 
                  [(ngModel)]="dismissJustification" 
                  rows="4" 
                  class="form-textarea" 
                  placeholder="State the verifiable reason (e.g. Verified legitimate business travel, customer confirmed transaction via secure phone auth)...">
                </textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="secondary-button" (click)="dismissingAlert.set(null)">Cancel</button>
              <button class="danger-button" [disabled]="!dismissJustification.trim()" (click)="confirmDismiss(alert.id)">
                Confirm Dismissal
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .monitoring-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .live-pulse-badge {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 11px;
      font-weight: 700;
      color: #168a5c;
      background: #e9f8f0;
      padding: 6px 12px;
      border-radius: 20px;
    }
    .live-pulse-badge i {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #168a5c;
    }

    .metric-grid.compact {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .metric-grid.compact .metric-card {
      min-height: 90px;
      padding: 14px 16px;
      background: #fff;
      border: 1px solid #e9edf3;
      border-radius: 10px;
    }
    .metric-top {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #7b8798;
      text-transform: uppercase;
      font-weight: 700;
    }
    .metric-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      display: grid;
      place-items: center;
      font-size: 12px;
      font-weight: 700;
    }
    .metric-icon.orange { background: #fff3e9; color: #e18b42; }
    .metric-icon.purple { background: #f2edff; color: #8c6ad9; }
    .metric-icon.red { background: #fff0ef; color: #d95c5c; }
    .metric-icon.green { background: #e9f8f0; color: #168a5c; }

    .metric-value {
      font: 800 22px 'Manrope', sans-serif;
      color: #172b4d;
      margin-top: 6px;
    }

    .fraud-layout {
      display: grid;
      grid-template-columns: 1.15fr 1.85fr;
      gap: 16px;
      min-height: 600px;
    }

    .queue-panel {
      display: flex;
      flex-direction: column;
    }
    .mini-select {
      border: 1px solid #e8ecf2;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 10px;
      color: #667085;
      background: #fff;
      outline: none;
    }

    .queue-list {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      max-height: 620px;
    }
    .queue-item {
      width: 100%;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 14px 12px;
      border: 0;
      border-bottom: 1px solid #f0f2f5;
      background: #fff;
      text-align: left;
      cursor: pointer;
      transition: background 0.15s;
    }
    .queue-item:hover {
      background: #f8fafd;
    }
    .queue-item.selected {
      background: #edf3ff;
      border-left: 3px solid #315fcb;
    }

    .alert-symbol {
      flex: 0 0 24px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 11px;
      margin-top: 2px;
    }
    .alert-symbol.critical { background: #fff0ef; color: #df5a55; }
    .alert-symbol.high { background: #fff3e8; color: #e28a43; }
    .alert-symbol.medium { background: #fff8e8; color: #c89a30; }
    .alert-symbol.low { background: #e9f8f0; color: #1b9a67; }

    .alert-copy {
      flex: 1;
      min-width: 0;
    }
    .alert-copy b {
      display: block;
      font-size: 11px;
      color: #172b4d;
    }
    .alert-copy small {
      display: block;
      font-size: 9px;
      color: #98a2b3;
      margin-top: 2px;
    }
    .reason-text {
      color: #687589 !important;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .queue-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .status-tiny {
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      color: #98a2b3;
    }
    .status-tiny.open { color: #d95b56; }
    .status-tiny.investigating { color: #b78a26; }
    .status-tiny.resolved { color: #168a5c; }
    .status-tiny.dismissed { color: #7b8492; }

    .empty-queue {
      padding: 40px;
      text-align: center;
      color: #98a2b3;
      font-size: 11px;
    }

    .detail-panel {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .detail-header h2 {
      font: 700 15px 'Manrope', sans-serif;
      color: #172b4d;
    }
    .detail-header p {
      font-size: 11px;
      color: #98a2b3;
      margin: 2px 0 0;
    }
    .link {
      color: #315fcb;
      cursor: pointer;
    }

    .detail-risk-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
    }
    .detail-risk-banner.critical { background: #fff0ef; border: 1px solid #ffd8d6; color: #d95b56; }
    .detail-risk-banner.high { background: #fff3e8; border: 1px solid #ffe3c9; color: #d98136; }
    .detail-risk-banner.medium { background: #fff8e8; border: 1px solid #feecb5; color: #bd9029; }
    .detail-risk-banner.low { background: #e9f8f0; border: 1px solid #ccefe0; color: #168a5c; }

    .risk-badge-symbol {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #fff;
      display: grid;
      place-items: center;
      font-weight: 800;
    }
    .detail-risk-banner b {
      display: block;
      font-size: 12px;
    }
    .detail-risk-banner small {
      font-size: 10px;
      opacity: 0.85;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 10px;
      margin: 0;
      font-size: 11px;
    }
    .detail-grid dt {
      color: #98a2b3;
    }
    .detail-grid dd {
      color: #344054;
      margin: 0;
    }
    .explanation-box {
      background: #fafbfd;
      border: 1px solid #edf0f5;
      padding: 8px 12px;
      border-radius: 6px;
      line-height: 1.4;
    }
    .dismissal-text {
      color: #7b8492;
      font-style: italic;
    }
    .assign-select {
      border: 1px solid #e8ecf2;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 11px;
      color: #344054;
      outline: none;
    }

    .notes-section {
      background: #fafbfd;
      border: 1px solid #edf0f5;
      border-radius: 8px;
      padding: 14px;
    }
    .notes-section h3 {
      font: 700 12px 'Manrope', sans-serif;
      color: #172b4d;
      margin-bottom: 10px;
    }
    .notes-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 160px;
      overflow-y: auto;
      margin-bottom: 10px;
    }
    .note-card {
      background: #fff;
      border: 1px solid #edf0f5;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 10px;
    }
    .note-head {
      display: flex;
      justify-content: space-between;
      color: #98a2b3;
      margin-bottom: 3px;
    }
    .note-head b {
      color: #315fcb;
    }
    .note-card p {
      margin: 0;
      color: #344054;
    }
    .empty-notes {
      color: #a1aab8;
      font-size: 10px;
      font-style: italic;
    }

    .add-note-box {
      display: flex;
      gap: 8px;
    }
    .add-note-box input {
      flex: 1;
      border: 1px solid #e8ecf2;
      border-radius: 6px;
      padding: 7px 10px;
      font: 11px 'DM Sans', sans-serif;
      outline: none;
    }

    .detail-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      padding-top: 10px;
      border-top: 1px solid #f0f2f5;
      flex-wrap: wrap;
    }

    .empty-detail {
      text-align: center;
      padding: 80px 20px;
      color: #98a2b3;
    }
    .empty-icon {
      font-size: 36px;
      color: #b6c4df;
    }
    .empty-detail b {
      display: block;
      color: #172b4d;
      font-size: 13px;
      margin: 12px 0 4px;
    }
    .empty-detail p {
      font-size: 11px;
      max-width: 320px;
      margin: 0 auto;
    }

    @media (max-width: 900px) {
      .fraud-layout {
        grid-template-columns: 1fr;
      }
      .metric-grid.compact {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 520px) {
      .metric-grid.compact {
        grid-template-columns: minmax(0, 1fr);
      }
      .detail-panel {
        padding: 14px;
      }
      .detail-grid {
        grid-template-columns: 1fr;
        gap: 4px;
      }
      .detail-grid dt {
        margin-top: 6px;
      }
      .detail-actions {
        flex-direction: column;
      }
      .detail-actions button {
        width: 100%;
      }
      .add-note-box {
        flex-direction: column;
      }
      .add-note-box button {
        width: 100%;
      }
    }
  `]
})
export class FraudMonitoringComponent {
  alertService = inject(AlertService);
  authService = inject(AuthService);
  auditService = inject(AuditLogService);
  mockData = inject(MockDataService);
  private router = inject(Router);

  // RBAC permissions
  canInvestigate = computed(() => this.authService.hasPermission('fraud.investigate'));
  canAssignAlerts = computed(() => this.authService.hasPermission('fraud.assign'));
  canAddNotes = computed(() => this.authService.hasPermission('fraud.add_notes'));
  canResolve = computed(() => this.authService.hasPermission('fraud.resolve'));
  canDismiss = computed(() => this.authService.hasPermission('fraud.dismiss'));

  statusFilter = signal<string>('All');
  selectedAlert = signal<FraudAlert | null>(null);
  newNoteContent = '';

  dismissingAlert = signal<FraudAlert | null>(null);
  dismissJustification = '';

  alerts = this.alertService.alerts;

  filteredAlerts = computed(() => {
    const status = this.statusFilter();
    if (status === 'All') return this.alerts();
    return this.alerts().filter(a => a.status === status);
  });

  selectAlert(alert: FraudAlert): void {
    this.selectedAlert.set(alert);
  }

  assignInvestigator(alertId: string, investigatorName: string): void {
    this.alertService.assignInvestigator(alertId, investigatorName);
    const updated = this.alertService.getById(alertId);
    if (updated) this.selectedAlert.set(updated);

    this.auditService.log({
      userId: this.authService.user()?.id || 'USR-001',
      userName: this.authService.user()?.fullName || 'Admin',
      action: 'ALERT_ASSIGN',
      target: 'FraudAlert',
      targetId: alertId,
      details: `Assigned alert to ${investigatorName}`
    });
  }

  markInvestigating(alert: FraudAlert): void {
    this.alertService.updateStatus(alert.id, 'Investigating');
    const updated = this.alertService.getById(alert.id);
    if (updated) this.selectedAlert.set(updated);

    this.auditService.log({
      userId: this.authService.user()?.id || 'USR-001',
      userName: this.authService.user()?.fullName || 'Admin',
      action: 'ALERT_INVESTIGATING',
      target: 'FraudAlert',
      targetId: alert.id,
      details: `Marked alert as under active investigation`
    });
  }

  resolveAlert(alert: FraudAlert): void {
    this.alertService.resolve(alert.id);
    const updated = this.alertService.getById(alert.id);
    if (updated) this.selectedAlert.set(updated);

    this.auditService.log({
      userId: this.authService.user()?.id || 'USR-001',
      userName: this.authService.user()?.fullName || 'Admin',
      action: 'ALERT_RESOLVE',
      target: 'FraudAlert',
      targetId: alert.id,
      details: `Resolved alert ${alert.id}`
    });
  }

  openDismissDialog(alert: FraudAlert): void {
    this.dismissJustification = '';
    this.dismissingAlert.set(alert);
  }

  confirmDismiss(alertId: string): void {
    this.alertService.dismiss(alertId, this.dismissJustification);
    const updated = this.alertService.getById(alertId);
    if (updated) this.selectedAlert.set(updated);

    this.auditService.log({
      userId: this.authService.user()?.id || 'USR-001',
      userName: this.authService.user()?.fullName || 'Admin',
      action: 'ALERT_DISMISS',
      target: 'FraudAlert',
      targetId: alertId,
      details: `Dismissed alert: ${this.dismissJustification}`
    });

    this.dismissingAlert.set(null);
  }

  addNote(alertId: string): void {
    if (!this.newNoteContent.trim()) return;

    this.alertService.addNote(alertId, {
      author: this.authService.user()?.fullName || 'Analyst',
      content: this.newNoteContent,
      timestamp: new Date(),
      action: 'Analyst Note'
    });

    const updated = this.alertService.getById(alertId);
    if (updated) this.selectedAlert.set(updated);

    this.newNoteContent = '';
  }

  goToTxn(txnId: string): void {
    this.router.navigate(['/transactions', txnId]);
  }

  formatINR(val: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }
}
