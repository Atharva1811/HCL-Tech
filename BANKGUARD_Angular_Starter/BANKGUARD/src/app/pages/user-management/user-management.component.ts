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

      <!-- Security Violation / Restriction Alert -->
      @if (errorMessage()) {
        <div class="error-banner">
          <div class="error-content">
            <span class="error-icon">⚠</span>
            <span>{{ errorMessage() }}</span>
          </div>
          <button class="dismiss-btn" (click)="errorMessage.set('')">✕</button>
        </div>
      }

      @if (successMessage()) {
        <div class="success-banner">
          <span class="success-icon">✓</span>
          <span>{{ successMessage() }}</span>
        </div>
      }

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
                    <div class="role-cell-wrap">
                      <span class="role-badge" [class]="getRoleClass(u.role)">{{ u.role }}</span>
                      <select 
                        [ngModel]="u.role" 
                        (ngModelChange)="initiateRoleChange(u, $event)"
                        class="role-select">
                        <option value="Super Admin">Super Admin</option>
                        <option value="Banking Administrator">Banking Administrator</option>
                        <option value="Fraud Investigator">Fraud Investigator</option>
                        <option value="Read-Only Auditor">Read-Only Auditor</option>
                      </select>
                    </div>
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

      <!-- Role Change Confirmation Modal -->
      @if (pendingRoleChange(); as change) {
        <div class="modal-backdrop" (click)="pendingRoleChange.set(null)">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Confirm Institutional Role Modification</h3>
              <button class="close-btn" (click)="pendingRoleChange.set(null)">✕</button>
            </div>
            <div class="modal-body">
              <p>You are about to reassign the institutional access role for user:</p>
              <div class="target-card">
                <b>{{ change.user.fullName }}</b> (<code>{{ change.user.username }}</code>)
                <div class="role-shift">
                  <span class="role-badge" [class]="getRoleClass(change.user.role)">{{ change.user.role }}</span>
                  <span class="shift-arrow">➔</span>
                  <span class="role-badge" [class]="getRoleClass(change.newRole)">{{ change.newRole }}</span>
                </div>
              </div>

              @if (change.user.id === authService.user()?.id) {
                <div class="self-demote-warning">
                  ⚠ <b>Caution:</b> You are modifying your own user role. If you demote your account from Super Admin, you will immediately lose access to User Management and System Settings upon page refresh.
                </div>
              }

              <p class="warning-text">This will immediately update system permissions and audit all subsequent operations under the new role.</p>
            </div>
            <div class="modal-footer">
              <button class="secondary-button" (click)="pendingRoleChange.set(null)">Cancel</button>
              <button class="primary-button" (click)="confirmRoleChange()">Confirm & Apply Role</button>
            </div>
          </div>
        </div>
      }

      <!-- Add Staff Modal -->
      @if (showAddModal()) {
        <div class="modal-backdrop" (click)="showAddModal.set(false)">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Create Administrative Staff Account</h3>
              <button class="close-btn" (click)="showAddModal.set(false)">✕</button>
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

    .error-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #b91c1c;
      font-size: 13px;
      font-weight: 600;
    }
    .error-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .error-icon {
      font-size: 16px;
    }
    .dismiss-btn {
      background: none;
      border: none;
      color: #b91c1c;
      cursor: pointer;
      font-size: 14px;
    }

    .success-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      color: #15803d;
      font-size: 13px;
      font-weight: 600;
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

    .role-cell-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .role-select {
      padding: 3px 6px;
      font-size: 11px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      background: #f9fafb;
      color: #374151;
      cursor: pointer;
    }

    .role-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .role-badge.super { background: #fff0ef; color: #df5a55; }
    .role-badge.bank { background: #edf3ff; color: #315fcb; }
    .role-badge.fraud { background: #f2edff; color: #8c6ad9; }
    .role-badge.audit { background: #f1f3f6; color: #475467; }

    .target-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      margin: 12px 0;
    }
    .role-shift {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
    }
    .shift-arrow {
      color: #94a3b8;
      font-weight: 700;
    }

    .self-demote-warning {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 10px;
      color: #b45309;
      font-size: 12px;
      margin-bottom: 10px;
    }

    .warning-text {
      font-size: 12px;
      color: #64748b;
    }

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
  authService = inject(AuthService);

  users = signal<AppUser[]>([...this.mockData.users]);
  showAddModal = signal(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  pendingRoleChange = signal<{ user: AppUser; newRole: UserRole } | null>(null);

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

  // Count active Super Admins currently in the system
  private countActiveSuperAdmins(): number {
    return this.users().filter(u => u.role === 'Super Admin' && u.isActive).length;
  }

  toggleActive(userId: string): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const targetUser = this.users().find(u => u.id === userId);
    if (!targetUser) return;

    // Safety check: Cannot deactivate the last remaining active Super Admin
    if (targetUser.role === 'Super Admin' && targetUser.isActive) {
      if (this.countActiveSuperAdmins() <= 1) {
        this.errorMessage.set('Safety Protocol: Cannot deactivate the last remaining active Super Admin in the system.');
        return;
      }
    }

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

    this.successMessage.set(`User ${targetUser.username} status updated successfully.`);
    setTimeout(() => this.successMessage.set(''), 4000);
  }

  initiateRoleChange(user: AppUser, newRole: UserRole): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (user.role === newRole) return;

    // Safety check: Cannot demote the last remaining active Super Admin
    if (user.role === 'Super Admin' && newRole !== 'Super Admin' && user.isActive) {
      if (this.countActiveSuperAdmins() <= 1) {
        this.errorMessage.set('Safety Protocol: Cannot demote the last remaining active Super Admin in the system.');
        return;
      }
    }

    this.pendingRoleChange.set({ user, newRole });
  }

  confirmRoleChange(): void {
    const change = this.pendingRoleChange();
    if (!change) return;

    const { user, newRole } = change;

    // Double check last super admin constraint
    if (user.role === 'Super Admin' && newRole !== 'Super Admin' && user.isActive) {
      if (this.countActiveSuperAdmins() <= 1) {
        this.errorMessage.set('Safety Protocol: Cannot demote the last remaining active Super Admin in the system.');
        this.pendingRoleChange.set(null);
        return;
      }
    }

    this.users.update(list => list.map(u => {
      if (u.id === user.id) {
        return { ...u, role: newRole };
      }
      return u;
    }));

    this.auditService.log({
      userId: this.authService.user()?.id || 'USR-001',
      userName: this.authService.user()?.fullName || 'Admin',
      action: 'USER_ROLE_CHANGE',
      target: 'AppUser',
      targetId: user.id,
      details: `Changed role of user ${user.username} from '${user.role}' to '${newRole}'`
    });

    this.successMessage.set(`Role for ${user.fullName} successfully updated to ${newRole}.`);
    this.pendingRoleChange.set(null);
    setTimeout(() => this.successMessage.set(''), 4000);
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
    this.successMessage.set(`New user ${newUser.fullName} registered successfully.`);
    setTimeout(() => this.successMessage.set(''), 4000);
  }
}
