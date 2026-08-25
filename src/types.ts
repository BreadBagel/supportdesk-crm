export type UserRole = 'ADMIN' | 'AGENT' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  customerId?: string; // linked customer record if role is CUSTOMER
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  createdAt: string;
  ticketCount?: number;
}

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'TECHNICAL' | 'BILLING' | 'ACCOUNT' | 'FEATURE_REQUEST' | 'GENERAL';

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  createdAt: string;
}

export interface Ticket {
  id: string; // e.g. TICK-1001
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: TicketCategory;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  customerCompany?: string;
  assignedAgentId?: string | null;
  assignedAgentName?: string | null;
  createdById: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  commentsCount?: number;
}

export interface DashboardStats {
  totalCustomers: number;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  urgentTickets: number;
  recentTickets: Ticket[];
  ticketsByPriority: Record<TicketPriority, number>;
  ticketsByCategory: Record<TicketCategory, number>;
}

export interface AuthResponse {
  user: User;
  token: string;
}
