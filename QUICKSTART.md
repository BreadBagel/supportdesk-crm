# SupportDesk CRM — Quick Start Guide

Welcome to **SupportDesk CRM**! This guide will walk you through launching the application and exploring its core workflows in under 5 minutes.

---

## ⚡ 60-Second Quick Start (Instant Demo)

The fastest way to explore SupportDesk CRM is by using the **1-Click Demo Login** presets on the login screen.

1. Open the application in your browser (`http://localhost:3000`).
2. On the login screen, click any of the **1-Click Demo Quick Login** preset buttons:

   * 🛡️ **Admin**: Log in as System Administrator (*Alex Rivera*)
   * 🧑‍💻 **Agent**: Log in as Support Staff (*Sarah Connor*)
   * 👤 **Customer**: Log in as Client User (*John Doe*)

---

## 👥 Role-Based Step-by-Step Workflows

---

### 1. 👤 Customer Workflow: Submitting & Tracking Tickets

As a Customer, you can submit technical or billing inquiries and track their resolution in real time.

#### **A. Submitting a New Support Ticket**
1. Click the **"+ New Ticket"** button in the sidebar or top header.
2. Fill out the ticket details:
   * **Subject**: Brief summary (e.g., *"Cannot download invoice PDF"*).
   * **Category**: Choose `Technical`, `Billing`, `Account`, `Feature Request`, or `General`.
   * **Priority**: Choose `Low`, `Medium`, `High`, or `Urgent`.
   * **Description**: Detailed explanation of your issue.
3. Click **"Submit Ticket"**. Your ticket will be assigned a tracking ID (e.g., `TICK-1008`).

#### **B. Communicating with Support Agents**
1. Navigate to **Support Tickets** from the left navigation bar.
2. Click on any ticket to open its **Ticket Details View**.
3. Scroll down to the **Discussion & Activity Log** section.
4. Type your response in the comment field and click **"Post Comment"** to reply directly to support agents.

---

### 2. 🧑‍💻 Support Agent Workflow: Managing & Resolving Tickets

As a Support Agent, you can process incoming customer requests, assign tickets, update status, and communicate with clients.

#### **A. Viewing & Organizing Tickets (Table & Kanban Board)**
1. Go to **Support Tickets** in the main menu.
2. Switch between **Table View** and **Kanban Board** using the view toggles.
3. Use the search bar to filter tickets by **ID**, **Subject**, or **Customer Name**.
4. Use the filter dropdowns to narrow down by **Status**, **Priority**, or **Category**.

#### **B. Claiming & Updating a Ticket**
1. Click on an unassigned ticket.
2. In the ticket detail header:
   * **Assigned Agent**: Select yourself or another team member from the dropdown.
   * **Status**: Update the lifecycle stage (`Open` → `In Progress` → `Pending` → `Resolved` → `Closed`).
   * **Priority**: Change priority if the issue requires immediate escalation (`High` / `Urgent`).
3. Posting a comment or changing the status automatically logs a system audit record in the discussion thread.

---

### 3. 🛡️ Administrator Workflow: CRM & Staff Management

As an Administrator, you have full access to global analytics, user account roles, and customer CRM profiles.

#### **A. Executive Dashboard Metrics**
1. Click **Dashboard** in the top navigation bar.
2. View key performance indicators:
   * Total active customers & total tickets.
   * Open, Pending, and Urgent issue tallies.
   * Visual charts breaking down tickets by **Priority Level** and **Category**.
   * Recent Activity Stream highlighting newly created or updated tickets.

#### **B. Managing Customer CRM Profiles**
1. Click **Customer CRM** in the sidebar.
2. Click **"+ Add Customer"** to register a new client company or contact.
3. Click on any customer card to view their complete contact details and full ticket submission history.

#### **C. Managing Staff & User Roles**
1. Click **User Accounts** in the sidebar (Admin only).
2. Click **"+ Register Staff"** to create a new team member account.
3. Use the **Role Selector** on any user row to promote or demote permissions between `Admin`, `Agent`, and `Customer`.

---

## 💻 Running the Application Locally

If you are setting up the project on your local developer machine:

### 1. Prerequisites
Ensure you have **Node.js 18+** installed:
```bash
node -v
```

### 2. Installation
```bash
# Clone the repository and install packages
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 4. Build for Production
```bash
# Compile client assets and bundle Express backend
npm run build

# Launch production server
npm run start
```

---

## 💡 Pro-Tips & Shortcuts

* **Quick Demo Reset**: To reset the demo data back to its default state, simply restart the Node server process or re-run `npm run dev`.
* **Dark Mode Visuals**: SupportDesk CRM is designed with a dark workspace theme optimized for support operations.
* **Audit Trail**: Every status change and agent assignment is timestamped in the ticket comment thread for complete compliance tracking.

---
*For full API and data schema documentation, check out [DOCUMENTATION.md](./DOCUMENTATION.md).*
