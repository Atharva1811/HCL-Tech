import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService } from '../../core/services/audit-log.service';
import { AuditLog } from '../../core/models';

@Component({
  selector: 'bg-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="audit-page">
      <div class="page-heading">
        <div>
          <div class="eyebrow">REGULATORY COMPLIANCE LEDGER</div>
          <h1>System Audit Trail</h1>
          <p>Immutable event log tracking administrative interventions, rule overrides, and alert resolutions.</p>
        </div>
        <button class="primary-button" (click)="exportCsv()">↓ Export Audit CSV</button>
      </div>

      <!-- Filters -->
      <article class="panel filter-panel">
        <div class="filter-row">
          <input 
            type="text" 
            placeholder="Search action, user, target, or details..." 
            [ngModel]="searchTerm()" 
            (ngModelChange)="searchTerm.set($event)"
            class="form-input">

          <select [ngModel]="actionFilter()" (ngModelChange)="actionFilter.set($event)" class="form-select">
            <option value="All">All Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="ALERT_INVESTIGATE">ALERT_INVESTIGATE</option>
            <option value="ALERT_RESOLVE">ALERT_RESOLVE</option>
            <option value="ALERT_DISMISS">ALERT_DISMISS</option>
            <option value="ACCOUNT_RESTRICT">ACCOUNT_RESTRICT</option>
            <option value="ACCOUNT_SUSPEND">ACCOUNT_SUSPEND</option>
            <option value="RULE_UPDATE">RULE_UPDATE</option>
            <option value="USER_CREATE">USER_CREATE</option>
          </select>
        </div>
      </article>

      <!-- Logs Table -->
      <article class="panel">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>LOG ID</th>
                <th>TIMESTAMP</th>
                <th>OPERATING STAFF</th>
                <th>ACTION TYPE</th>
                <th>TARGET ENTITY</th>
                <th>IDENTIFIER</th>
                <th>SPECIFIC DETAILS</th>
                <th>ORIGIN IP</th>
              </tr>
            </thead>
            <tbody>
              @for (l of filteredLogs(); track l.id) {
                <tr>
                  <td class="id-cell">{{ l.id }}</td>
                  <td>{{ l.timestamp | date:'dd MMM yyyy, hh:mm:ss a' }}</td>
                  <td><b>{{ l.userName }}</b></td>
                  <td>
                    <span class="action-tag" [class]="getActionClass(l.action)">{{ l.action }}</span>
                  </td>
                  <td>{{ l.target }}</td>
                  <td><code>{{ l.targetId }}</code></td>
                  <td class="details-cell">{{ l.details }}</td>
                  <td><code class="ip-code">{{ l.ipAddress }}</code></td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-state">No audit log records match filter query.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </article>
    </div>
  `,
  styles: [`
    .audit-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .filter-panel {
      padding: 14px 20px;
    }
    .filter-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 12px;
    }

    .action-tag {
      font-size: 9px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-block;
    }
    .action-tag.login { background: #edf3ff; color: #315fcb; }
    .action-tag.alert { background: #fff8e8; color: #b78a26; }
    .action-tag.resolve { background: #e9f8f0; color: #168a5c; }
    .action-tag.danger { background: #fff0ef; color: #df5a55; }
    .action-tag.rule { background: #f2edff; color: #8c6ad9; }

    .details-cell {
      max-width: 320px;
      white-space: normal;
      color: #344054;
      font-size: 11px;
      word-break: break-word;
    }
    .ip-code {
      font-size: 10px;
      color: #687589;
      background: #f1f3f6;
      padding: 2px 5px;
      border-radius: 3px;
    }
    .empty-state {
      padding: 40px;
      text-align: center;
      color: #98a2b3;
      font-size: 11px;
    }

    @media (max-width: 600px) {
      .filter-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AuditLogsComponent {
  private auditService = inject(AuditLogService);

  searchTerm = signal('');
  actionFilter = signal('All');

  logs = this.auditService.logs;

  filteredLogs = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const act = this.actionFilter();

    return this.logs().filter(l => {
      const matchSearch = [l.id, l.userName, l.action, l.target, l.targetId, l.details, l.ipAddress]
        .some(v => v.toLowerCase().includes(term));
      const matchAct = act === 'All' || l.action === act;
      return matchSearch && matchAct;
    });
  });

  getActionClass(action: string): string {
    if (action.includes('LOGIN')) return 'login';
    if (action.includes('RESOLVE')) return 'resolve';
    if (action.includes('SUSPEND') || action.includes('RESTRICT') || action.includes('DISMISS')) return 'danger';
    if (action.includes('RULE')) return 'rule';
    return 'alert';
  }

  exportCsv(): void {
    this.auditService.exportCsv(this.filteredLogs());
  }
}

