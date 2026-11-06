import { Component, inject, computed, signal, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { TransactionService } from '../../core/services/transaction.service';
import { AlertService } from '../../core/services/alert.service';
import { CustomerService } from '../../core/services/customer.service';
import { AccountService } from '../../core/services/account.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { BankTransaction, FraudAlert, UserRole } from '../../core/models';

Chart.register(...registerables);

type DashboardViewMode = 'admin' | 'banking' | 'fraud' | 'audit';

@Component({
  selector: 'bg-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <div class="dashboard-page">
      <!-- ── PAGE HEADING ───────────────────────────────────── -->
      <div class="page-heading">
        <div>
          <div class="eyebrow">{{ viewEyebrow() }}</div>
          <h1>{{ greetingTitle() }} <span class="badge-role">{{ activeRoleLabel() }}</span></h1>
          <p>{{ viewDescription() }}</p>
        </div>
        <div class="heading-actions">
          @if (canExportReports()) {
            <button class="secondary-button" (click)="goTo('/reports')">Generate Report</button>
          }
          @if (viewMode() === 'fraud') {
            <button class="primary-button" (click)="goTo('/fraud-monitoring')">Open Investigation Console <span>↗</span></button>
          } @else if (viewMode() === 'audit') {
            <button class="secondary-button" (click)="goTo('/audit-logs')">View Audit Logs <span>↗</span></button>
          } @else {
            <button class="primary-button" (click)="goTo('/transactions')">View Transactions <span>↗</span></button>
          }
        </div>
      </div>

      <!-- ── 1. SUPER ADMIN DASHBOARD VIEW ──────────────────── -->
      @if (viewMode() === 'admin') {
        <div class="metric-grid">
          <article class="metric-card">
            <div class="metric-top">
              <span>Total Transaction Volume</span>
              <span class="metric-icon blue">₹</span>
            </div>
            <div class="metric-value">{{ formatINR(totalVolume()) }}</div>
            <div class="metric-foot">
              <span class="trend positive">↗ 12.8%</span>
              <span>system-wide volume</span>
            </div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Total Transactions</span>
              <span class="metric-icon purple">⇄</span>
            </div>
            <div class="metric-value">{{ totalTransactions() }}</div>
            <div class="metric-foot">
              <span class="trend positive">↗ 15.4%</span>
              <span>processed ledger records</span>
            </div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Total Customers</span>
              <span class="metric-icon green">👥</span>
            </div>
            <div class="metric-value">{{ totalCustomers() }}</div>
            <div class="metric-foot">
              <span>Registered KYC dossiers</span>
            </div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Active Bank Accounts</span>
              <span class="metric-icon gray">🏦</span>
            </div>
            <div class="metric-value">{{ totalAccounts() }}</div>
            <div class="metric-foot">
              <span>Core banking balances</span>
            </div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Institutional Staff</span>
              <span class="metric-icon orange">👤</span>
            </div>
            <div class="metric-value">{{ staffUsersCount() }}</div>
            <div class="metric-foot">
              <span>Supervised RBAC users</span>
            </div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Critical Fraud Alerts</span>
              <span class="metric-icon red">!</span>
            </div>
            <div class="metric-value">{{ criticalAlertsCount() }}</div>
            <div class="metric-foot">
              <span class="trend negative">Urgent Action</span>
              <span>detection rules breached</span>
            </div>
          </article>
        </div>

        <!-- Super Admin Financial & System Charts -->
        <div class="charts-row">
          <article class="panel chart-panel flex-2">
            <div class="panel-heading">
              <div>
                <h2>Enterprise Transaction Volume Trend</h2>
                <p>7-Day Daily Processed Volume across All Channels (INR)</p>
              </div>
              <span class="chart-badge">Super Admin Live Feed</span>
            </div>
            <div class="canvas-wrap">
              <canvas #volumeChartCanvas></canvas>
            </div>
          </article>

          <article class="panel chart-panel flex-1">
            <div class="panel-heading">
              <div>
                <h2>Transaction Breakdown</h2>
                <p>Volume by Transaction Type</p>
              </div>
            </div>
            <div class="canvas-wrap donut-wrap">
              <canvas #typeChartCanvas></canvas>
            </div>
          </article>
        </div>

        <!-- Content Grid: Recent Transactions & Audit Trail Preview -->
        <div class="content-grid">
          <article class="panel">
            <div class="panel-heading">
              <div>
                <h2>Recent Financial Operations</h2>
                <p>Latest transactions and risk evaluations</p>
              </div>
              <button class="text-button" (click)="goTo('/transactions')">View all →</button>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>TRANSACTION</th>
                    <th>CUSTOMER</th>
                    <th>TYPE</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>RISK</th>
                  </tr>
                </thead>
                <tbody>
                  @for (t of recentTransactions(); track t.id) {
                    <tr (click)="goTo('/transactions/' + t.id)" class="clickable-row">
                      <td class="id-cell">{{ t.id }}</td>
                      <td><b>{{ t.customer }}</b></td>
                      <td>{{ t.type }}</td>
                      <td class="amount">{{ t.amount | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                      <td><span class="status" [class]="getStatusClass(t.status)">{{ t.status }}</span></td>
                      <td><span class="risk-dot" [class]="t.riskLevel.toLowerCase()"></span>{{ t.riskScore }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </article>

          <!-- Audit Activity Preview -->
          <article class="panel">
            <div class="panel-heading">
              <div>
                <h2>Administrative Audit Events</h2>
                <p>Real-time security trail</p>
              </div>
              <button class="text-button" (click)="goTo('/audit-logs')">Audit Trail →</button>
            </div>
            <div class="audit-list">
              @for (log of recentAuditLogs(); track log.id) {
                <div class="audit-row">
                  <div class="audit-meta">
                    <b>{{ log.userName }}</b>
                    <span class="log-badge">{{ log.action }}</span>
                    <small>{{ log.timestamp | date:'hh:mm a' }}</small>
                  </div>
                  <p>{{ log.details }}</p>
                </div>
              }
            </div>
          </article>
        </div>
      }

      <!-- ── 2. BANKING ADMINISTRATOR DASHBOARD VIEW ────────── -->
      @else if (viewMode() === 'banking') {
        <div class="metric-grid">
          <article class="metric-card">
            <div class="metric-top">
              <span>Managed Customers</span>
              <span class="metric-icon green">👥</span>
            </div>
            <div class="metric-value">{{ totalCustomers() }}</div>
            <div class="metric-foot">
              <span>Active KYC dossiers</span>
            </div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Active Bank Accounts</span>
              <span class="metric-icon blue">🏦</span>
            </div>
            <div class="metric-value">{{ totalAccounts() }}</div>
            <div class="metric-foot">
              <span>Open customer ledgers</span>
            </div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Total Volume (INR)</span>
              <span class="metric-icon purple">₹</span>
            </div>
            <div class="metric-value">{{ formatINR(totalVolume()) }}</div>
            <div class="metric-foot">
              <span class="trend positive">↗ 12.8%</span>
              <span>daily cleared volume</span>
            </div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Successful Operations</span>
              <span class="metric-icon green">✓</span>
            </div>
            <div class="metric-value">{{ successCount() }}</div>
            <div class="metric-foot">
              <span class="trend positive">{{ successRate() }}% success rate</span>
            </div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Failed Operations</span>
              <span class="metric-icon gray">✕</span>
            </div>
            <div class="metric-value">{{ failedCount() }}</div>
            <div class="metric-foot">
              <span class="trend negative">{{ failRate() }}% failure rate</span>
            </div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Operations Under Review</span>
              <span class="metric-icon orange">⚑</span>
            </div>
            <div class="metric-value">{{ flaggedCount() }}</div>
            <div class="metric-foot">
              <span>awaiting clearance</span>
            </div>
          </article>
        </div>

        <div class="charts-row">
          <article class="panel chart-panel flex-2">
            <div class="panel-heading">
              <div>
                <h2>Daily Clearing & Volume Velocity</h2>
                <p>Transaction throughput trend across all branches</p>
              </div>
            </div>
            <div class="canvas-wrap">
              <canvas #volumeChartCanvas></canvas>
            </div>
          </article>

          <article class="panel chart-panel flex-1">
            <div class="panel-heading">
              <div>
                <h2>Payment Channels</h2>
                <p>Volume by UPI, IMPS, NEFT, RTGS, Card</p>
              </div>
            </div>
            <div class="canvas-wrap">
              <canvas #channelChartCanvas></canvas>
            </div>
          </article>
        </div>

        <!-- Recent Banking Transactions Table -->
        <article class="panel">
          <div class="panel-heading">
            <div>
              <h2>Banking Operations Ledger</h2>
              <p>Search, filter and inspect transactional clearances</p>
            </div>
            <button class="primary-button" (click)="goTo('/transactions')">Open Transactions Module →</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>TRANSACTION</th>
                  <th>CUSTOMER</th>
                  <th>CHANNEL</th>
                  <th>AMOUNT</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                @for (t of recentTransactions(); track t.id) {
                  <tr class="clickable-row" (click)="goTo('/transactions/' + t.id)">
                    <td class="id-cell">{{ t.id }}</td>
                    <td><b>{{ t.customer }}</b></td>
                    <td><span class="method-tag">{{ t.paymentMethod }}</span></td>
                    <td class="amount">{{ t.amount | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                    <td>{{ t.date | date:'dd MMM, hh:mm a' }}</td>
                    <td><span class="status" [class]="getStatusClass(t.status)">{{ t.status }}</span></td>
                    <td><button class="secondary-button" (click)="goTo('/transactions/' + t.id)">Inspect →</button></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </article>
      }

      <!-- ── 3. FRAUD INVESTIGATOR DASHBOARD VIEW ───────────── -->
      @else if (viewMode() === 'fraud') {
        <div class="metric-grid">
          <article class="metric-card">
            <div class="metric-top">
              <span>Suspicious Operations</span>
              <span class="metric-icon orange">⚑</span>
            </div>
            <div class="metric-value">{{ flaggedCount() }}</div>
            <div class="metric-foot">
              <span>scored $\ge$ 60 or blocked</span>
            </div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Critical Severity Alerts</span>
              <span class="metric-icon red">!</span>
            </div>
            <div class="metric-value">{{ criticalAlertsCount() }}</div>
            <div class="metric-foot">
              <span class="trend negative">Immediate freeze required</span>
            </div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>High Severity Alerts</span>
              <span class="metric-icon orange">⚠</span>
            </div>
            <div class="metric-value">{{ highAlertsCount() }}</div>
            <div class="metric-foot">
              <span>flagged for same-day review</span>
            </div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Pending / Open Queue</span>
              <span class="metric-icon purple">⌕</span>
            </div>
            <div class="metric-value">{{ alertService.openCount() }}</div>
            <div class="metric-foot">
              <span>awaiting investigator</span>
            </div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Under Investigation</span>
              <span class="metric-icon blue">◈</span>
            </div>
            <div class="metric-value">{{ alertService.investigatingCount() }}</div>
            <div class="metric-foot">
              <span>active forensic review</span>
            </div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Resolved Incidents</span>
              <span class="metric-icon green">✓</span>
            </div>
            <div class="metric-value">{{ alertService.resolvedCount() }}</div>
            <div class="metric-foot">
              <span>mitigated cases</span>
            </div>
          </article>
        </div>

        <div class="charts-row">
          <article class="panel chart-panel flex-1">
            <div class="panel-heading">
              <div>
                <h2>Risk Score Severity Distribution</h2>
                <p>Transactions categorized by mathematical fraud score</p>
              </div>
            </div>
            <div class="canvas-wrap">
              <canvas #typeChartCanvas></canvas>
            </div>
          </article>

          <article class="panel chart-panel flex-1">
            <div class="panel-heading">
              <div>
                <h2>Alert Lifecycle States</h2>
                <p>Open, Investigating, Resolved, and Dismissed ratios</p>
              </div>
            </div>
            <div class="canvas-wrap">
              <canvas #statusChartCanvas></canvas>
            </div>
          </article>
        </div>

        <!-- Prioritized Investigation Queue -->
        <article class="panel">
          <div class="panel-heading">
            <div>
              <h2>Prioritized Investigation Queue</h2>
              <p>High-risk rule violations requiring compliance actions</p>
            </div>
            <button class="primary-button" (click)="goTo('/fraud-monitoring')">Open Full Investigation Console →</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ALERT ID</th>
                  <th>TARGET CUSTOMER</th>
                  <th>TXN REF</th>
                  <th>AMOUNT</th>
                  <th>RISK SCORE</th>
                  <th>TRIGGER REASON</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                @for (a of alertService.alerts(); track a.id) {
                  @if (a.status !== 'Resolved' && a.status !== 'Dismissed') {
                    <tr class="clickable-row" (click)="goTo('/fraud-monitoring')">
                      <td class="id-cell">{{ a.id }}</td>
                      <td><b>{{ a.customer }}</b></td>
                      <td><code>{{ a.transactionId }}</code></td>
                      <td class="amount">{{ a.amount | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                      <td>
                        <span class="risk-dot" [class]="a.riskLevel.toLowerCase()"></span>
                        <b>{{ a.riskScore }}</b> ({{ a.riskLevel }})
                      </td>
                      <td class="explanation-cell">{{ a.explanation }}</td>
                      <td><span class="status" [class]="a.status.toLowerCase()">{{ a.status }}</span></td>
                      <td>
                        <button class="primary-button" (click)="goTo('/fraud-monitoring')">Investigate →</button>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </article>
      }

      <!-- ── 4. READ-ONLY AUDITOR DASHBOARD VIEW ────────────── -->
      @else if (viewMode() === 'audit') {
        <div class="read-only-banner">
          <span class="ro-icon">👁</span>
          <div>
            <b>Independent Regulatory Compliance & Audit View</b>
            <p>You are viewing system state in authenticated read-only mode. All ledger records, reports, and audit logs are verifiable.</p>
          </div>
          <span class="badge-role">Read-Only Auditor</span>
        </div>

        <div class="metric-grid">
          <article class="metric-card">
            <div class="metric-top">
              <span>Audited Volume (INR)</span>
              <span class="metric-icon blue">₹</span>
            </div>
            <div class="metric-value">{{ formatINR(totalVolume()) }}</div>
            <div class="metric-foot"><span>Total cleared volume</span></div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Audited Operations</span>
              <span class="metric-icon purple">⇄</span>
            </div>
            <div class="metric-value">{{ totalTransactions() }}</div>
            <div class="metric-foot"><span>Ledger entries inspected</span></div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Settled Transactions</span>
              <span class="metric-icon green">✓</span>
            </div>
            <div class="metric-value">{{ successCount() }}</div>
            <div class="metric-foot"><span>{{ successRate() }}% verified success</span></div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Failed Operations</span>
              <span class="metric-icon gray">✕</span>
            </div>
            <div class="metric-value">{{ failedCount() }}</div>
            <div class="metric-foot"><span>{{ failRate() }}% logged failures</span></div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Logged Fraud Incidents</span>
              <span class="metric-icon red">!</span>
            </div>
            <div class="metric-value">{{ alertService.alerts().length }}</div>
            <div class="metric-foot"><span>Historical incident records</span></div>
          </article>

          <article class="metric-card">
            <div class="metric-top">
              <span>Total Audit Log Events</span>
              <span class="metric-icon orange">📋</span>
            </div>
            <div class="metric-value">{{ auditService.logs().length }}</div>
            <div class="metric-foot"><span>Immutable event records</span></div>
          </article>
        </div>

        <div class="charts-row">
          <article class="panel chart-panel flex-2">
            <div class="panel-heading">
              <div>
                <h2>Audit Volume & Transaction Trends</h2>
                <p>Immutable daily volume totals (INR)</p>
              </div>
            </div>
            <div class="canvas-wrap">
              <canvas #volumeChartCanvas></canvas>
            </div>
          </article>

          <article class="panel chart-panel flex-1">
            <div class="panel-heading">
              <div>
                <h2>Transaction Status Ratios</h2>
                <p>Completed vs Failed vs Flagged</p>
              </div>
            </div>
            <div class="canvas-wrap">
              <canvas #statusChartCanvas></canvas>
            </div>
          </article>
        </div>

        <!-- Recent Audit Log Records for Inspector -->
        <article class="panel">
          <div class="panel-heading">
            <div>
              <h2>Recent Regulatory Audit Log Entries</h2>
              <p>Forensically verifiable administrative actions</p>
            </div>
            <button class="secondary-button" (click)="goTo('/audit-logs')">Open Full Audit Ledger →</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>LOG ID</th>
                  <th>TIMESTAMP</th>
                  <th>STAFF MEMBER</th>
                  <th>ACTION TYPE</th>
                  <th>TARGET</th>
                  <th>DETAILS</th>
                  <th>ORIGIN IP</th>
                </tr>
              </thead>
              <tbody>
                @for (log of recentAuditLogs(); track log.id) {
                  <tr>
                    <td class="id-cell">{{ log.id }}</td>
                    <td>{{ log.timestamp | date:'dd MMM yyyy, hh:mm a' }}</td>
                    <td><b>{{ log.userName }}</b></td>
                    <td><span class="action-tag">{{ log.action }}</span></td>
                    <td>{{ log.target }}: <code>{{ log.targetId }}</code></td>
                    <td class="details-text">{{ log.details }}</td>
                    <td><code class="ip-code">{{ log.ipAddress }}</code></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </article>
      }
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 100%;
      min-width: 0;
    }

    .badge-role {
      font-size: 11px;
      font-weight: 700;
      background: #edf3ff;
      color: #315fcb;
      padding: 3px 9px;
      border-radius: 4px;
      vertical-align: middle;
      margin-left: 8px;
    }

    .heading-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .read-only-banner {
      background: #fafbfd;
      border: 1px solid #dbe5ff;
      border-left: 4px solid #315fcb;
      border-radius: 8px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }
    .ro-icon {
      font-size: 24px;
      color: #315fcb;
      flex-shrink: 0;
    }
    .read-only-banner div {
      flex: 1;
      min-width: 200px;
    }
    .read-only-banner b {
      display: block;
      font-size: 12px;
      color: #172b4d;
    }
    .read-only-banner p {
      margin: 2px 0 0;
      font-size: 11px;
      color: #687589;
    }

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 14px;
      width: 100%;
    }

    .metric-card {
      background: #fff;
      border: 1px solid #e9edf3;
      border-radius: 10px;
      box-shadow: 0 2px 7px rgba(23, 43, 77, 0.04);
      padding: 16px;
      position: relative;
      overflow: hidden;
      min-height: 124px;
      min-width: 0;
    }

    .metric-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #7b8798;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .metric-icon {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .metric-icon.blue { background: #edf3ff; color: #4779e8; }
    .metric-icon.green { background: #e9f8f0; color: #1b9a67; }
    .metric-icon.orange { background: #fff3e9; color: #e18b42; }
    .metric-icon.red { background: #fff0ef; color: #d95c5c; }
    .metric-icon.purple { background: #f2edff; color: #8c6ad9; }
    .metric-icon.gray { background: #f1f3f6; color: #7b8492; }

    .metric-value {
      font: 800 22px 'Manrope', sans-serif;
      color: #172b4d;
      margin-top: 10px;
      letter-spacing: -0.6px;
      word-break: break-word;
    }

    .metric-foot {
      display: flex;
      gap: 6px;
      align-items: center;
      color: #a1aab8;
      font-size: 9px;
      margin-top: 5px;
      flex-wrap: wrap;
    }

    .trend { font-weight: 700; }
    .trend.positive { color: #1a9a68; }
    .trend.negative { color: #e28a43; }

    .charts-row {
      display: flex;
      gap: 16px;
      width: 100%;
      min-width: 0;
    }
    .flex-1 { flex: 1; min-width: 0; }
    .flex-2 { flex: 2; min-width: 0; }

    .chart-panel {
      padding: 18px;
      min-width: 0;
    }
    .chart-badge {
      font-size: 10px;
      font-weight: 700;
      background: #edf3ff;
      color: #315fcb;
      padding: 3px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .canvas-wrap {
      position: relative;
      height: 220px;
      width: 100%;
      max-width: 100%;
      margin-top: 10px;
    }
    .donut-wrap {
      height: 220px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1.65fr 1fr;
      gap: 16px;
      width: 100%;
      min-width: 0;
    }

    .clickable-row {
      cursor: pointer;
    }
    .clickable-row:hover {
      background: #f7f9fd;
    }

    .audit-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .audit-row {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f3f6;
      font-size: 11px;
    }
    .audit-row:last-child {
      border-bottom: 0;
    }
    .audit-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 3px;
    }
    .audit-meta b {
      color: #172b4d;
    }
    .log-badge {
      background: #edf3ff;
      color: #315fcb;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 700;
    }
    .audit-meta small {
      color: #a1aab8;
      margin-left: auto;
    }
    .audit-row p {
      margin: 0;
      color: #687589;
      font-size: 10px;
      word-break: break-word;
    }

    .explanation-cell {
      max-width: 260px;
      white-space: normal;
      font-size: 10px;
      color: #687589;
      word-break: break-word;
    }
    .method-tag {
      background: #f1f3f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
    }
    .action-tag {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: #edf3ff;
      color: #315fcb;
    }
    .ip-code {
      font-size: 9px;
      background: #f1f3f6;
      padding: 2px 4px;
      border-radius: 3px;
    }
    .details-text {
      max-width: 260px;
      white-space: normal;
      font-size: 10px;
      word-break: break-word;
    }

    @media (max-width: 1300px) {
      .metric-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
    @media (max-width: 900px) {
      .metric-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .charts-row, .content-grid {
        flex-direction: column;
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 540px) {
      .metric-grid {
        grid-template-columns: minmax(0, 1fr);
      }
      .heading-actions {
        width: 100%;
      }
      .heading-actions button {
        width: 100%;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private txnService = inject(TransactionService);
  alertService = inject(AlertService);
  private customerService = inject(CustomerService);
  private accountService = inject(AccountService);
  auditService = inject(AuditLogService);
  private authService = inject(AuthService);
  private mockData = inject(MockDataService);
  private router = inject(Router);

  @ViewChild('volumeChartCanvas') volumeCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('typeChartCanvas') typeCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChartCanvas') statusCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('channelChartCanvas') channelCanvas?: ElementRef<HTMLCanvasElement>;

  private chartInstances: Chart[] = [];

  currentUser = this.authService.user;
  transactions = this.txnService.transactions;
  alerts = this.alertService.alerts;
  customers = this.customerService.customers;
  accounts = this.accountService.accounts;

  // Detect mode based on URL or Current Role
  viewMode = signal<DashboardViewMode>('admin');

  ngOnInit(): void {
    const url = this.router.url;
    if (url.includes('/dashboard/admin')) {
      this.viewMode.set('admin');
    } else if (url.includes('/dashboard/banking')) {
      this.viewMode.set('banking');
    } else if (url.includes('/dashboard/fraud')) {
      this.viewMode.set('fraud');
    } else if (url.includes('/dashboard/audit')) {
      this.viewMode.set('audit');
    } else {
      // Direct /dashboard: resolve based on role
      const role = this.authService.userRole();
      if (role === 'Banking Administrator') this.viewMode.set('banking');
      else if (role === 'Fraud Investigator') this.viewMode.set('fraud');
      else if (role === 'Read-Only Auditor') this.viewMode.set('audit');
      else this.viewMode.set('admin');
    }
  }

  // Role Headings & Eyebrows
  viewEyebrow = computed(() => {
    switch (this.viewMode()) {
      case 'admin': return 'SYSTEM ADMINISTRATOR COMMAND CONSOLE';
      case 'banking': return 'BANKING OPERATIONS & CLEARING DESK';
      case 'fraud': return 'FRAUD & THREAT INVESTIGATION CONSOLE';
      case 'audit': return 'REGULATORY COMPLIANCE & AUDIT DESK';
    }
  });

  greetingTitle = computed(() => {
    const name = this.currentUser()?.fullName || 'User';
    return `Good afternoon, ${name}`;
  });

  activeRoleLabel = computed(() => {
    return this.currentUser()?.role || 'Authorized Session';
  });

  viewDescription = computed(() => {
    switch (this.viewMode()) {
      case 'admin': return 'Supervise institutional users, core operations, audit records, and security engines.';
      case 'banking': return 'Monitor customer clearances, active accounts, daily volume velocity, and retail transactions.';
      case 'fraud': return 'Investigate flagged transactions, evaluate multi-rule heuristic breaches, and mitigate risks.';
      case 'audit': return 'Inspect immutable institutional ledgers, verify execution outcomes, and export audit trails.';
    }
  });

  canExportReports = computed(() => this.authService.hasPermission('reports.export'));

  // Aggregated Values
  totalTransactions = computed(() => this.transactions().length);
  totalVolume = computed(() => this.transactions().reduce((s, t) => s + t.amount, 0));
  totalCustomers = computed(() => this.customers().length);
  totalAccounts = computed(() => this.accounts().length);
  staffUsersCount = computed(() => this.mockData.users.filter(u => u.isActive).length);

  successCount = computed(() => this.transactions().filter(t => t.status === 'Completed').length);
  failedCount = computed(() => this.transactions().filter(t => t.status === 'Failed').length);
  flaggedCount = computed(() => this.transactions().filter(t => t.status === 'Under Review' || t.status === 'Blocked').length);

  criticalAlertsCount = computed(() => this.alerts().filter(a => a.category === 'Critical' && a.status !== 'Resolved').length);
  highAlertsCount = computed(() => this.alerts().filter(a => a.category === 'High' && a.status !== 'Resolved').length);
  openAlertsCount = computed(() => this.alertService.openCount());
  investigatingCount = computed(() => this.alertService.investigatingCount());
  resolvedAlertsCount = computed(() => this.alertService.resolvedCount());

  successRate = computed(() => {
    const total = this.totalTransactions();
    return total > 0 ? ((this.successCount() / total) * 100).toFixed(1) : '0';
  });

  failRate = computed(() => {
    const total = this.totalTransactions();
    return total > 0 ? ((this.failedCount() / total) * 100).toFixed(1) : '0';
  });

  recentTransactions = computed(() => this.transactions().slice(0, 6));
  recentAuditLogs = computed(() => this.auditService.logs().slice(0, 5));

  ngAfterViewInit(): void {
    // Destroy previous charts before re-rendering
    this.chartInstances.forEach(c => c.destroy());
    this.chartInstances = [];

    // Render charts based on mode
    setTimeout(() => {
      this.initChartsForMode();
    }, 50);
  }

  private initChartsForMode(): void {
    const mode = this.viewMode();

    if (this.volumeCanvas?.nativeElement) {
      this.initVolumeChart(this.volumeCanvas.nativeElement);
    }

    if (mode === 'admin') {
      if (this.typeCanvas?.nativeElement) this.initTypeChart(this.typeCanvas.nativeElement);
    } else if (mode === 'banking') {
      if (this.channelCanvas?.nativeElement) this.initChannelChart(this.channelCanvas.nativeElement);
    } else if (mode === 'fraud') {
      if (this.typeCanvas?.nativeElement) this.initRiskDistChart(this.typeCanvas.nativeElement);
      if (this.statusCanvas?.nativeElement) this.initAlertStatusChart(this.statusCanvas.nativeElement);
    } else if (mode === 'audit') {
      if (this.statusCanvas?.nativeElement) this.initStatusChart(this.statusCanvas.nativeElement);
    }
  }

  private initVolumeChart(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = this.mockData.dailyAggregates;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.date.slice(5)),
        datasets: [{
          label: 'Volume (₹)',
          data: data.map(d => d.volume),
          borderColor: '#315fcb',
          backgroundColor: 'rgba(49, 95, 203, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#315fcb',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ₹${Number(ctx.raw).toLocaleString('en-IN')}`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: '#f0f2f5' }, ticks: { font: { size: 10 }, callback: v => `₹${(Number(v)/100000).toFixed(1)}L` } }
        }
      }
    });
    this.chartInstances.push(chart);
  }

  private initTypeChart(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = this.mockData.transactionTypeDistribution;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.type),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: ['#315fcb', '#06b6d4', '#10b981', '#f59e0b'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 10 } } },
        cutout: '68%'
      }
    });
    this.chartInstances.push(chart);
  }

  private initChannelChart(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = this.mockData.paymentChannelDistribution;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.channel),
        datasets: [{
          label: 'Channel Count',
          data: data.map(d => d.count),
          backgroundColor: '#3b82f6',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#f0f2f5' }, ticks: { font: { size: 10 } } },
          y: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    });
    this.chartInstances.push(chart);
  }

  private initRiskDistChart(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Critical (80-100)', 'High (60-79)', 'Medium (30-59)', 'Low (0-29)'],
        datasets: [{
          data: [
            this.transactions().filter(t => t.riskScore >= 80).length,
            this.transactions().filter(t => t.riskScore >= 60 && t.riskScore < 80).length,
            this.transactions().filter(t => t.riskScore >= 30 && t.riskScore < 60).length,
            this.transactions().filter(t => t.riskScore < 30).length
          ],
          backgroundColor: ['#df5a55', '#e28a43', '#d4a63e', '#24a572'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 10 } } },
        cutout: '60%'
      }
    });
    this.chartInstances.push(chart);
  }

  private initAlertStatusChart(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Open Queue', 'Investigating', 'Resolved', 'Dismissed'],
        datasets: [{
          data: [
            this.alertService.openCount(),
            this.alertService.investigatingCount(),
            this.alertService.resolvedCount(),
            this.alerts().filter(a => a.status === 'Dismissed').length
          ],
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#94a3b8'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: '#f0f2f5' }, ticks: { font: { size: 10 } } }
        }
      }
    });
    this.chartInstances.push(chart);
  }

  private initStatusChart(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = this.mockData.dailyAggregates;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.date.slice(5)),
        datasets: [
          { label: 'Completed', data: data.map(d => d.successful), backgroundColor: '#10b981', borderRadius: 4 },
          { label: 'Failed', data: data.map(d => d.failed), backgroundColor: '#cbd5e1', borderRadius: 4 },
          { label: 'Flagged', data: data.map(d => d.flagged), backgroundColor: '#ef4444', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { font: { size: 10 }, boxWidth: 10 } } },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { stacked: true, grid: { color: '#f0f2f5' }, ticks: { font: { size: 10 } } }
        }
      }
    });
    this.chartInstances.push(chart);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  formatINR(val: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }

  goTo(route: string): void {
    this.router.navigate([route]);
  }
}
