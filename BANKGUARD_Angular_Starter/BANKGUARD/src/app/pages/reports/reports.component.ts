import { Component, inject, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { TransactionService } from '../../core/services/transaction.service';
import { AlertService } from '../../core/services/alert.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { BankTransaction } from '../../core/models';

Chart.register(...registerables);

type ReportType = 'daily' | 'monthly' | 'fraud' | 'failed' | 'customer' | 'investigator';

@Component({
  selector: 'bg-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="reports-page">
      <div class="page-heading">
        <div>
          <div class="eyebrow">REGULATORY & AUDIT ANALYTICS</div>
          <h1>Operational Reports & Intelligence</h1>
          <p>Export compliance reports, fraud detection metrics, failure logs and investigator audit trails.</p>
        </div>
        <div class="report-actions no-print">
          <button class="secondary-button" (click)="printReport()">🖨 Print Report</button>
          <button class="primary-button" (click)="exportReportCsv()">↓ Export CSV</button>
        </div>
      </div>

      <!-- Report Type Selector Tabs -->
      <div class="report-tabs no-print">
        <button class="tab-btn" [class.active]="selectedReport() === 'daily'" (click)="setReport('daily')">
          Daily Transactions
        </button>
        <button class="tab-btn" [class.active]="selectedReport() === 'monthly'" (click)="setReport('monthly')">
          Monthly Ledger
        </button>
        <button class="tab-btn" [class.active]="selectedReport() === 'fraud'" (click)="setReport('fraud')">
          Fraud Incident Report
        </button>
        <button class="tab-btn" [class.active]="selectedReport() === 'failed'" (click)="setReport('failed')">
          Failed Transactions
        </button>
        <button class="tab-btn" [class.active]="selectedReport() === 'investigator'" (click)="setReport('investigator')">
          Analyst Performance
        </button>
      </div>

      <!-- Report Summary Statistics -->
      <div class="summary-cards">
        <div class="card">
          <small>Total Records</small>
          <b>{{ reportRecords().length }}</b>
        </div>
        <div class="card">
          <small>Total Volume</small>
          <b class="blue-text">{{ formatINR(reportVolume()) }}</b>
        </div>
        <div class="card">
          <small>Average Transaction</small>
          <b>{{ formatINR(averageAmount()) }}</b>
        </div>
        <div class="card">
          <small>Average Risk Score</small>
          <b class="red-text">{{ averageRisk() }}/100</b>
        </div>
      </div>

      <!-- Chart Visualization -->
      <article class="panel chart-panel">
        <div class="panel-heading">
          <h2>{{ chartTitle() }}</h2>
          <span class="report-tag">{{ selectedReport() | uppercase }}</span>
        </div>
        <div class="canvas-wrap">
          <canvas #reportCanvas></canvas>
        </div>
      </article>

      <!-- Report Data Table -->
      <article class="panel">
        <div class="panel-heading">
          <h2>Report Data Records</h2>
          <p>Generated on {{ today | date:'medium' }}</p>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>TRANSACTION ID</th>
                <th>CUSTOMER</th>
                <th>TYPE</th>
                <th>AMOUNT</th>
                <th>DATE</th>
                <th>METHOD</th>
                <th>STATUS</th>
                <th>RISK SCORE</th>
              </tr>
            </thead>
            <tbody>
              @for (t of reportRecords(); track t.id) {
                <tr>
                  <td class="id-cell">{{ t.id }}</td>
                  <td><b>{{ t.customer }}</b></td>
                  <td>{{ t.type }}</td>
                  <td class="amount">{{ t.amount | currency:'INR':'symbol-narrow':'1.0-0' }}</td>
                  <td>{{ t.date | date:'dd MMM yyyy' }}</td>
                  <td>{{ t.paymentMethod }}</td>
                  <td><span class="status" [class]="t.status.toLowerCase().replace(' ', '-')">{{ t.status }}</span></td>
                  <td><span class="risk-dot" [class]="t.riskLevel.toLowerCase()"></span><b>{{ t.riskScore }}</b></td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-state">No transaction records found for this report filter.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </article>
    </div>
  `,
  styles: [`
    .reports-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .report-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .report-tabs {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      max-width: 100%;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 4px;
    }
    .tab-btn {
      background: #fff;
      border: 1px solid #e9edf3;
      padding: 9px 16px;
      border-radius: 8px;
      font: 600 11px 'DM Sans', sans-serif;
      color: #687589;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
      flex-shrink: 0;
    }
    .tab-btn:hover {
      background: #f7f9fd;
      color: #172b4d;
    }
    .tab-btn.active {
      background: #edf3ff;
      border-color: #315fcb;
      color: #315fcb;
      font-weight: 700;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      width: 100%;
    }
    .card {
      background: #fff;
      border: 1px solid #e9edf3;
      border-radius: 9px;
      padding: 14px 18px;
      min-width: 0;
    }
    .card small {
      display: block;
      color: #98a2b3;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .card b {
      display: block;
      font: 800 20px 'Manrope', sans-serif;
      color: #172b4d;
      margin-top: 4px;
      word-break: break-word;
    }
    .blue-text { color: #315fcb !important; }
    .red-text { color: #df5a55 !important; }

    .chart-panel {
      padding: 18px 20px;
      min-width: 0;
    }
    .report-tag {
      background: #f1f3f6;
      color: #475467;
      font-size: 9px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .canvas-wrap {
      position: relative;
      height: 230px;
      width: 100%;
      max-width: 100%;
      margin-top: 10px;
    }

    .empty-state {
      padding: 35px;
      text-align: center;
      color: #98a2b3;
      font-size: 11px;
    }

    @media (max-width: 900px) {
      .summary-cards {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 520px) {
      .summary-cards {
        grid-template-columns: minmax(0, 1fr);
      }
      .report-actions {
        width: 100%;
      }
      .report-actions button {
        flex: 1 1 auto;
      }
    }
  `]
})
export class ReportsComponent implements AfterViewInit {
  private txnService = inject(TransactionService);
  private alertService = inject(AlertService);
  private mockData = inject(MockDataService);

  @ViewChild('reportCanvas') reportCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInstance: Chart | null = null;

  today = new Date();
  selectedReport = signal<ReportType>('daily');
  transactions = this.txnService.transactions;

  reportRecords = computed(() => {
    const type = this.selectedReport();
    const list = this.transactions();

    switch (type) {
      case 'daily':
        return list.slice(0, 10);
      case 'monthly':
        return list;
      case 'fraud':
        return list.filter(t => t.riskScore >= 60 || t.status === 'Under Review' || t.status === 'Blocked');
      case 'failed':
        return list.filter(t => t.status === 'Failed');
      case 'investigator':
        return list.filter(t => t.status === 'Under Review' || t.status === 'Blocked');
      default:
        return list;
    }
  });

  reportVolume = computed(() => this.reportRecords().reduce((s, t) => s + t.amount, 0));
  averageAmount = computed(() => {
    const recs = this.reportRecords();
    return recs.length > 0 ? Math.round(this.reportVolume() / recs.length) : 0;
  });
  averageRisk = computed(() => {
    const recs = this.reportRecords();
    return recs.length > 0 ? Math.round(recs.reduce((s, t) => s + t.riskScore, 0) / recs.length) : 0;
  });

  chartTitle = computed(() => {
    switch (this.selectedReport()) {
      case 'daily': return 'Daily Execution Velocity & Volume';
      case 'monthly': return 'Monthly Aggregate Volume by Channel';
      case 'fraud': return 'Fraud Score Severity Distribution';
      case 'failed': return 'Failed Transactions Breakdown by Channel';
      case 'investigator': return 'Compliance Review Volume';
      default: return 'Transaction Analytics';
    }
  });

  ngAfterViewInit(): void {
    this.renderChart();
  }

  setReport(type: ReportType): void {
    this.selectedReport.set(type);
    this.renderChart();
  }

  private renderChart(): void {
    if (!this.reportCanvas) return;
    const ctx = this.reportCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const type = this.selectedReport();
    let chartConfig: any;

    if (type === 'fraud') {
      chartConfig = {
        type: 'bar',
        data: {
          labels: ['Critical (80-100)', 'High (60-79)', 'Medium (30-59)', 'Low (0-29)'],
          datasets: [{
            label: 'Transactions Count',
            data: [
              this.transactions().filter(t => t.riskScore >= 80).length,
              this.transactions().filter(t => t.riskScore >= 60 && t.riskScore < 80).length,
              this.transactions().filter(t => t.riskScore >= 30 && t.riskScore < 60).length,
              this.transactions().filter(t => t.riskScore < 30).length
            ],
            backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#10b981'],
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
      };
    } else {
      chartConfig = {
        type: 'line',
        data: {
          labels: this.mockData.dailyAggregates.map(d => d.date.slice(5)),
          datasets: [{
            label: 'Report Metric Volume',
            data: this.mockData.dailyAggregates.map(d => d.volume),
            borderColor: '#315fcb',
            backgroundColor: 'rgba(49, 95, 203, 0.08)',
            fill: true,
            tension: 0.3
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
      };
    }

    this.chartInstance = new Chart(ctx, chartConfig);
  }

  printReport(): void {
    window.print();
  }

  exportReportCsv(): void {
    this.txnService.exportCsv(this.reportRecords());
  }

  formatINR(val: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }
}
