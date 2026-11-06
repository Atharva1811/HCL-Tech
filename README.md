# BANKGUARD — Banking Operation & Fraud Monitoring Platform

> **A Collaborative College Main Project developed by Group 10**  
> **Live Demo (GitHub Pages)**: [https://atharva1811.github.io/HCL-Tech/](https://atharva1811.github.io/HCL-Tech/)  
> **GitHub Repository**: [https://github.com/Atharva1811/HCL-Tech.git](https://github.com/Atharva1811/HCL-Tech.git)

---

## 1. Project Title — BANKGUARD

**BANKGUARD** (Project Title: *Banking Operation & Fraud Monitoring Dashboard*) is a comprehensive enterprise banking intelligence platform. It seamlessly combines day-to-day core banking administrative workflows (customer KYC dossiers, accounts ledger, multi-channel payment processing) with a transparent, explainable rule-based fraud detection engine that scores incoming transactions and generates actionable investigation alerts in real-time.

---

## 2. Project Overview

Modern financial institutions process millions of retail and institutional transactions daily across heterogeneous payment channels (UPI, IMPS, NEFT, RTGS, Cards, and Cash). Ensuring transactional velocity while guarding against account takeovers, smurfing, velocity spikes, and money laundering requires a robust operational desk.

BANKGUARD addresses this challenge with an Angular 21 standalone client architecture paired with an Express REST API backend and Prisma schema. Rather than treating fraud detection as an opaque black box, BANKGUARD implements an **explainable scoring engine**: every flagged transaction displays exactly which heuristics were breached, the weighted points assigned, and plain-language audit justifications.

---

## 3. Problem Statement

Financial fraud detection systems in modern banking environments face three major obstacles:
1. **The "Black Box" Dilemma**: Machine learning models often produce risk scores without transparent reasoning, creating legal and regulatory friction for compliance officers who must justify freezing a customer's funds.
2. **Operational Silos**: Banking operations (customer dossiers, account freezes) and security desks (fraud alert queues, forensic notes) frequently operate in disconnected software tools, delaying critical response times.
3. **Responsive Accessibility**: Banking administrative consoles are traditionally built for desktop workstations, causing severe layout breakage, horizontal overflow, and unresponsiveness when audited on mobile or tablet devices.

---

## 4. Project Objectives

- **Explainable Fraud Detection**: Implement configurable, deterministic heuristic rules (`RULE-01` to `RULE-06`) that calculate standardized risk scores (0–100) with clear natural-language triggers.
- **End-to-End Operational Lifecycle**: Enable full lifecycle management of transactions, accounts, and alerts—from initial flag and investigator assignment to note logging, false-positive dismissal, and resolution.
- **Strict Role-Based Access Control (RBAC)**: Support distinct internal personas: Super Admin, Banking Administrator, Fraud Investigator, and Read-Only Auditor.
- **Comprehensive Audit Trail**: Maintain an immutable administrative ledger recording every status override, account restriction, and rule threshold change with timestamps and IP addresses.
- **Flawless Multi-Viewport Responsiveness**: Guarantee zero unwanted horizontal overflow across all standard screen widths (`320px`, `375px`, `425px`, `768px`, `1024px`, `1366px`, and `1920px`).

---

## 5. Key Features (Verified in Source Code)

- **Interactive Financial Dashboard Overview**:
  - 6 KPI metric cards: Total Transaction Volume (INR), Total Transactions, Successful Transactions, Failed Transactions, Under Review/Flagged Operations, and Active Fraud Alerts with period trends.
  - 4 Dynamic Chart.js visualizations driven by application mock services:
    - 7-Day Volume Trend (Filled smooth line chart)
    - Transaction Nature Distribution (Donut chart with custom cutout)
    - Processed vs Failed Daily Statuses (Stacked bar chart)
    - Payment Channel Breakdown (Horizontal bar chart for UPI, IMPS, NEFT, RTGS, Card)
  - Recent transactions table and live alert preview.
- **Transaction Management Module**:
  - Paginated transaction data table with real-time text search across IDs, customer names, accounts, and locations.
  - Multi-parameter filtering: Status (`Completed`, `Pending`, `Under Review`, `Blocked`, `Failed`), Type, Payment Method, and Risk Level.
  - Two-way column sorting (Transaction ID, Customer, Type, Amount, Date, Risk Score).
  - Client-side CSV export engine.
- **Transaction Detail Dossier**:
  - Sender and beneficiary account mapping.
  - Three-stage cryptographically traceable lifecycle timeline.
  - Circular fraud assessment gauge with color-coded risk bands.
  - Administrative status transition modal requiring mandatory audit justification text.
- **Dual-Pane Fraud Monitoring Workspace**:
  - Prioritized alert queue with real-time status filtering.
  - Active investigation console with investigator assignment dropdown.
  - Forensic investigation notes thread with author timestamps.
  - False positive dismissal modal requiring mandatory justification.
- **Fraud Alerts Ledger**:
  - Summary metrics strip across Critical, High, Medium, and Low severity tiers.
  - Master alerts data table with expandable detail drawer for investigation histories.
- **Customer KYC Management**:
  - Customer directory with KYC statuses (`Active`, `Under Review`, `Restricted`, `Suspended`).
  - Add Customer modal with input validation.
  - Detailed customer dossier with inline profile editing, mapped bank accounts, and customer-specific transaction history.
- **Core Bank Accounts Ledger**:
  - Masked account display (`•••• 4821`), simulated balance aggregates, branch details, and IFSC routing.
  - Dedicated account detail view with balance breakdown and account restriction modal.
- **Reports & Analytics Engine**:
  - Tabbed reporting: Daily Transactions, Monthly Ledger, Fraud Incident Report, Failed Transactions, and Analyst Performance.
  - Dynamic Chart.js reconfiguration per report type.
  - Filter-aware CSV export and print-ready stylesheet optimization (`@media print`).
- **User Management & RBAC Roster**:
  - Internal staff management for Super Admin, Banking Administrator, Fraud Investigator, and Read-Only Auditor.
  - Instant account activation/deactivation toggle with audit logging.
- **Regulatory Audit Trail**:
  - Tamper-evident administrative action log recording user, action type, target entity, ID, details, IP address, and ISO timestamp.
  - Filterable by action categories with dedicated CSV export.
- **Fraud Engine Settings & Calibration**:
  - Real-time calibration of rule thresholds (INR values, time windows, event counts), score weights, and rule enable/disable switches.

---

## 6. Technology Stack

### Frontend
- **Framework**: Angular 21 (Standalone Component architecture, Signal-based reactivity)
- **Language**: TypeScript 5.9
- **Data Visualization**: Chart.js 4.5.1
- **Styling**: Native CSS3 with custom variables, CSS Grid, Flexbox, responsive off-canvas drawer navigation, and Manrope / DM Sans typography.
- **Routing**: Angular Router with functional guards (`authGuard`, `roleGuard`).

### Backend
- **Runtime Environment**: Node.js 20+
- **Server Framework**: Express 4.21.2
- **Middleware**: CORS (`cors`), JSON Body Parser
- **Deployment & Containerization**: Dockerfile, Render Blueprint (`render.yaml`)

### Database & ORM
- **Database Engine**: PostgreSQL
- **Schema & Migration ORM**: Prisma ORM 6.5.0
- **Client Fallback**: High-fidelity in-memory reactive data services for zero-dependency client demonstrations.

### Testing & Verification
- **Testing Engine**: Node.js Assert Module (`tests/fraud-engine.test.js`)
- **Coverage**: Mathematical fraud scoring, boundary conditions, location matching, failed attempt penalties, and risk level normalization.

---

## 7. System Architecture

```mermaid
flowchart TD
    subgraph Client["Angular 21 Standalone Application"]
        UI["UI Layer: Theme, Layout & Pages"]
        Shell["Layout Shell: Topbar, Collapsible Sidebar, Mobile Drawer"]
        Guards["AuthGuard & RoleGuard"]
        Signals["Signal-Based Reactive State Services"]
        Mock["MockDataService (Seeded Demonstrations)"]
    end

    subgraph Backend["Express 4 REST API (Render / Node.js)"]
        Router["Express Routing Engine"]
        AuthCtrl["Auth Controller (RBAC Bearer Tokens)"]
        TxnCtrl["Transaction & Account Controller"]
        FraudCtrl["Fraud Evaluation Engine"]
        AuditCtrl["Audit Logger"]
    end

    subgraph Database["Database Persistence"]
        Prisma["Prisma ORM 6.5"]
        Postgres[("PostgreSQL Database")]
    end

    UI --> Shell
    Shell --> Guards
    Guards --> Signals
    Signals -.-> Mock
    Signals -->|"HTTP Client (REST)"| Router
    Router --> AuthCtrl
    Router --> TxnCtrl
    Router --> FraudCtrl
    Router --> AuditCtrl
    AuthCtrl --> Prisma
    TxnCtrl --> Prisma
    FraudCtrl --> Prisma
    AuditCtrl --> Prisma
    Prisma --> Postgres
```

---

## 8. Project Directory Structure

```text
HCL-TECH/Project/
├── README.md                                    # Root comprehensive project documentation
├── render.yaml                                  # Render Cloud service blueprint
├── BANKGUARD_Angular_Starter/
│   └── BANKGUARD/
│       ├── angular.json                         # Angular CLI workspace build config
│       ├── package.json                         # Frontend dependencies & npm scripts
│       ├── tsconfig.json                        # TypeScript root configuration
│       ├── README.md                            # Inner component reference
│       ├── tests/
│       │   └── fraud-engine.test.js             # Automated test suite (5/5 passing)
│       ├── dist/
│       │   └── bankguard/                       # Production build artifact directory
│       ├── server/
│       │   ├── server.js                        # Express REST API service (Port 10000)
│       │   ├── package.json                     # Backend dependencies
│       │   ├── Dockerfile                       # Multi-stage production container
│       │   └── prisma/
│       │       └── schema.prisma                # Database models & enums
│       └── src/
│           ├── index.html                       # HTML5 entry with fonts & meta viewport
│           ├── main.ts                          # Angular application bootstrap
│           ├── styles.css                       # Global design system & responsive resets
│           └── app/
│               ├── app.component.ts             # Root component hosting router-outlet
│               ├── app.routes.ts                # Route table with auth/role guards
│               ├── core/
│               │   ├── models.ts                # Core TypeScript interfaces & types
│               │   ├── banking.models.ts        # Extended domain models
│               │   ├── guards/
│               │   │   ├── auth.guard.ts        # Authentication route protection
│               │   │   └── role.guard.ts        # RBAC route authorization
│               │   └── services/
│               │       ├── auth.service.ts      # Authentication & user session signals
│               │       ├── transaction.service.ts# Transaction state & CSV export
│               │       ├── alert.service.ts     # Fraud alert lifecycle & notes
│               │       ├── customer.service.ts  # Customer records & status management
│               │       ├── account.service.ts   # Bank accounts ledger state
│               │       ├── audit-log.service.ts # Audit log persistence
│               │       ├── notification.service.ts# Header notifications stream
│               │       └── mock-data.service.ts # High-fidelity seed records
│               ├── layout/
│               │   ├── layout.component.ts      # Shell layout with off-canvas mobile drawer
│               │   ├── sidebar.component.ts     # Collapsible navigation & badge indicators
│               │   └── topbar.component.ts      # Breadcrumbs, quick search, user menu
│               └── pages/
│                   ├── dashboard/               # Overview, KPIs & Chart.js charts
│                   ├── transactions/            # Searchable, filterable transactions
│                   ├── transaction-detail/      # Transaction dossier & timeline
│                   ├── fraud-monitoring/        # Split queue & investigation console
│                   ├── fraud-alerts/            # Alerts inventory & expanded drawer
│                   ├── customers/               # Customer KYC directory
│                   ├── customer-detail/         # KYC dossier & linked accounts
│                   ├── accounts/                # Core bank account ledger
│                   ├── account-detail/          # Account detail & restriction modal
│                   ├── reports/                 # 5 analytical reports & print styles
│                   ├── user-management/         # Staff roster & RBAC control
│                   ├── audit-logs/              # Compliance event log
│                   ├── settings/                # Rule weights & threshold calibration
│                   └── login/                   # Login screen with demo quick-fills
```

---

## 9. Application Modules & Responsibilities

| Module | Primary Responsibility | Key Files |
|--------|------------------------|-----------|
| **Auth & RBAC** | Manages credentials, tokens, demo session switching, and route protection | `auth.service.ts`, `auth.guard.ts`, `role.guard.ts`, `login.component.ts` |
| **Dashboard** | Computes live aggregates, volume trends, and renders interactive Chart.js charts | `dashboard.component.ts`, `mock-data.service.ts` |
| **Transactions** | Provides sorting, multi-column search, filtering, and CSV generation | `transactions.component.ts`, `transaction-detail.component.ts`, `transaction.service.ts` |
| **Fraud Monitoring** | Manages incident lifecycle: assignment, forensic notes, dismissal, resolution | `fraud-monitoring.component.ts`, `fraud-alerts.component.ts`, `alert.service.ts` |
| **Customer KYC** | Manages retail & corporate profiles, PAN validation, and KYC risk tiers | `customers.component.ts`, `customer-detail.component.ts`, `customer.service.ts` |
| **Bank Accounts** | Tracks masked account balances, branch routing, and operational freeze flags | `accounts.component.ts`, `account-detail.component.ts`, `account.service.ts` |
| **Reporting Desk** | Aggregates daily/monthly volumes, fraud breakdowns, and analyst metrics | `reports.component.ts` |
| **User Management** | Manages institutional staff, roles, and credential status | `user-management.component.ts` |
| **Audit Logging** | Records tamper-evident administrative action entries | `audit-logs.component.ts`, `audit-log.service.ts` |
| **Settings Engine** | Dynamically calibrates rule thresholds, scoring weights, and toggle states | `settings.component.ts` |

---

## 10. Fraud Detection Methodology

BANKGUARD's fraud detection engine uses an additive weighted heuristic scoring model with strict upper normalization:

$$\text{Risk Score} = \min\left(100, \sum_{i=1}^{n} w_i \cdot \mathbb{I}(R_i)\right)$$

Where $w_i$ is the configured point weight and $\mathbb{I}(R_i) \in \{0, 1\}$ indicates whether heuristic condition $R_i$ evaluated to true.

### Active Detection Rules

| Rule ID | Rule Name | Evaluated Heuristic Condition | Default Weight | Configurable Parameters |
|:---:|---|---|:---:|---|
| `RULE-01` | **High-Value Transaction** | Transaction amount $\ge$ configured threshold | **+20 pts** | Threshold (Default: ₹1,00,000) |
| `RULE-02` | **Rapid Transactions** | Account execution count $\ge 3$ within window | **+25 pts** | Time Window (Default: 60 mins) |
| `RULE-03` | **Unusual Location** | Originating location differs from customer historical geo-profiles | **+30 pts** | Blacklisted / Unverified Gateways |
| `RULE-04` | **Multiple Failed Attempts** | Previous failed attempts $\ge 2$ prior to execution | **+20 pts** | Failure Count Threshold (Default: 2) |
| `RULE-05` | **Unusual Behaviour** | Transaction amount exceeds historical average by $> 200\%$ | **+25 pts** | Percentage Deviation (Default: 200%) |
| `RULE-06` | **Suspicious Frequency** | Account operations $\ge 5$ within a rolling 24-hour cycle | **+20 pts** | Daily Frequency Limit (Default: 5) |

### Risk Classification Tiers

```text
  [0 ──────────── 29]          Low Risk (Green)         Auto-approved, logged in ledger.
  [30 ─────────── 59]          Medium Risk (Amber)      Monitored; secondary challenge logged.
  [60 ─────────── 79]          High Risk (Orange)       Marked 'Under Review'; analyst queued.
  [80 ────────── 100]          Critical Risk (Red)      Auto-blocked; account restriction flagged.
```

---

## 11. Database Design (Prisma Schema)

The database schema is defined in `BANKGUARD_Angular_Starter/BANKGUARD/server/prisma/schema.prisma` using PostgreSQL:

### Core Data Models
1. **`User`**: Internal staff accounts. Fields: `id`, `username` (unique), `email` (unique), `fullName`, `role` (`Role` enum), `passwordHash`, `isActive`, `lastLogin`, `createdAt`.
2. **`Customer`**: Banking customers. Fields: `id`, `customerId` (unique), `fullName`, `email` (unique), `phone`, `address`, `panNumber` (unique), `registrationDate`, `status` (`AccountStatus` enum), `riskClassification` (`RiskLevel` enum). Relations: `accounts`, `transactions`.
3. **`BankAccount`**: Mapped customer accounts. Fields: `id`, `accountNumber` (unique), `accountType`, `balance`, `status`, `branch`, `ifscCode`, `openedDate`, `customerId` (FK to `Customer`).
4. **`Transaction`**: Financial records. Fields: `id`, `transactionId` (unique), `customerId` (FK to `Customer`), `senderAccount`, `receiverAccount`, `type`, `amount`, `paymentMethod`, `location`, `status` (`TransactionStatus` enum), `riskScore`, `riskLevel` (`RiskLevel` enum), `triggeredRules` (string array), `description`, `createdAt`. Relations: `alerts`.
5. **`FraudAlert`**: Generated incident records. Fields: `id`, `alertId` (unique), `transactionId` (FK to `Transaction`), `amount`, `riskScore`, `riskLevel`, `category`, `triggeredRules`, `explanation`, `detectedAt`, `status` (`AlertStatus` enum), `assignedTo`, `dismissalJustification`, `resolvedAt`. Relations: `notes`.
6. **`InvestigationNote`**: Forensic analyst observations. Fields: `id`, `alertId` (FK to `FraudAlert`), `author`, `content`, `action`, `createdAt`.
7. **`DetectionRule`**: Dynamic rule configurations. Fields: `id`, `ruleId` (unique), `name`, `description`, `enabled`, `scoreWeight`, `threshold`, `timeWindowMinutes`, `updatedAt`.
8. **`AuditLog`**: Regulatory event log. Fields: `id`, `userId` (FK to `User`), `userName`, `action`, `target`, `targetId`, `details`, `ipAddress`, `timestamp`.

---

## 12. API Documentation

The Express backend (`BANKGUARD_Angular_Starter/BANKGUARD/server/server.js`) exposes the following endpoints:

| Method | Endpoint | Description | Sample Query / Payload |
|---|---|---|---|
| `GET` | `/` | API service metadata & operational status | — |
| `GET` | `/api/health` | Health check endpoint for uptime monitors | — |
| `POST` | `/api/auth/login` | Staff authentication with role assignment | `{"username": "admin", "password": "..."}` |
| `GET` | `/api/dashboard/stats` | Aggregate dashboard KPIs and alert counters | — |
| `GET` | `/api/transactions` | Searchable, paginated transaction ledger | `?status=Under+Review&search=Pune` |
| `GET` | `/api/transactions/:id` | Detailed transaction view with linked alerts | — |
| `PATCH` | `/api/transactions/:id/status` | Transition transaction status with audit log | `{"status": "Blocked", "reason": "Fraud"}` |
| `GET` | `/api/fraud/alerts` | List all open, investigating & resolved alerts | — |
| `GET` | `/api/fraud/alerts/:id` | Retrieve single alert dossier with note thread | — |
| `PATCH` | `/api/fraud/alerts/:id/status` | Update alert status (`Resolved`, `Dismissed`) | `{"status": "Resolved"}` |
| `POST` | `/api/fraud/alerts/:id/notes` | Append forensic investigator note to alert | `{"author": "Analyst", "content": "..."}` |
| `POST` | `/api/fraud/evaluate` | Stateless transaction risk evaluation engine | `{"amount": 150000, "location": "Unknown"}` |
| `GET` | `/api/customers` | Retrieve customer KYC directory | — |
| `GET` | `/api/customers/:id` | Customer profile, linked accounts & txns | — |
| `GET` | `/api/accounts` | Bank accounts ledger | — |
| `GET` | `/api/accounts/:id` | Account balance & linked transaction history | — |
| `GET` | `/api/rules` | Retrieve all 6 detection rule configurations | — |
| `PUT` | `/api/rules/:id` | Update rule thresholds and score weights | `{"threshold": 150000, "scoreWeight": 25}` |
| `GET` | `/api/audit-logs` | Retrieve immutable administrative audit trail | — |

---

## 13. Authentication & Authorization (RBAC)

BANKGUARD implements multi-tier Role-Based Access Control managed through `AuthService`, `authGuard`, and `roleGuard`:

### Supported Institutional Roles

1. **Super Admin** (`admin` / `atharva.d`):
   - Full read/write authority across all modules.
   - Authorized to calibrate fraud rules and override risk thresholds.
2. **Banking Administrator** (`pratik.b` / `pratik.h`):
   - Oversees customer KYC dossiers and bank account operations.
   - Authorized to freeze, restrict, or suspend bank accounts.
3. **Fraud Investigator** (`tanvesh.y` / `vikas.k`):
   - Dedicated console access to the Fraud Monitoring Workspace.
   - Authorized to assign alerts, record forensic notes, dismiss false positives, and resolve incidents.
4. **Read-Only Auditor** (`auditor`):
   - Inspection privileges over transactions, accounts, reports, and audit logs.
   - Administrative action buttons and state-changing modals are disabled.

---

## 14. Installation Prerequisites

- **Node.js**: Version `20.x` or higher (`node -v`)
- **Package Manager**: npm `10.x` or higher (`npm -v`)
- **Git**: For version control (`git --version`)
- **Web Browser**: Modern Chromium, Firefox, or WebKit browser

---

## 15. Environment Variables

Create a `.env` file inside the `BANKGUARD_Angular_Starter/BANKGUARD/server` directory for database connectivity:

```bash
# Server port configuration (Defaults to 10000 if omitted)
PORT=10000

# Node environment mode (development | production)
NODE_ENV=production

# PostgreSQL Database Connection String (Format only — never commit credentials)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

> [!CAUTION]
> Never commit `.env` files or hardcoded database passwords to version control repositories.

---

## 16. Installation and Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Atharva1811/HCL-Tech.git
cd HCL-Tech/BANKGUARD_Angular_Starter/BANKGUARD
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

---

## 17. Database Setup and Migration

To initialize the PostgreSQL database using Prisma ORM:

```bash
cd server

# Generate Prisma Client types
npx prisma generate

# Apply migrations to database schema
npx prisma migrate deploy

cd ..
```

*(Note: When running without an active PostgreSQL instance, the backend and frontend automatically operate with the seeded in-memory demonstration services).*

---

## 18. Development Commands

From `BANKGUARD_Angular_Starter/BANKGUARD`:

```bash
# Start Angular local development server (http://localhost:4200)
npm start

# Start Express backend server (http://localhost:10000)
cd server
npm start
```

### Demo Login Accounts (Password: `admin123`)
- **Super Admin**: `admin`
- **Banking Administrator**: `pratik.b`
- **Fraud Investigator**: `tanvesh.y`
- **Read-Only Auditor**: `auditor`

---

## 19. Production Build and Deployment

### Angular Production Build
```bash
cd BANKGUARD_Angular_Starter/BANKGUARD
npm run build
```
Build outputs are generated in `dist/bankguard/browser`.

### GitHub Pages Deployment
To deploy the frontend to GitHub Pages with the project repository subpath:
```bash
npx ng build --base-href /HCL-Tech/
```
The output files are copied to the `gh-pages` branch and served at `https://atharva1811.github.io/HCL-Tech/`.

### Render Cloud Backend Deployment
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Connect repository `Atharva1811/HCL-Tech`.
4. Render automatically reads `render.yaml`:
   - **Service Name**: `bankguard-backend`
   - **Environment**: Node
   - **Root Directory**: `BANKGUARD_Angular_Starter/BANKGUARD/server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Port**: `10000`
   - **Health Path**: `/api/health`

---

## 20. Testing & Verification

The project includes an automated test suite verifying mathematical fraud rule scoring and boundary conditions.

### Running Tests:
```bash
node BANKGUARD_Angular_Starter/BANKGUARD/tests/fraud-engine.test.js
```

### Verified Test Results:
```text
--------------------------------------------------
RUNNING BANKGUARD AUTOMATED TEST SUITE
--------------------------------------------------
✔ Test 1 Passed: Low-risk normal retail transaction (Score: 0, Level: Low)
✔ Test 2 Passed: High-value transaction correctly triggers RULE-01 (+20 pts)
✔ Test 3 Passed: Unusual location correctly triggers RULE-03 (+30 pts, Level: Medium)
✔ Test 4 Passed: Multiple combined rule violations trigger Critical risk classification (Score: 100/100, Level: Critical)
✔ Test 5 Passed: Failed attempt penalty applied (+20 pts)
--------------------------------------------------
ALL 5 AUTOMATED TESTS PASSED SUCCESSFULLY (5/5)
--------------------------------------------------
```

---

## 21. Screenshots & Interface Previews

| Screen | Description | Placeholder |
|---|---|:---:|
| **Dashboard Overview** | Executive summary KPI cards, Chart.js volume trends, and recent transaction table. | `[Screenshot: Dashboard Overview]` |
| **Transaction Dossier** | Lifecycle timeline, rule evaluation breakdown, and administrative status modals. | `[Screenshot: Transaction Details]` |
| **Fraud Monitoring Console** | Dual-pane investigation workspace with note trail and false-positive dismissal. | `[Screenshot: Fraud Monitoring]` |
| **Customer KYC Profiles** | Customer identity dossier, PAN verification, and linked account balances. | `[Screenshot: Customer KYC]` |
| **Responsive Mobile View** | Verified zero-overflow mobile layout with touch-friendly drawer navigation. | `[Screenshot: Mobile 375px View]` |

---

## 22. Known Limitations

- **Client Demonstration State**: While the Express backend supports full REST persistence, the standalone GitHub Pages demonstration uses Angular client signals with in-memory persistence to enable offline review without requiring an external database server.
- **Simulated Payment Gateway**: Real banking transactions interact with clearing switches (e.g. NPCI, SWIFT, Fedwire). In BANKGUARD, payment processing and status transitions are simulated for academic evaluation.
- **Location Geofencing**: IP geolocation matching evaluates against mock Indian and international gateway strings rather than live MaxMind GeoIP lookups.

---

## 23. Future Enhancements

- **Machine Learning Ensemble**: Combine rule-based explainability with an Isolation Forest or XGBoost anomaly detection model.
- **Biometric Multi-Factor Challenges**: Trigger automated WebAuthn/FIDO2 challenges when transactions score in the Medium (30–59) range.
- **Webhook & WebSocket Live Feeds**: Implement real-time server-sent events (SSE) for instant alert streaming across active investigator consoles.
- **Regulatory FinCEN / FIU-IND Export**: Generate automated Suspicious Activity Reports (SAR) formatted for financial intelligence units.

---

## 24. Academic Project Information (Group 10)

This platform was developed as a collaborative college main project by **Group 10**.

### Team Members & Module Contributions

| No. | Member Name | Key Module Contributions |
|:---:|-------------|--------------------------|
| 1 | **Pratik Dharmendra Bairagi** | Transaction Management Module & CSV Data Export Engines |
| 2 | **Tanvesh Yogesh Yeole** | Explainable Rule-Based Fraud Detection Engine & Scoring Algorithms |
| 3 | **Vikas Sopan Kusmude** | Fraud Alert Queue, Investigation Notes & Alert Lifecycle Workflows |
| 4 | **Pratik Abasaheb Hirve** | Customer KYC Profiles & Multi-Type Bank Account Ledger System |
| 5 | **Atharva Milind Deshmukh** | Project Architecture, Dashboard Analytics (Chart.js), Express REST API & RBAC Security |

---
*© 2026 BANKGUARD · Banking Intelligence Platform (Group 10)*
