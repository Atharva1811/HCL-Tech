import { Injectable, signal, computed } from '@angular/core';
import { AppNotification } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsData = signal<AppNotification[]>([]);

  readonly notifications = this.notificationsData.asReadonly();
  readonly unreadCount = computed(() =>
    this.notificationsData().filter(n => !n.read).length
  );

  constructor(private data: MockDataService) {
    this.notificationsData.set([...this.data.notifications]);
  }

  getAll(): AppNotification[] {
    return this.notificationsData();
  }

  markAsRead(id: string): void {
    this.notificationsData.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllAsRead(): void {
    this.notificationsData.update(list =>
      list.map(n => ({ ...n, read: true }))
    );
  }

  add(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: AppNotification = {
      ...notification,
      id: 'NTF-' + String(Date.now()).slice(-6),
      timestamp: new Date(),
      read: false,
    };
    this.notificationsData.update(list => [newNotification, ...list]);
  }
}
