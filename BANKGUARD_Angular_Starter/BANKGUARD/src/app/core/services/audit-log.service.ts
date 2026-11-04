import { Injectable, signal } from '@angular/core';
import { AuditLog } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private logsData = signal<AuditLog[]>([]);

  readonly logs = this.logsData.asReadonly();

  constructor(private data: MockDataService) {
    this.logsData.set([...this.data.auditLogs]);
  }

  getAll(): AuditLog[] {
    return this.logsData();
  }

  /** Add a new audit log entry. */
  log(entry: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress'>): void {
    const newLog: AuditLog = {
      ...entry,
      id: 'LOG-' + (5000 + this.logsData().length + 1),
      timestamp: new Date(),
      ipAddress: '192.168.1.10', // simulated
    };
    this.logsData.update(list => [newLog, ...list]);
  }

  search(term: string): AuditLog[] {
    const lower = term.toLowerCase();
    return this.logsData().filter(l =>
      [l.id, l.userName, l.action, l.target, l.targetId, l.details]
        .some(v => v.toLowerCase().includes(lower))
    );
  }

  filter(filters: {
    action?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): AuditLog[] {
    return this.logsData().filter(l => {
      if (filters.action && filters.action !== 'All' && l.action !== filters.action) return false;
      if (filters.userId && filters.userId !== 'All' && l.userId !== filters.userId) return false;
      if (filters.startDate && l.timestamp < filters.startDate) return false;
      if (filters.endDate && l.timestamp > filters.endDate) return false;
      return true;
    });
  }

  exportCsv(logs: AuditLog[]): void {
    const header = ['Log ID', 'Timestamp', 'User', 'Action', 'Target', 'Target ID', 'Details', 'IP Address'];
    const rows = logs.map(l => [
      l.id, l.timestamp.toISOString(), l.userName, l.action,
      l.target, l.targetId, l.details, l.ipAddress
    ]);
    const csv = [header, ...rows]
      .map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bankguard-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
