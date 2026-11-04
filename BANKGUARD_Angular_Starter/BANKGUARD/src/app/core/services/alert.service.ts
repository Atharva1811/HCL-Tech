import { Injectable, signal, computed } from '@angular/core';
import { FraudAlert, AlertStatus, InvestigationNote } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alertsData = signal<FraudAlert[]>([]);

  readonly alerts = this.alertsData.asReadonly();

  readonly openCount = computed(() =>
    this.alertsData().filter(a => a.status === 'Open').length
  );
  readonly investigatingCount = computed(() =>
    this.alertsData().filter(a => a.status === 'Investigating').length
  );
  readonly resolvedCount = computed(() =>
    this.alertsData().filter(a => a.status === 'Resolved').length
  );
  readonly dismissedCount = computed(() =>
    this.alertsData().filter(a => a.status === 'Dismissed').length
  );
  readonly criticalActiveCount = computed(() =>
    this.alertsData().filter(a => a.category === 'Critical' && a.status !== 'Resolved' && a.status !== 'Dismissed').length
  );

  constructor(private data: MockDataService) {
    this.alertsData.set([...this.data.alerts]);
  }

  getAll(): FraudAlert[] {
    return this.alertsData();
  }

  getById(id: string): FraudAlert | undefined {
    return this.alertsData().find(a => a.id === id);
  }

  getByTransactionId(transactionId: string): FraudAlert[] {
    return this.alertsData().filter(a => a.transactionId === transactionId);
  }

  getByCustomerId(customerId: string): FraudAlert[] {
    return this.alertsData().filter(a => a.customerId === customerId);
  }

  updateStatus(id: string, status: AlertStatus): void {
    this.alertsData.update(list =>
      list.map(a => a.id === id ? {
        ...a,
        status,
        resolvedAt: (status === 'Resolved' || status === 'Dismissed') ? new Date() : a.resolvedAt
      } : a)
    );
  }

  assignInvestigator(id: string, assignedTo: string): void {
    this.alertsData.update(list =>
      list.map(a => a.id === id ? { ...a, assignedTo, status: 'Investigating' as AlertStatus } : a)
    );
  }

  addNote(id: string, note: Omit<InvestigationNote, 'id'>): void {
    this.alertsData.update(list =>
      list.map(a => {
        if (a.id !== id) return a;
        const newNote: InvestigationNote = {
          ...note,
          id: 'N-' + String(Date.now()).slice(-6)
        };
        return { ...a, investigationNotes: [...a.investigationNotes, newNote] };
      })
    );
  }

  dismiss(id: string, justification: string): void {
    this.alertsData.update(list =>
      list.map(a => a.id === id ? {
        ...a,
        status: 'Dismissed' as AlertStatus,
        dismissalJustification: justification,
        resolvedAt: new Date()
      } : a)
    );
  }

  resolve(id: string): void {
    this.updateStatus(id, 'Resolved');
  }

  search(term: string): FraudAlert[] {
    const lower = term.toLowerCase();
    return this.alertsData().filter(a =>
      [a.id, a.customer, a.transactionId, a.explanation]
        .some(v => v.toLowerCase().includes(lower))
    );
  }

  filter(filters: {
    status?: string;
    category?: string;
    riskLevel?: string;
    startDate?: Date;
    endDate?: Date;
  }): FraudAlert[] {
    return this.alertsData().filter(a => {
      if (filters.status && filters.status !== 'All' && a.status !== filters.status) return false;
      if (filters.category && filters.category !== 'All' && a.category !== filters.category) return false;
      if (filters.riskLevel && filters.riskLevel !== 'All' && a.riskLevel !== filters.riskLevel) return false;
      if (filters.startDate && a.detectedAt < filters.startDate) return false;
      if (filters.endDate && a.detectedAt > filters.endDate) return false;
      return true;
    });
  }
}
