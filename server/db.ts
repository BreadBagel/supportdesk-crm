import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export type UserRole = 'ADMIN' | 'AGENT' | 'CUSTOMER';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'TECHNICAL' | 'BILLING' | 'ACCOUNT' | 'FEATURE_REQUEST' | 'GENERAL';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  customerId?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes?: string;
  createdAt: string;
}

export interface TicketCommentRecord {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  createdAt: string;
}

export interface TicketRecord {
  id: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: TicketCategory;
  customerId: string;
  assignedAgentId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  customers: CustomerRecord[];
  tickets: TicketRecord[];
  comments: TicketCommentRecord[];
  ticketCounter: number;
}

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'supportdesk-crm') : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SEED_DB_FILE = path.join(process.cwd(), 'data', 'db.json');

function generateInitialData(): DatabaseSchema {
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const agentPasswordHash = bcrypt.hashSync('agent123', 10);
  const customerPasswordHash = bcrypt.hashSync('customer123', 10);

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

  const users: UserRecord[] = [
    {
      id: 'usr-admin-1',
      name: 'Alex Rivera',
      email: 'admin@supportdesk.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      createdAt: daysAgo(30),
    },
    {
      id: 'usr-agent-1',
      name: 'Sarah Jenkins',
      email: 'sarah.agent@supportdesk.com',
      passwordHash: agentPasswordHash,
      role: 'AGENT',
      createdAt: daysAgo(25),
    },
    {
      id: 'usr-agent-2',
      name: 'David Ross',
      email: 'david.agent@supportdesk.com',
      passwordHash: agentPasswordHash,
      role: 'AGENT',
      createdAt: daysAgo(20),
    },
    {
      id: 'usr-cust-1',
      name: 'John Doe',
      email: 'john.doe@techcorp.com',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      customerId: 'cust-1',
      createdAt: daysAgo(15),
    },
    {
      id: 'usr-cust-2',
      name: 'Alice Smith',
      email: 'alice.smith@innovate.io',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      customerId: 'cust-2',
      createdAt: daysAgo(10),
    },
    {
      id: 'usr-cust-3',
      name: 'Robert Chen',
      email: 'robert.chen@apex.com',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      customerId: 'cust-3',
      createdAt: daysAgo(5),
    },
  ];

  const customers: CustomerRecord[] = [
    {
      id: 'cust-1',
      name: 'John Doe',
      email: 'john.doe@techcorp.com',
      phone: '+1 (555) 234-5678',
      company: 'TechCorp Enterprise',
      notes: 'Key enterprise client. High volume API integration.',
      createdAt: daysAgo(15),
    },
    {
      id: 'cust-2',
      name: 'Alice Smith',
      email: 'alice.smith@innovate.io',
      phone: '+1 (555) 876-5432',
      company: 'Innovate.io',
      notes: 'Mid-tier SaaS customer requiring custom billing cycles.',
      createdAt: daysAgo(10),
    },
    {
      id: 'cust-3',
      name: 'Robert Chen',
      email: 'robert.chen@apex.com',
      phone: '+1 (555) 456-7890',
      company: 'Apex Solutions',
      notes: 'Recently upgraded to Business Pro plan.',
      createdAt: daysAgo(5),
    },
    {
      id: 'cust-4',
      name: 'Elena Rostova',
      email: 'elena@cloudnext.org',
      phone: '+1 (555) 901-2345',
      company: 'CloudNext Org',
      notes: 'Non-profit partner requiring SLA SLA-A support.',
      createdAt: daysAgo(3),
    },
    {
      id: 'cust-5',
      name: 'Marcus Vance',
      email: 'marcus@vancecapital.com',
      phone: '+1 (555) 678-9012',
      company: 'Vance Capital',
      notes: 'Financial services client with strict security requirements.',
      createdAt: daysAgo(1),
    },
  ];

  const tickets: TicketRecord[] = [
    {
      id: 'TICK-1001',
      subject: 'SSO Integration Failing for Azure AD OAuth',
      description: 'Our enterprise users are encountering 401 Unauthorized errors when authenticating via Azure AD single sign-on redirect.',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      category: 'TECHNICAL',
      customerId: 'cust-1',
      assignedAgentId: 'usr-agent-1',
      createdById: 'usr-cust-1',
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
    },
    {
      id: 'TICK-1002',
      subject: 'Invoice Discrepancy on July Billing Cycle',
      description: 'The monthly recurring charge includes an unexpected $120 bandwidth overage fee despite remaining within tier limits.',
      priority: 'HIGH',
      status: 'OPEN',
      category: 'BILLING',
      customerId: 'cust-2',
      assignedAgentId: 'usr-agent-2',
      createdById: 'usr-cust-2',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      id: 'TICK-1003',
      subject: 'Unable to Add Additional Team Members in Admin Portal',
      description: 'Clicking the "Invite Member" button throws a console JS TypeError: Cannot read properties of undefined.',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      category: 'ACCOUNT',
      customerId: 'cust-3',
      assignedAgentId: 'usr-agent-1',
      createdById: 'usr-cust-3',
      createdAt: daysAgo(7),
      updatedAt: daysAgo(2),
    },
    {
      id: 'TICK-1004',
      subject: 'Feature Request: Export Analytics Reports as CSV & PDF',
      description: 'We need the capability to schedule automated weekly CSV exports of our team activity logs and customer ticket resolution times.',
      priority: 'LOW',
      status: 'PENDING',
      category: 'FEATURE_REQUEST',
      customerId: 'cust-1',
      assignedAgentId: null,
      createdById: 'usr-cust-1',
      createdAt: daysAgo(6),
      updatedAt: daysAgo(5),
    },
    {
      id: 'TICK-1005',
      subject: 'API Gateway Rate Limit Exceeded during Peak Hours',
      description: 'API endpoint /api/v2/webhooks returns 429 Too Many Requests every day between 2 PM and 4 PM EST.',
      priority: 'URGENT',
      status: 'OPEN',
      category: 'TECHNICAL',
      customerId: 'cust-4',
      assignedAgentId: 'usr-agent-1',
      createdById: 'usr-admin-1',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: 'TICK-1006',
      subject: 'Security Compliance Audit Questionnaire Request',
      description: 'Please provide completed SOC2 Type II certification and latest penetration testing executive summary.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      category: 'GENERAL',
      customerId: 'cust-5',
      assignedAgentId: 'usr-agent-2',
      createdById: 'usr-admin-1',
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      id: 'TICK-1007',
      subject: 'Password Reset Link Expired Token Error',
      description: 'User reported receiving expired link error immediately upon clicking password reset email.',
      priority: 'LOW',
      status: 'CLOSED',
      category: 'ACCOUNT',
      customerId: 'cust-2',
      assignedAgentId: 'usr-agent-2',
      createdById: 'usr-cust-2',
      createdAt: daysAgo(12),
      updatedAt: daysAgo(10),
    },
  ];

  const comments: TicketCommentRecord[] = [
    {
      id: 'cmnt-1',
      ticketId: 'TICK-1001',
      userId: 'usr-cust-1',
      userName: 'John Doe',
      userRole: 'CUSTOMER',
      content: 'We noticed this started happening after yesterday night\'s OAuth gateway update.',
      createdAt: daysAgo(3),
    },
    {
      id: 'cmnt-2',
      ticketId: 'TICK-1001',
      userId: 'usr-agent-1',
      userName: 'Sarah Jenkins',
      userRole: 'AGENT',
      content: 'Thanks for reaching out John. I am reviewing the OAuth log traces for Azure AD tenant callback signatures now.',
      createdAt: daysAgo(2),
    },
    {
      id: 'cmnt-3',
      ticketId: 'TICK-1003',
      userId: 'usr-agent-1',
      userName: 'Sarah Jenkins',
      userRole: 'AGENT',
      content: 'We deployed a hotfix to patch the user invitation schema validation. Please try inviting members again!',
      createdAt: daysAgo(2),
    },
    {
      id: 'cmnt-4',
      ticketId: 'TICK-1003',
      userId: 'usr-cust-3',
      userName: 'Robert Chen',
      userRole: 'CUSTOMER',
      content: 'Confirmed working now! Added 3 new team members without issues. Thanks Sarah!',
      createdAt: daysAgo(2),
    },
  ];

  return {
    users,
    customers,
    tickets,
    comments,
    ticketCounter: 1008,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } catch (err) {
        console.error('Failed to load db.json, recreating initial schema:', err);
        this.data = generateInitialData();
        this.save();
      }
    } else if (IS_VERCEL && fs.existsSync(SEED_DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(SEED_DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        this.save();
      } catch (err) {
        console.error('Failed to load seed db.json, recreating initial schema:', err);
        this.data = generateInitialData();
        this.save();
      }
    } else {
      this.data = generateInitialData();
      this.save();
    }
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  public save() {
    this.ensureDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // --- Users ---
  public getUsers(): UserRecord[] {
    return this.data.users;
  }

  public getUserById(id: string): UserRecord | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<UserRecord, 'id' | 'createdAt'>): UserRecord {
    const newUser: UserRecord = {
      ...user,
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUserRole(id: string, role: UserRole): UserRecord | undefined {
    const user = this.getUserById(id);
    if (user) {
      user.role = role;
      this.save();
    }
    return user;
  }

  public deleteUser(id: string): boolean {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.data.users.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Customers ---
  public getCustomers(): CustomerRecord[] {
    return this.data.customers;
  }

  public getCustomerById(id: string): CustomerRecord | undefined {
    return this.data.customers.find((c) => c.id === id);
  }

  public createCustomer(customer: Omit<CustomerRecord, 'id' | 'createdAt'>): CustomerRecord {
    const newCustomer: CustomerRecord = {
      ...customer,
      id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.customers.push(newCustomer);
    this.save();
    return newCustomer;
  }

  public updateCustomer(id: string, updates: Partial<Omit<CustomerRecord, 'id' | 'createdAt'>>): CustomerRecord | undefined {
    const customer = this.getCustomerById(id);
    if (customer) {
      Object.assign(customer, updates);
      this.save();
    }
    return customer;
  }

  public deleteCustomer(id: string): boolean {
    const index = this.data.customers.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.data.customers.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Tickets ---
  public getTickets(): TicketRecord[] {
    return this.data.tickets;
  }

  public getTicketById(id: string): TicketRecord | undefined {
    return this.data.tickets.find((t) => t.id === id);
  }

  public createTicket(ticket: Omit<TicketRecord, 'id' | 'createdAt' | 'updatedAt'>): TicketRecord {
    const nextNum = this.data.ticketCounter++;
    const now = new Date().toISOString();
    const newTicket: TicketRecord = {
      ...ticket,
      id: `TICK-${nextNum}`,
      createdAt: now,
      updatedAt: now,
    };
    this.data.tickets.push(newTicket);
    this.save();
    return newTicket;
  }

  public updateTicket(id: string, updates: Partial<Omit<TicketRecord, 'id' | 'createdAt'>>): TicketRecord | undefined {
    const ticket = this.getTicketById(id);
    if (ticket) {
      Object.assign(ticket, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      this.save();
    }
    return ticket;
  }

  public deleteTicket(id: string): boolean {
    const index = this.data.tickets.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.data.tickets.splice(index, 1);
      // Clean up comments for this ticket
      this.data.comments = this.data.comments.filter((c) => c.ticketId !== id);
      this.save();
      return true;
    }
    return false;
  }

  // --- Comments ---
  public getCommentsByTicketId(ticketId: string): TicketCommentRecord[] {
    return this.data.comments.filter((c) => c.ticketId === ticketId);
  }

  public addComment(comment: Omit<TicketCommentRecord, 'id' | 'createdAt'>): TicketCommentRecord {
    const newComment: TicketCommentRecord = {
      ...comment,
      id: `cmnt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.comments.push(newComment);
    // Touch ticket updatedAt
    const ticket = this.getTicketById(comment.ticketId);
    if (ticket) {
      ticket.updatedAt = newComment.createdAt;
    }
    this.save();
    return newComment;
  }
}

export const db = new Database();
