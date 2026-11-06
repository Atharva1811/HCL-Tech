import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { AuthService } from '../../core/services/auth.service';
import { AppUser, UserRole } from '../../core/models';

@Component({
  selector: 'bg-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="users-page">
      <div class="page-heading">
        <div>
          <div class="eyebrow">ADMINISTRATIVE ACCESS CONTROL</div>
          <h1>User Management & Role-Based Access Control</h1>
          <p>Supervise internal banking staff, investigators, compliance auditors and active sessions.</p>
        </div>
        <button class="primary-button" (click)="showAddModal.set(true)">+ Add Staff Member</button>
      </div>

      <!-- Roles Info Banner -->
      <div class="roles-banner">
        <div class="role-desc">
          <span class="role-tag super">Super Admin</span>
          <p>Full control over detection rules, users, and audit overrides.</p>
        </div>
        <div class="role-desc">
          <span class="role-tag bank">Banking Administrator</span>
          <p>Oversees transaction processing, account restrictions, and customer KYC.</p>
        </div>
        <div class="role-desc">
          <span class="role-tag fraud">Fraud Investigator</span>
          <p>Assigned alert queues, documents notes, resolves or dismisses false alarms.</p>
        </div>
        <div class="role-desc">
          <span class="role-tag audit">Read-Only Auditor</span>
          <p>Independent inspection access to logs, reports, and read-only ledgers.</p>
        </div>
      </div>

      <!-- Users Table Panel -->
      <article class="panel">
        <div class="panel-heading">
          <h2>Registered Institutional Staff ({{ users().length }})</h2>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>USER ID</th>
                <th>FULL NAME</th>
                <th>USERNAME</th>
                <th>INSTITUTIONAL EMAIL</th>
                <th>ASSIGNED ROLE</th>
                <th>LAST LOGIN</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              @for (u of users(); track u.id) {
                <tr>
                  <td class="id-cell">{{ u.id }}</td>
                  <td><b>{{ u.fullName }}</b></td>
                  <td><code>{{ u.username }}</code></td>
                  <td>{{ u.email }}</td>
                  <td>
                    <span class="role-badge" [class]="getRoleClass(u.role)">{{ u.role }}</span>
                  </td>
                  <td>{{ u.lastLogin | date:'dd MMM yyyy, hh:mm a' }}</td>
                  <td>
                    <span class="status" [class.completed]="u.isActive" [class.failed]="!u.isActive">
                      {{ u.isActive ? 'Active' : 'Disabled' }}
                    </span>
                  </td>
                  <td>
                    <button class="secondary-button" (click)="toggleActive(u.id)">
                      {{ u.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </article>

      <!-- Add Staff Modal -->
      @if (showAddModal()) {
        <div class="modal-backdrop" (click)="showAddModal.set(false)">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Create Administrative Staff Account</h3>
              <button class="close-btn" (click)="showAddModal.set(false)">×</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" [(ngModel)]="newName" class="form-input" placeholder="e.g. Atharva Deshmukh">
              </div>
              <div class="form-group">
                <label class="form-label">Username</label>
                <input type="text" [(ngModel)]="newUsername" class="form-input" placeholder="e.g. atharva.d">
              </div>
              <div class="form-group">
                <label class="form-label">Institutional Email</label>
                <input type="email" [(ngModel)]="newEmail" class="form-input" placeholder="e.g. atharva.d@bankguard.demo">
              </div>
              <div class="form-group">
                <label class="form-label">Assigned Role</label>
                <select [(ngModel)]="newRole" class="form-select">
                  <option value="Super Admin">Super Admin</option>
                  <option value="Banking Administrator">Banking Administrator</option>
                  <option value="Fraud Investigator">Fraud Investigator</option>
                  <option value="Read-Only Auditor">Read-Only Auditor</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button class="secondary-button" (click)="showAddModal.set(false)">Cancel</button>
              <button class="primary-button" [disabled]="!newName.trim()" (click)="addUser()">Create User Account</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .users-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .roles-banner {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .role-desc {
      background: #fff;
      border: 1px solid #e9edf3;
      border-radius: 8px;
      padding: 14px;
    }
    .role-tag {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 6px;
    }
    .role-tag.super { background: #fff0ef; color: #df5a55; }
    .role-tag.bank { background: #edf3ff; color: #315fcb; }
    .role-tag.fraud { background: #f2edff; color: #8c6ad9; }
    .role-tag.audit { background: #f1f3f6; color: #475467; }
    .role-desc p {
      margin: 0;
      font-size: 10px;
      color: #687589;
      line-height: 1.4;
    }

    .role-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .role-badge.super { background: #fff0ef; color: #df5a55; }
    .role-badge.bank { background: #edf3ff; color: #315fcb; }
    .role-badge.fraud { background: #f2edff; color: #8c6ad9; }
    .role-badge.audit { background: #f1f3f6; color: #475467; }

    @media (max-width: 900px) {
      .roles-banner {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 520px) {
      .roles-banner {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `]
})
export class UserManagementComponent {
  private mockData = inject(MockDataService);
  private auditService = inject(AuditLogService);
  private authService = inject(AuthService);

  users = signal<AppUser[]>([...this.mockData.users]);
  showAddModal = signal(false);

  newName = '';
  newUsername = '';
  newEmail = '';
  newRole: UserRole = 'Fraud Investigator';

  getRoleClass(role: UserRole): string {
    switch (role) {
      case 'Super Admin': return 'super';
      case 'Banking Administrator': return 'bank';
      case 'Fraud Investigator': return 'fraud';
      case 'Read-Only Auditor': return 'audit';
    }
  }

  toggleActive(userId: string): void {
    this.users.update(list => list.map(u => {
      if (u.id === userId) {
        const nextState = !u.isActive;
        this.auditService.log({
          userId: this.authService.user()?.id || 'USR-001',
          userName: this.authService.user()?.fullName || 'Admin',
          action: nextState ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
          target: 'AppUser',
          targetId: u.id,
          details: `${nextState ? 'Activated' : 'Deactivated'} staff user ${u.username}`
        });
        return { ...u, isActive: nextState };
      }
      return u;
    }));
  }

  addUser(): void {
    if (!this.newName.trim()) return;

    const newUser: AppUser = {
      id: 'USR-00' + (this.users().length + 1),
      fullName: this.newName,
      username: this.newUsername || this.newName.toLowerCase().replace(' ', '.'),
      email: this.newEmail || `${this.newUsername}@bankguard.demo`,
      role: this.newRole,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      passwordHash: '$2b$10$demohash'
    };

    this.users.update(list => [...list, newUser]);

    this.auditService.log({
      userId: this.authService.user()?.id || 'USR-001',
      userName: this.authService.user()?.fullName || 'Admin',
      action: 'USER_CREATE',
      target: 'AppUser',
      targetId: newUser.id,
      details: `Created new user account for ${newUser.fullName} with role ${newUser.role}`
    });

    this.showAddModal.set(false);
    this.newName = '';
    this.newUsername = '';
    this.newEmail = '';
  }
}

