import { Injectable, signal } from '@angular/core';
import { Customer, CustomerStatus, RiskLevel } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private customersData = signal<Customer[]>([]);

  readonly customers = this.customersData.asReadonly();

  constructor(private data: MockDataService) {
    this.customersData.set([...this.data.customers]);
  }

  getAll(): Customer[] {
    return this.customersData();
  }

  getById(id: string): Customer | undefined {
    return this.customersData().find(c => c.id === id);
  }

  search(term: string): Customer[] {
    const lower = term.toLowerCase();
    return this.customersData().filter(c =>
      [c.id, c.fullName, c.email, c.phone, c.address]
        .some(v => v.toLowerCase().includes(lower))
    );
  }

  add(customer: Omit<Customer, 'id'>): Customer {
    const id = 'CUS-' + (1000 + this.customersData().length + 1);
    const newCustomer: Customer = { ...customer, id };
    this.customersData.update(list => [...list, newCustomer]);
    return newCustomer;
  }

  update(id: string, changes: Partial<Customer>): void {
    this.customersData.update(list =>
      list.map(c => c.id === id ? { ...c, ...changes } : c)
    );
  }

  updateStatus(id: string, status: CustomerStatus): void {
    this.update(id, { status });
  }

  updateRisk(id: string, riskClassification: RiskLevel): void {
    this.update(id, { riskClassification });
  }

  getSummary() {
    const customers = this.customersData();
    return {
      total: customers.length,
      active: customers.filter(c => c.status === 'Active').length,
      underReview: customers.filter(c => c.status === 'Under Review').length,
      restricted: customers.filter(c => c.status === 'Restricted').length,
      suspended: customers.filter(c => c.status === 'Suspended').length,
      highRisk: customers.filter(c => c.riskClassification === 'High' || c.riskClassification === 'Critical').length,
    };
  }
}
