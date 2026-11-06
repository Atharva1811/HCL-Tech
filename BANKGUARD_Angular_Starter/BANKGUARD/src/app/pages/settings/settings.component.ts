import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { AuthService } from '../../core/services/auth.service';
import { DetectionRule } from '../../core/models';

@Component({
  selector: 'bg-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <div class="page-heading">
        <div>
          <div class="eyebrow">SYSTEM & ENGINE CONFIGURATION</div>
          <h1>Detection Rules & Settings</h1>
          <p>Calibrate explainable fraud detection thresholds, weights, and administrative system preferences.</p>
        </div>
        @if (canManageSettings()) {
          <button class="primary-button" (click)="saveAllSettings()">Save Engine Configurations</button>
        } @else {
          <span class="read-only-badge">🔒 Read-Only Configuration</span>
        }
      </div>

      @if (saveSuccessMessage()) {
        <div class="success-alert">
          {{ saveSuccessMessage() }}
        </div>
      }

      <!-- Fraud Detection Rules Calibration -->
      <article class="panel">
        <div class="panel-heading">
          <div>
            <h2>Explainable Rule-Based Fraud Detection Engine</h2>
            <p>Modify threshold limits, score weights, and toggle rules on or off.</p>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>RULE ID</th>
                <th>RULE NAME & LOGIC</th>
                <th>THRESHOLD</th>
                <th>TIME WINDOW</th>
                <th>SCORE WEIGHT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              @for (r of rules(); track r.id) {
                <tr>
                  <td class="id-cell">{{ r.id }}</td>
                  <td class="rule-desc-cell">
                    <b>{{ r.name }}</b>
                    <small>{{ r.description }}</small>
                  </td>
                  <td>
                    <input 
                      type="number" 
                      [(ngModel)]="r.threshold" 
                      class="mini-input"
                      [disabled]="!canManageSettings() || r.id === 'RULE-03'">
                    <span class="unit-label">
                      {{ r.id === 'RULE-01' ? '₹' : r.id === 'RULE-05' ? '% dev' : 'events' }}
                    </span>
                  </td>
                  <td>
                    @if (r.timeWindowMinutes > 0) {
                      <span>{{ r.timeWindowMinutes }} mins</span>
                    } @else {
                      <span class="text-muted">Instant</span>
                    }
                  </td>
                  <td>
                    <input type="number" [(ngModel)]="r.scoreWeight" class="mini-input" min="5" max="50" [disabled]="!canManageSettings()">
                    <span class="unit-label">pts</span>
                  </td>
                  <td>
                    <label class="switch">
                      <input type="checkbox" [(ngModel)]="r.enabled" [disabled]="!canManageSettings()">
                      <span class="slider"></span>
                    </label>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </article>

      <!-- System Preferences -->
      <div class="settings-grid">
        <article class="panel">
          <div class="panel-heading">
            <h2>Risk Scoring Thresholds</h2>
          </div>
          <div class="setting-item">
            <div>
              <b>Critical Risk Threshold</b>
              <small>Transactions scoring at or above this mark are blocked.</small>
            </div>
            <input type="number" value="80" class="mini-input" [disabled]="!canManageSettings()">
          </div>
          <div class="setting-item">
            <div>
              <b>High Risk Threshold</b>
              <small>Flagged for immediate compliance investigation.</small>
            </div>
            <input type="number" value="60" class="mini-input" [disabled]="!canManageSettings()">
          </div>
          <div class="setting-item">
            <div>
              <b>Medium Risk Threshold</b>
              <small>Triggers automated verification challenges.</small>
            </div>
            <input type="number" value="30" class="mini-input" [disabled]="!canManageSettings()">
          </div>
        </article>

        <article class="panel">
          <div class="panel-heading">
            <h2>Academic Project Metadata</h2>
          </div>
          <dl class="meta-list">
            <dt>Project Name</dt>
            <dd>BANKGUARD</dd>
            <dt>Development Group</dt>
            <dd>Group 10 (Main Project)</dd>
            <dt>Team Members</dt>
            <dd>Pratik Bairagi, Tanvesh Yeole, Vikas Kusmude, Pratik Hirve, Atharva Deshmukh</dd>
            <dt>Technology Stack</dt>
            <dd>Angular 21 · TypeScript · RxJS · Chart.js · Node.js/Express</dd>
          </dl>
        </article>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .success-alert {
      background: #e9f8f0;
      color: #168a5c;
      border: 1px solid #b8ebd5;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
    }

    .rule-desc-cell {
      max-width: 320px;
      white-space: normal;
    }
    .rule-desc-cell b {
      display: block;
      color: #172b4d;
      font-size: 11px;
    }
    .rule-desc-cell small {
      display: block;
      color: #687589;
      font-size: 10px;
      margin-top: 2px;
    }

    .mini-input {
      width: 80px;
      border: 1px solid #e8ecf2;
      border-radius: 5px;
      padding: 5px 8px;
      font-size: 11px;
      color: #172b4d;
      outline: none;
    }
    .unit-label {
      font-size: 10px;
      color: #98a2b3;
      margin-left: 4px;
    }
    .text-muted {
      color: #98a2b3;
      font-size: 10px;
    }

    /* Switch toggle */
    .switch {
      position: relative;
      display: inline-block;
      width: 36px;
      height: 20px;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background-color: #cbd5e1;
      transition: .2s;
      border-radius: 20px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .2s;
      border-radius: 50%;
    }
    input:checked + .slider {
      background-color: #315fcb;
    }
    input:checked + .slider:before {
      transform: translateX(16px);
    }

    .settings-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f2f5;
    }
    .setting-item:last-child {
      border-bottom: 0;
    }
    .setting-item b {
      display: block;
      font-size: 11px;
      color: #172b4d;
    }
    .setting-item small {
      display: block;
      font-size: 10px;
      color: #98a2b3;
      margin-top: 2px;
    }

    .meta-list {
      display: grid;
      grid-template-columns: 130px 1fr;
      gap: 10px;
      margin: 0;
      font-size: 11px;
    }
    .meta-list dt {
      color: #98a2b3;
    }
    .meta-list dd {
      color: #172b4d;
      font-weight: 600;
      margin: 0;
    }

    @media (max-width: 800px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .meta-list {
        grid-template-columns: 1fr;
        gap: 4px;
      }
      .meta-list dt {
        margin-top: 6px;
      }
      .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }

    .read-only-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: #f1f5f9;
      color: #64748b;
      font-size: 11px;
      font-weight: 700;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
    }
  `]
})
export class SettingsComponent {
  private mockData = inject(MockDataService);
  private auditService = inject(AuditLogService);
  private authService = inject(AuthService);

  canManageSettings = computed(() => this.authService.hasPermission('settings.manage'));

  rules = signal<DetectionRule[]>([...this.mockData.detectionRules]);
  saveSuccessMessage = signal('');

  saveAllSettings(): void {
    this.auditService.log({
      userId: this.authService.user()?.id || 'USR-001',
      userName: this.authService.user()?.fullName || 'Admin',
      action: 'RULE_UPDATE',
      target: 'DetectionRules',
      targetId: 'ALL',
      details: 'Updated detection rule thresholds and score weights'
    });

    this.saveSuccessMessage.set('Fraud engine rules calibrated and saved successfully to session.');
    setTimeout(() => this.saveSuccessMessage.set(''), 4000);
  }
}

