import { Component, inject, computed, signal, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { TransactionService } from '../../core/services/transaction.service';
import { AlertService } from '../../core/services/alert.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { BankTransaction, FraudAlert } from '../../core/models';

Chart.register(...registerables);

@Component({
  selector: 'bg-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <div class="dashboard-page">
      <!-- Page Heading matching original starter -->
      <div class="page-heading">
        <div>
          <div class="eyebrow">WEDNESDAY, 04 NOVEMBER 2026</div>
          <h1>Good afternoon, Admin <span>✦</span></h1>
          <p>Here's what's happening across your banking operations today.</p>
        </div>
        <div class="heading-actions">
          <button class="secondary-button" (click)="goTo('/reports')">Generate Report</button>
          <button class="primary-button" (click)="goTo('/transactions')">View transactions <span>↗</span></button>
        </div>
      </div>

      <!-- 6 KPI Metric Cards -->
      <div class="metric-grid">
        <article class="metric-card">
          <div class="metric-top">
            <span>Total transaction volume</span>
            <span class="metric-icon blue">₹</span>
          </div>
          <div class="metric-value">{{ formatINR(totalVolume()) }}</div>
          <div class="metric-foot">
            <span class="trend positive">↗ 12.8%</span>
            <span>vs. previous period</span>
          </div>
          <div class="sparkline blue-line">▁▂▁▄▃▅▄▆▅▇▆█</div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <span>Total transactions</span>
            <span class="metric-icon purple">⇄</span>
          </div>
          <div class="metric-value">{{ totalTransactions() }}</div>
          <div class="metric-foot">
            <span class="trend positive">↗ 15.4%</span>
            <span>total executed</span>
          </div>
          <div class="sparkline purple-line">▂▃▂▄▅▄▅▆▇▆▇█</div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <span>Successful transactions</span>
            <span class="metric-icon green">✓</span>
          </div>
          <div class="metric-value">{{ successCount() }}</div>
          <div class="metric-foot">
            <span class="trend positive">↗ 8.2%</span>
            <span>{{ successRate() }}% success rate</span>
          </div>
          <div class="sparkline green-line">▁▃▂▄▃▅▄▅▆▅▇█</div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <span>Failed transactions</span>
            <span class="metric-icon gray">✕</span>
          </div>
          <div class="metric-value">{{ failedCount() }}</div>
          <div class="metric-foot">
            <span class="trend negative">↓ 1.2%</span>
            <span>{{ failRate() }}% failure rate</span>
          </div>
          <div class="sparkline gray-line">▅▄▃▄▃▂▃▂▂  </div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <span>Suspicious / Under Review</span>
            <span class="metric-icon orange">⚑</span>
          </div>
          <div class="metric-value">{{ flaggedCount() }}</div>
          <div class="metric-foot">
            <span class="trend negative">↗ 2 new</span>
            <span>require review</span>
          </div>
          <div class="sparkline orange-line">▁▁▂▁▃▂▄▃▅▄▆█</div>
        </article>

        <article class="metric-card">
          <div class="metric-top">
            <span>Active fraud alerts</span>
            <span class="metric-icon red">!</span>
          </div>
          <div class="metric-value">{{ activeAlertsCount() }}</div>
          <div class="metric-foot">
            <span class="trend negative">● {{ criticalAlertsCount() }} Critical</span>
            <span>urgent action</span>
          </div>
          <div class="sparkline red-line"> ▂▃▂▄▃▅▅▆▇█</div>
        </article>
      </div>

      <!-- Real Financial Charts (Chart.js driven by actual mock data) -->
      <div class="charts-row">
        <!-- Daily Transaction Volume Chart -->
        <article class="panel chart-panel flex-2">
          <div class="panel-heading">
            <div>
              <h2>Transaction Volume Trend</h2>
              <p>Daily processed volume in INR (Last 7 Days)</p>
            </div>
            <span class="chart-badge">Live Aggregates</span>
          </div>
          <div class="canvas-wrap">
            <canvas #volumeChartCanvas></canvas>
          </div>
        </article>

        <!-- Transaction Type Distribution Donut -->
        <article class="panel chart-panel flex-1">
          <div class="panel-heading">
            <div>
              <h2>Transaction Types</h2>
              <p>Breakdown by transaction nature</p>
            </div>
          </div>
          <div class="canvas-wrap donut-wrap">
            <canvas #typeChartCanvas></canvas>
          </div>
        </article>
      </div>

      <div class="charts-row">
        <!-- Success vs Failed Transactions -->
        <article class="panel chart-panel flex-1">
          <div class="panel-heading">
            <div>
              <h2>Success vs. Failed Transactions</h2>
              <p>Processed operations daily count</p>
            </div>
          </div>
          <div class="canvas-wrap">
            <canvas #statusChartCanvas></canvas>
          </div>
        </article>

        <!-- Payment Channel Distribution -->
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

      <!-- Content Split: Recent Transactions & Active Alerts -->
      <div class="content-grid">
        <!-- Recent Transactions -->
        <article class="panel transactions-panel">
          <div class="panel-heading">
            <div>
              <h2>Recent transactions</h2>
              <p>Latest banking operations and risk evaluations</p>
            </div>
            <button class="text-button" (click)="goTo('/transactions')">View all transactions →</button>
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
                    <td>
                      <b>{{ t.customer }}</b>
                      <small class="sub-cell">{{ t.senderAccount }}</small>
                    </td>
                    <td>{{ t.type }}</td>
                    <td class="amount">{{ t.amount | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                    <td>
                      <span class="status" [class]="getStatusClass(t.status)">{{ t.status }}</span>
                    </td>
                    <td>
                      <span class="risk-dot" [class]="t.riskLevel.toLowerCase()"></span>
                      <b>{{ t.riskScore }}</b> <small>({{ t.riskLevel }})</small>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </article>

        <!-- Fraud Alerts Panel -->
        <article class="panel alerts-panel">
          <div class="panel-heading">
            <div>
              <h2>Active fraud alerts</h2>
              <p>Flagged by rule detection engine</p>
            </div>
            <button class="text-button" (click)="goTo('/fraud-alerts')">View all →</button>
          </div>

          <div class="alerts-list">
            @for (alert of recentAlerts(); track alert.id) {
              <div class="alert-row" (click)="goTo('/fraud-monitoring')">
                <span class="alert-symbol" [class]="alert.riskLevel.toLowerCase()">!</span>
                <span class="alert-copy">
                  <b>{{ alert.customer }}</b>
                  <small>{{ alert.explanation }}</small>
                  <small class="alert-meta">{{ alert.detectedAt | date:'hh:mm a' }} · {{ alert.id }} · {{ formatINR(alert.amount) }}</small>
                </span>
                <span class="risk-pill" [class]="alert.riskLevel.toLowerCase()">{{ alert.riskLevel }}</span>
              </div>
            } @empty {
              <div class="empty-alerts">No active alerts requiring attention.</div>
            }
          </div>
        </article>
      </div>
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

    .heading-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
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
      min-height: 128px;
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

    .sparkline {
      position: absolute;
      right: 14px;
      bottom: 12px;
      font-size: 16px;
      letter-spacing: 0;
      opacity: 0.75;
      pointer-events: none;
    }
    .blue-line { color: #4779e8; }
    .green-line { color: #28a675; }
    .orange-line { color: #e18b42; }
    .red-line { color: #d95c5c; }
    .purple-line { color: #8c6ad9; }
    .gray-line { color: #94a3b8; }

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

    .alerts-list {
      display: flex;
      flex-direction: column;
    }
    .alert-row {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f2f5;
      text-align: left;
      cursor: pointer;
    }
    .alert-row:last-child {
      border-bottom: 0;
    }
    .alert-row:hover {
      background: #fafcff;
    }
    .alert-symbol {
      flex: 0 0 27px;
      width: 27px;
      height: 27px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 12px;
    }
    .alert-symbol.critical { background: #fff0ef; color: #df5a55; }
    .alert-symbol.high { background: #fff3e8; color: #e28a43; }
    .alert-symbol.medium { background: #fff8e8; color: #c89a30; }
    .alert-symbol.low { background: #e9f8f0; color: #1b9a67; }

    .alert-copy {
      min-width: 0;
      flex: 1;
    }
    .alert-copy b {
      display: block;
      font-size: 11px;
      color: #344054;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .alert-copy small {
      display: block;
      font-size: 10px;
      color: #98a2b3;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .alert-meta {
      color: #7b8798 !important;
      font-size: 9px !important;
    }
    .empty-alerts {
      padding: 24px;
      text-align: center;
      color: #98a2b3;
      font-size: 11px;
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
      .sparkline {
        display: none;
      }
    }
  `]
})
export class DashboardComponent implements AfterViewInit {
  private txnService = inject(TransactionService);
  private alertService = inject(AlertService);
  private mockData = inject(MockDataService);
  private router = inject(Router);

  @ViewChild('volumeChartCanvas') volumeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('typeChartCanvas') typeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChartCanvas') statusCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('channelChartCanvas') channelCanvas!: ElementRef<HTMLCanvasElement>;

  transactions = this.txnService.transactions;
  alerts = this.alertService.alerts;

  totalTransactions = computed(() => this.transactions().length);
  totalVolume = computed(() => this.transactions().reduce((s, t) => s + t.amount, 0));
  successCount = computed(() => this.transactions().filter(t => t.status === 'Completed').length);
  failedCount = computed(() => this.transactions().filter(t => t.status === 'Failed').length);
  flaggedCount = computed(() => this.transactions().filter(t => t.status === 'Under Review' || t.status === 'Blocked').length);
  activeAlertsCount = computed(() => this.alerts().filter(a => a.status === 'Open' || a.status === 'Investigating').length);
  criticalAlertsCount = computed(() => this.alerts().filter(a => a.category === 'Critical' && a.status !== 'Resolved').length);

  successRate = computed(() => {
    const total = this.totalTransactions();
    return total > 0 ? ((this.successCount() / total) * 100).toFixed(1) : '0';
  });

  failRate = computed(() => {
    const total = this.totalTransactions();
    return total > 0 ? ((this.failedCount() / total) * 100).toFixed(1) : '0';
  });

  recentTransactions = computed(() => this.transactions().slice(0, 6));
  recentAlerts = computed(() => this.alerts().slice(0, 4));

  ngAfterViewInit(): void {
    this.initVolumeChart();
    this.initTypeChart();
    this.initStatusChart();
    this.initChannelChart();
  }

  private initVolumeChart(): void {
    const ctx = this.volumeCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.mockData.dailyAggregates;

    new Chart(ctx, {
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
          x: {
            grid: { display: false },
            ticks: { font: { size: 10, family: 'DM Sans' }, color: '#98a2b3' }
          },
          y: {
            grid: { color: '#f0f2f5' },
            ticks: {
              font: { size: 10, family: 'DM Sans' },
              color: '#98a2b3',
              callback: (v) => `₹${(Number(v) / 100000).toFixed(1)}L`
            }
          }
        }
      }
    });
  }

  private initTypeChart(): void {
    const ctx = this.typeCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.mockData.transactionTypeDistribution;

    new Chart(ctx, {
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
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 10, family: 'DM Sans' }, boxWidth: 10 }
          }
        },
        cutout: '68%'
      }
    });
  }

  private initStatusChart(): void {
    const ctx = this.statusCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.mockData.dailyAggregates;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.date.slice(5)),
        datasets: [
          {
            label: 'Successful',
            data: data.map(d => d.successful),
            backgroundColor: '#10b981',
            borderRadius: 4
          },
          {
            label: 'Failed',
            data: data.map(d => d.failed),
            backgroundColor: '#cbd5e1',
            borderRadius: 4
          },
          {
            label: 'Flagged',
            data: data.map(d => d.flagged),
            backgroundColor: '#ef4444',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 10, family: 'DM Sans' }, boxWidth: 10 }
          }
        },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 }, color: '#98a2b3' } },
          y: { stacked: true, grid: { color: '#f0f2f5' }, ticks: { font: { size: 10 }, color: '#98a2b3' } }
        }
      }
    });
  }

  private initChannelChart(): void {
    const ctx = this.channelCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.mockData.paymentChannelDistribution;

    new Chart(ctx, {
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
          x: { grid: { color: '#f0f2f5' }, ticks: { font: { size: 10 }, color: '#98a2b3' } },
          y: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#687589' } }
        }
      }
    });
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

