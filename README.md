# SupportDesk CRM

**SupportDesk CRM** is a modern, full-stack Customer Relationship Management (CRM) and Support Ticketing Platform built with React, TypeScript, Express, and Tailwind CSS. It empowers teams to efficiently log, track, assign, and resolve customer support inquiries through an intuitive role-based portal with real-time analytics.

---

## 🚀 Key Features

* **🔐 Multi-Role Access Control (RBAC)**: Custom experiences and permissions tailored for **Administrators**, **Support Agents**, and **Customers**.
* **🎟️ Complete Support Ticket Lifecycle**: Track tickets through `OPEN`, `IN_PROGRESS`, `PENDING`, `RESOLVED`, and `CLOSED` statuses with priority tags (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and categories (`TECHNICAL`, `BILLING`, `ACCOUNT`, `FEATURE_REQUEST`, `GENERAL`).
* **👥 Customer Relationship Tracking**: Comprehensive CRM profile manager linking customer contacts, company details, notes, and full support history.
* **💬 Real-Time Discussion & Activity Logs**: Interactive ticket conversation threads allowing agents and customers to collaborate and view automated system audit logs.
* **📊 Analytics & Executive Dashboard**: Visual stats overview highlighting open tickets, urgent issues, distribution by category/priority, and recent activity streams.
* **🛠️ Admin User Management**: Promote/demote staff roles (`ADMIN`, `AGENT`, `CUSTOMER`), register team members, and manage access security.
* **⚡ 1-Click Demo Login Presets**: Instant pre-authenticated switching between Admin, Support Agent, and Customer roles for quick testing and demonstration.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, TypeScript, Lucide React Icons, Motion Animation, Tailwind CSS v4.
* **Backend**: Node.js, Express, JSON Web Tokens (JWT), Bcrypt password hashing.
* **Build Tools**: Vite, ESBuild, TSX runtime loader.
* **Persistence Engine**: Disk-persisted lightweight JSON database engine with automatic schema generation and sample enterprise data (`data/db.json`).

---

## ⚡ Quick Start Guide

### Prerequisites

* Node.js **v18+** or **v20+**
* npm or yarn

### Installation & Execution

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Configure `JWT_SECRET` in `.env` before starting the server.

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will boot at `http://localhost:3000`.

4. **Production Build & Execution**:
   ```bash
   # Build client bundle and bundle server into CommonJS
   npm run build

   # Start production server
   npm run start
   ```

### Deploying to Vercel

This repository includes a Vercel serverless API entry point and routing configuration. Import the repository in Vercel, keep the build command as `npm run build`, and add a strong `JWT_SECRET` environment variable. The JSON database is seeded into each function instance's temporary filesystem; use a hosted database for durable production data.

---

## 🗝️ Default Quick-Start Credentials

The application initializes with default demo accounts to explore different roles:

| Role | Email Address | Password | Demo Login Preset |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@supportdesk.com` | `admin123` | **1-Click Admin** |
| **Support Agent** | `sarah.agent@supportdesk.com` | `agent123` | **1-Click Agent** |
| **Customer** | `john.doe@techcorp.com` | `customer123` | **1-Click Customer** |

*Note: You can also register a brand new customer account on the registration page.*

---

## 📂 Project Structure

```
.
├── data/                    # JSON database storage directory (db.json)
├── server/                  # Server-side TypeScript architecture
│   ├── routes/              # Express API route handlers
│   │   ├── authRoutes.ts    # Authentication & registration endpoints
│   │   ├── customerRoutes.ts# Customer CRM management routes
│   │   ├── dashboardRoutes.ts# Analytics & aggregate statistics
│   │   ├── ticketRoutes.ts  # Ticket lifecycle & comment threads
│   │   └── userRoutes.ts    # Role management & user administration
│   ├── auth.ts              # JWT verify middleware & role guards
│   └── db.ts                # In-memory & file-backed database engine
├── src/                     # Client-side React application
│   ├── components/          # Reusable UI controls (Navbar, Sidebar, Badges, StatCards)
│   ├── context/             # Global AuthContext & state providers
│   ├── pages/               # Primary view layouts
│   │   ├── CustomersPage.tsx# CRM customer list & profile details
│   │   ├── DashboardPage.tsx# System metrics & quick navigation
│   │   ├── LoginPage.tsx    # Sign in & 1-click demo login
│   │   ├── RegisterPage.tsx # Self-service customer registration
│   │   ├── TicketDetailPage.tsx# Ticket history, status updates & comments
│   │   ├── TicketsPage.tsx  # Filterable ticket table/kanban view
│   │   └── UsersPage.tsx    # Admin staff & role management
│   ├── services/            # Axios/Fetch API wrapper layer
│   ├── App.tsx              # View router & auth conditional wrapper
│   ├── index.css            # Tailwind CSS styling directives
│   ├── main.tsx             # React DOM root entry point
│   └── types.ts             # Global TypeScript interface definitions
├── .env.example             # Template for required environment variables
├── metadata.json            # Application metadata & platform specs
├── package.json             # NPM dependencies and script commands
├── server.ts                # Primary Express server entry point & Vite middleware
└── vite.config.ts           # Vite build & bundler configuration
```

---

## 📖 Complete Documentation

For detailed technical documentation—including REST API payload specs, permission matrices, database schema diagrams, and architecture guides—refer to [DOCUMENTATION.md](./DOCUMENTATION.md).

---

## 📄 License

This project is released under the MIT License.
