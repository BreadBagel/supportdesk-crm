# SupportDesk CRM — Comprehensive Technical Documentation

Welcome to the technical specification and architectural documentation for **SupportDesk CRM**. This document provides an end-to-end breakdown of the system design, data schema, role-based access control (RBAC), REST API endpoints, frontend state architecture, and integration guidelines.

---

## 📑 Table of Contents

1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Role-Based Access Control (RBAC) Matrix](#2-role-based-access-control-rbac-matrix)
3. [Database & Data Schema Reference](#3-database--data-schema-reference)
4. [REST API Specifications](#4-rest-api-specifications)
   - [Authentication Endpoints (`/api/auth`)](#authentication-endpoints-apiauth)
   - [Dashboard Endpoints (`/api/dashboard`)](#dashboard-endpoints-apidashboard)
   - [Support Tickets Endpoints (`/api/tickets`)](#support-tickets-endpoints-apitickets)
   - [Customer CRM Endpoints (`/api/customers`)](#customer-crm-endpoints-apicustomers)
   - [User Management Endpoints (`/api/users`)](#user-management-endpoints-apiusers)
5. [Frontend State & Component Architecture](#5-frontend-state--component-architecture)
6. [Security & Authentication Flow](#6-security--authentication-flow)
7. [Extensibility & Production Migration Guide](#7-extensibility--production-migration-guide)

---

## 1. System Overview & Architecture

SupportDesk CRM is designed as a unified full-stack web application that combines an Express backend server with a Vite-powered React single-page application (SPA).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Client Layer (Browser SPA)                      │
│   React 19 + TypeScript + Tailwind CSS v4 + Motion + Lucide React      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST Requests (JWT in Auth Header)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Server Layer (Express Node.js)                   │
│   • Auth / JWT Middleware        • Security & Role Validator           │
│   • Router Controllers           • Request Payload Validation          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Read / Write Operations
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Data Persistence Layer (Disk JSON DB)                │
│   data/db.json (Auto-generates initial schema & sample dataset)        │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Characteristics
* **Monolithic Full-Stack Packaging**: Express serves both API routes under `/api/*` and acts as the development host via Vite middleware (in development mode) or static file provider (in production mode).
* **Stateless Token Authentication**: User sessions are authenticated using JSON Web Tokens (JWT) passed via HTTP `Authorization: Bearer <token>` headers.
* **Role-Scoped Data Filtering**: Customer users automatically receive scoped responses containing only their linked organization's tickets and contact record, preventing cross-tenant data exposure.

---

## 2. Role-Based Access Control (RBAC) Matrix

SupportDesk CRM enforces strict access rules across three user roles:

* **ADMIN**: System Administrator with full operational control over users, staff roles, tickets, customer CRM records, and global analytics.
* **AGENT**: Customer Support Agent with full access to view, update, assign, and respond to all customer tickets and CRM profiles.
* **CUSTOMER**: End customer account restricted to submitting new support tickets, viewing/editing their own support requests, and commenting on active threads.

| Feature / Resource | Action / Operation | ADMIN | AGENT | CUSTOMER |
| :--- | :--- | :---: | :---: | :---: |
| **Authentication** | Register new Customer account | ✅ | ✅ | ✅ |
| | Login via Password / 1-Click Demo | ✅ | ✅ | ✅ |
| **Dashboard** | View Global Ticket Statistics | ✅ | ✅ | Scoped |
| | View Priority & Category Charts | ✅ | ✅ | Scoped |
| **Tickets** | View All Tickets | ✅ | ✅ | ❌ |
| | View Own / Company Tickets | ✅ | ✅ | ✅ |
| | Create New Support Ticket | ✅ | ✅ | ✅ |
| | Update Subject / Description | ✅ | ✅ | Own Tickets |
| | Update Status / Priority / Category | ✅ | ✅ | ❌ |
| | Assign / Reassign Support Agent | ✅ | ✅ | ❌ |
| | Delete Ticket | ✅ | ✅ | Own Tickets |
| **Ticket Comments** | View Comment Thread | ✅ | ✅ | Own Tickets |
| | Post Comment / Response | ✅ | ✅ | Own Tickets |
| **Customer CRM** | View All Customer Profiles | ✅ | ✅ | ❌ |
| | View Own Customer Profile | ✅ | ✅ | ✅ |
| | Create / Edit Customer Profile | ✅ | ✅ | ❌ |
| | Delete Customer Profile | ✅ | ✅ | ❌ |
| **User Administration**| View All Users | ✅ | ❌ | ❌ |
| | Create Admin / Agent / Customer Staff | ✅ | ❌ | ❌ |
| | Promote / Demote User Role | ✅ | ❌ | ❌ |
| | Delete User Account | ✅ | ❌ | ❌ |

---

## 3. Database & Data Schema Reference

The system utilizes a file-backed JSON store at `data/db.json`. Below are the TypeScript models representing the database schema:

```typescript
// Role & Status Enums
export type UserRole = 'ADMIN' | 'AGENT' | 'CUSTOMER';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'TECHNICAL' | 'BILLING' | 'ACCOUNT' | 'FEATURE_REQUEST' | 'GENERAL';

// User Account Entity
export interface UserRecord {
  id: string;             // e.g. "usr-admin-1"
  name: string;           // e.g. "Alex Rivera"
  email: string;          // e.g. "admin@supportdesk.com"
  passwordHash: string;   // Bcrypt hash
  role: UserRole;         // ADMIN | AGENT | CUSTOMER
  createdAt: string;      // ISO 8601 Timestamp
  customerId?: string;    // Foreign key to CustomerRecord (if role === CUSTOMER)
}

// Customer CRM Entity
export interface CustomerRecord {
  id: string;             // e.g. "cust-1"
  name: string;           // Primary contact name
  email: string;          // Contact email
  phone: string;          // Phone number
  company: string;        // Company / Organization name
  notes?: string;         // Internal CRM account notes
  createdAt: string;      // ISO 8601 Timestamp
}

// Support Ticket Entity
export interface TicketRecord {
  id: string;             // Ticket ID format: "TICK-1001"
  subject: string;        // Short summary title
  description: string;    // Detailed problem report
  priority: TicketPriority; // LOW | MEDIUM | HIGH | URGENT
  status: TicketStatus;     // OPEN | IN_PROGRESS | PENDING | RESOLVED | CLOSED
  category: TicketCategory; // TECHNICAL | BILLING | ACCOUNT | FEATURE_REQUEST | GENERAL
  customerId: string;     // Foreign key to CustomerRecord
  assignedAgentId: string | null; // Foreign key to UserRecord (AGENT/ADMIN)
  createdById: string;    // Foreign key to UserRecord
  createdAt: string;      // ISO 8601 Timestamp
  updatedAt: string;      // ISO 8601 Timestamp
}

// Ticket Comment Entity
export interface TicketCommentRecord {
  id: string;             // e.g. "cmnt-1"
  ticketId: string;       // Foreign key to TicketRecord
  userId: string;         // Author user ID
  userName: string;       // Author display name
  userRole: UserRole;     // Author role
  content: string;        // Comment body text
  createdAt: string;      // ISO 8601 Timestamp
}
```

---

## 4. REST API Specifications

All API endpoints are prefixed with `/api`. Protected routes require the `Authorization: Bearer <JWT_TOKEN>` header.

### Authentication Endpoints (`/api/auth`)

#### `POST /api/auth/login`
Authenticates user credentials and returns a JWT token.
* **Request Body**:
  ```json
  {
    "email": "admin@supportdesk.com",
    "password": "admin123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "usr-admin-1",
      "name": "Alex Rivera",
      "email": "admin@supportdesk.com",
      "role": "ADMIN",
      "createdAt": "2026-07-07T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### `POST /api/auth/register`
Self-service customer registration. Automatically creates both a `UserRecord` and a linked `CustomerRecord`.
* **Request Body**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane.smith@company.com",
    "password": "securepassword123",
    "company": "Acme Global",
    "phone": "+1 (555) 987-6543"
  }
  ```
* **Success Response (201 Created)**: Returns `{ user, token }`.

#### `GET /api/auth/me`
Fetches current authenticated user details from the JWT token.
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**: `{ "user": { ... } }`

#### `POST /api/auth/demo-login`
One-click authentication for quick demo testing without typing credentials.
* **Request Body**: `{ "role": "ADMIN" }` (or `"AGENT"`, `"CUSTOMER"`)
* **Success Response (200 OK)**: Returns `{ user, token }`.

---

### Dashboard Endpoints (`/api/dashboard`)

#### `GET /api/dashboard/stats`
Fetches aggregate metric metrics for top-level cards and breakdown charts.
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "totalCustomers": 5,
    "totalTickets": 7,
    "openTickets": 2,
    "inProgressTickets": 2,
    "pendingTickets": 1,
    "resolvedTickets": 1,
    "closedTickets": 1,
    "urgentTickets": 2,
    "ticketsByPriority": { "LOW": 2, "MEDIUM": 1, "HIGH": 2, "URGENT": 2 },
    "ticketsByCategory": { "TECHNICAL": 2, "BILLING": 1, "ACCOUNT": 2, "FEATURE_REQUEST": 1, "GENERAL": 1 },
    "recentTickets": [ ... ]
  }
  ```

---

### Support Tickets Endpoints (`/api/tickets`)

#### `GET /api/tickets`
Lists and filters support tickets. Supports query parameter filtering.
* **Query Parameters**:
  * `q` *(optional)*: Search string matching Ticket ID, Subject, or Customer Name/Company.
  * `status` *(optional)*: `OPEN` | `IN_PROGRESS` | `PENDING` | `RESOLVED` | `CLOSED`
  * `priority` *(optional)*: `LOW` | `MEDIUM` | `HIGH` | `URGENT`
  * `category` *(optional)*: `TECHNICAL` | `BILLING` | `ACCOUNT` | `FEATURE_REQUEST` | `GENERAL`
* **Success Response (200 OK)**: Array of expanded `Ticket` objects including `customerName`, `assignedAgentName`, and `commentsCount`.

#### `GET /api/tickets/:id`
Retrieves single ticket details including expanded customer/agent relations.

#### `POST /api/tickets`
Creates a new support ticket.
* **Request Body**:
  ```json
  {
    "subject": "Unable to export monthly invoice PDF",
    "description": "Clicking export button results in HTTP 500 error",
    "priority": "HIGH",
    "category": "BILLING",
    "customerId": "cust-2",
    "assignedAgentId": "usr-agent-1"
  }
  ```

#### `PUT /api/tickets/:id`
Updates an existing ticket's attributes (status, priority, agent assignment, or subject/description).
* **Note**: Updating `status` or `assignedAgentId` automatically posts an audit log entry to the ticket comment thread.

#### `DELETE /api/tickets/:id`
Deletes a ticket and cleans up associated comments.

#### `GET /api/tickets/:id/comments`
Fetches discussion thread and system logs for the specified ticket.

#### `POST /api/tickets/:id/comments`
Adds a new comment or staff response to the ticket thread.
* **Request Body**: `{ "content": "I have escalated this issue to our billing dev team." }`

---

### Customer CRM Endpoints (`/api/customers`)

#### `GET /api/customers`
Retrieves customer list annotated with total active ticket count (`ticketCount`).

#### `GET /api/customers/:id`
Retrieves customer profile along with their full ticket submission history.

#### `POST /api/customers` *(ADMIN & AGENT only)*
Creates a new customer profile.

#### `PUT /api/customers/:id` *(ADMIN & AGENT only)*
Updates customer details (Name, Email, Phone, Company, Notes).

#### `DELETE /api/customers/:id` *(ADMIN & AGENT only)*
Deletes a customer profile.

---

### User Management Endpoints (`/api/users`)

#### `GET /api/users` *(ADMIN only)*
Lists all registered user accounts (password hashes excluded).

#### `POST /api/users` *(ADMIN only)*
Creates a new staff account (Admin or Agent) or Customer user.

#### `PUT /api/users/:id/role` *(ADMIN only)*
Promotes or demotes a user's access role (`ADMIN`, `AGENT`, `CUSTOMER`). Includes safety check preventing demotion of the final remaining Administrator account.

#### `DELETE /api/users/:id` *(ADMIN only)*
Deletes a user account. Includes safety check preventing self-deletion while logged in.

---

## 5. Frontend State & Component Architecture

The React frontend utilizes React 19 Context for global state and hooks for localized component state:

```
src/
├── context/
│   └── AuthContext.tsx    # Manages current user state, JWT storage, login/logout, demo logins
├── components/
│   ├── Navbar.tsx         # Top application header with brand & user profile controls
│   ├── Sidebar.tsx        # Responsive navigation sidebar with tab switching
│   ├── Badge.tsx          # StatusBadge, PriorityBadge, CategoryBadge color-coded indicators
│   └── StatCard.tsx       # Reusable metric statistic card with trending indicators
└── pages/
    ├── DashboardPage.tsx  # KPI statistics summary, status breakdowns, recent activity table
    ├── TicketsPage.tsx    # Multi-tab status filter, search input, and create modal
    ├── TicketDetailPage.tsx# Full ticket detail view, status editor, agent assignment & comments
    ├── CustomersPage.tsx  # CRM directory view, company filter, customer detail modal
    ├── UsersPage.tsx      # Admin user management table, role toggle, create user modal
    ├── LoginPage.tsx      # Authentication form with 1-click quick demo accounts
    └── RegisterPage.tsx   # Self-service customer account registration form
```

---

## 6. Security & Authentication Flow

1. **Password Security**: Passwords are hashed using `bcryptjs` with a cost factor of 10 prior to storage.
2. **JWT Authorization**: Upon authentication, a signed JWT containing `{ id, email, role, name, customerId }` is generated with a 7-day expiration time.
3. **HTTP Header Interception**: Client API calls automatically attach the JWT token via `Authorization: Bearer <TOKEN>` stored in browser `localStorage`.
4. **Middleware Protection**:
   * `authenticateToken`: Decodes JWT, validates token expiration, and checks user existence in `data/db.json`.
   * `requireRole([...allowedRoles])`: Restricts route access to specific roles (e.g., ADMIN-only user management).

---

## 7. Extensibility & Production Migration Guide

### Migrating to Cloud SQL / PostgreSQL / Firestore
To replace the default file-based `data/db.json` store with a production relational database (e.g. PostgreSQL / Drizzle ORM or Firestore):
1. Replace `server/db.ts` methods (`getTickets`, `createTicket`, etc.) with database query functions.
2. Maintain the same interface parameters to keep Express route handlers unchanged.

### Adding Gemini AI Support Capabilities
To integrate automated ticket sentiment analysis or AI-suggested agent responses:
1. Initialize `@google/genai` in `server/routes/ticketRoutes.ts` using `process.env.GEMINI_API_KEY`.
2. Add a `/api/tickets/:id/ai-suggest` endpoint to draft resolution steps based on ticket description and previous comments.

---
*Documentation compiled for SupportDesk CRM.*
