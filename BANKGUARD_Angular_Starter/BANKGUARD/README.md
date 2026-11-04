# BANKGUARD — Banking Operation & Fraud Monitoring Dashboard

**A Collaborative College Main Project developed by Group 10**

---

### Project Metadata & Team Members (Group 10)

| No. | Member Name | Key Module Contributions |
|-----|-------------|--------------------------|
| 1 | **Pratik Dharmendra Bairagi** | Transaction Management Module & CSV Data Export Engines |
| 2 | **Tanvesh Yogesh Yeole** | Explainable Rule-Based Fraud Detection Engine & Scoring Algorithms |
| 3 | **Vikas Sopan Kusmude** | Fraud Alert Queue, Investigation Notes & Alert Lifecycle Workflows |
| 4 | **Pratik Abasaheb Hirve** | Customer KYC Profiles & Multi-Type Bank Account Ledger System |
| 5 | **Atharva Milind Deshmukh** | Project Architecture, Dashboard Analytics (Chart.js), Express REST API & RBAC Security |

---

## 1. Executive Summary

- ?? **Live Demo URL**: [https://atharva1811.github.io/HCL-Tech/](https://atharva1811.github.io/HCL-Tech/)
- ?? **GitHub Repository**: [https://github.com/Atharva1811/HCL-Tech](https://github.com/Atharva1811/HCL-Tech)

**BANKGUARD** is an enterprise-grade banking operations and explainable fraud detection web application built with Angular 21, TypeScript, Chart.js, and Node.js. It bridges core retail banking operations (account management, customer KYC, transaction processing) with an automated rule-based fraud detection engine that evaluates every financial transaction in real-time.

Unlike opaque black-box machine learning systems, BANKGUARD provides **explainable fraud detection**: every flagged incident explicitly details *which specific detection rules triggered the alert, the calculated risk score (0–100), and a plain-language justification* for compliance auditors.

---

## 2. Architecture & Design System

The system follows the original polished banking dashboard design system:
- **Consistent Visual Identity**: `#315fcb` core banking blue, crisp `#ffffff` cards on `#f5f7fb` workspace, subtle `#e9edf3` borders.
- **Color-Coded Status Tokens**:
  - `Completed / Active`: Emerald green (`#e9f8f0`, `#168a5c`)
  - `Pending / Under Review`: Amber warning (`#fff8e8`, `#b78a26`)
  - `Critical Alert / Blocked`: Crimson danger (`#fff0ef`, `#d95b56`)
- **Responsive Layout Shell**:
  - Collapsible Sidebar with navigation and active incident counters
  - Sticky Topbar with simulated environment pulse, dynamic breadcrumbs, notification center, and user profile drawer
  - Full-width scrollable analytical data tables with pagination and column sorting

---

## 3. Implemented Modules & Functional Routes

| Module | Route | Key Capabilities |
|--------|-------|------------------|
| **Authentication** | `/login` | Role-based login (Super Admin, Bank Admin, Investigator, Auditor), demo quick-fill presets, protected route guards |
| **Dashboard Overview** | `/dashboard` | 6 KPI metric cards, Chart.js volume trend line, transaction type donut, success vs fail stacked bars, payment channel horizontal bars, recent transactions |
| **Transactions** | `/transactions` | Filter by status, payment method, transaction type, risk level; instant keyword search; sortable headers; pagination; CSV download |
| **Transaction Detail** | `/transactions/:id` | Sender/recipient details, lifecycle timeline, fraud gauge, triggered rules list, administrative status change actions with audit justifications |
| **Fraud Monitoring** | `/fraud-monitoring` | Split console: prioritized alert queue on left, investigation workspace on right. Assign analysts, add investigation notes, mark investigating, dismiss false positive with justification, resolve |
| **Fraud Alerts** | `/fraud-alerts` | Severity breakdown strip (Critical, High, Medium, Low), incident inventory, drawer with notes and timeline |
| **Customers** | `/customers` | Customer directory, Add Customer modal with validation, risk classification, KYC status |
| **Customer Detail** | `/customers/:id` | KYC dossier, editable fields, linked bank accounts, customer transaction history |
| **Bank Accounts** | `/accounts` | Masked account numbers, simulated balance ledger, branch/IFSC codes, status filters |
| **Account Detail** | `/accounts/:id` | Balance overview, operational freeze/suspend modal, linked account transaction history |
| **Reports & Analytics** | `/reports` | Daily, Monthly, Fraud, Failed, Investigator reports; interactive Chart.js visualization; print-ready styling; filter-aware CSV export |
| **User Management** | `/user-management` | Internal staff roster, role assignment, active/disabled status toggling, Add Staff modal |
| **Audit Logs** | `/audit-logs` | Tamper-evident administrative audit trail with timestamps, user IDs, action tags, target entities, and IP addresses |
| **Settings** | `/settings` | Real-time calibration of fraud detection thresholds, score weights, and rule enable toggles |

---

## 4. Explainable Fraud Detection Algorithm

The engine scores transactions based on 6 configurable heuristic rules:

$$\text{Final Score} = \min\left(100, \sum_{i=1}^{n} \text{Weight}_i \times \mathbb{I}(\text{Rule}_i \text{ triggered})\right)$$

| Rule ID | Rule Name | Condition | Score Weight |
|---------|-----------|-----------|:------------:|
| `RULE-01` | **High-Value Transaction** | $\text{Amount} \ge ₹1,00,000$ | **+20** |
| `RULE-02` | **Rapid Transactions** | $\ge 3$ transactions in 60 minutes | **+25** |
| `RULE-03` | **Unusual Location** | Originates from unverified or foreign location | **+30** |
| `RULE-04` | **Multiple Failed Attempts** | $\ge 2$ consecutive failed attempts | **+20** |
| `RULE-05` | **Unusual Spending Behaviour** | $> 200\%$ deviation from historical average | **+25** |
| `RULE-06` | **Suspicious Frequency** | $\ge 5$ transactions in a 24-hour cycle | **+20** |

### Risk Classification Scale:
- **0 – 29: Low Risk** (Green) — Normal retail behavior; auto-approved.
- **30 – 59: Medium Risk** (Amber) — Minor anomaly; monitored.
- **60 – 79: High Risk** (Orange) — Placed *Under Review*; analyst investigation queued.
- **80 – 100: Critical Risk** (Red) — Transaction auto-blocked; account restricted.

---

## 5. Backend REST API & Database Schema

The Node.js Express server is located in `/server` and exposes:
- `POST /api/auth/login` — Administrative authentication
- `GET /api/health` — Health check status
- `GET /api/rules` — Fetch active fraud detection rules
- `PUT /api/rules/:id` — Update thresholds and score weights
- `POST /api/fraud/evaluate` — Stateless transaction risk scoring engine

The PostgreSQL database is defined in `/server/prisma/schema.prisma` covering:
- `User`, `Customer`, `BankAccount`, `Transaction`, `FraudAlert`, `InvestigationNote`, `DetectionRule`, and `AuditLog`.

---

## 6. How to Run Locally

### Requirements:
- Node.js 18+ or 20+
- npm 9+

### Frontend (Angular 21):
```bash
# Navigate to project directory
cd BANKGUARD

# Start dev server
npm start
```
Open **`http://localhost:4200`** in your browser.

**Demo Credentials**:
- Super Admin: `admin` / `admin123`
- Banking Admin: `pratik.b` / `admin123`
- Fraud Investigator: `tanvesh.y` / `admin123`
- Auditor: `auditor` / `admin123`

### Run Automated Tests:
```bash
node tests/fraud-engine.test.js
```

---

## 7. Important Demonstration Disclaimer

All customer identities, account numbers, transactions, risk metrics, and detection thresholds in this application are **synthetic demonstration data** generated for college main project evaluation. No connection to real banking APIs or live payment gateways is established.
