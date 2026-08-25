import { Router, Response } from 'express';
import { db, TicketPriority, TicketCategory } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../auth.js';

export const dashboardRouter = Router();

dashboardRouter.use(authenticateToken);

// GET /api/dashboard/stats
dashboardRouter.get('/stats', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let tickets = db.getTickets();
  let customers = db.getCustomers();

  // Role scoping:
  if (user.role === 'CUSTOMER') {
    tickets = tickets.filter(
      (t) => (user.customerId && t.customerId === user.customerId) || t.createdById === user.id
    );
    if (user.customerId) {
      customers = customers.filter((c) => c.id === user.customerId);
    }
  }

  const totalCustomers = customers.length;
  const totalTickets = tickets.length;

  const openTickets = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const pendingTickets = tickets.filter((t) => t.status === 'PENDING').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED').length;
  const closedTickets = tickets.filter((t) => t.status === 'CLOSED').length;

  const urgentTickets = tickets.filter((t) => t.priority === 'URGENT' && t.status !== 'CLOSED' && t.status !== 'RESOLVED').length;

  const ticketsByPriority: Record<TicketPriority, number> = {
    LOW: tickets.filter((t) => t.priority === 'LOW').length,
    MEDIUM: tickets.filter((t) => t.priority === 'MEDIUM').length,
    HIGH: tickets.filter((t) => t.priority === 'HIGH').length,
    URGENT: tickets.filter((t) => t.priority === 'URGENT').length,
  };

  const ticketsByCategory: Record<TicketCategory, number> = {
    TECHNICAL: tickets.filter((t) => t.category === 'TECHNICAL').length,
    BILLING: tickets.filter((t) => t.category === 'BILLING').length,
    ACCOUNT: tickets.filter((t) => t.category === 'ACCOUNT').length,
    FEATURE_REQUEST: tickets.filter((t) => t.category === 'FEATURE_REQUEST').length,
    GENERAL: tickets.filter((t) => t.category === 'GENERAL').length,
  };

  // Recent 5 updated tickets with expanded details
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
    .map((t) => {
      const cust = db.getCustomerById(t.customerId);
      const agent = t.assignedAgentId ? db.getUserById(t.assignedAgentId) : null;
      return {
        ...t,
        customerName: cust ? cust.name : 'Unknown Customer',
        customerCompany: cust ? cust.company : '',
        assignedAgentName: agent ? agent.name : null,
      };
    });

  res.json({
    totalCustomers,
    totalTickets,
    openTickets,
    inProgressTickets,
    pendingTickets,
    resolvedTickets,
    closedTickets,
    urgentTickets,
    ticketsByPriority,
    ticketsByCategory,
    recentTickets,
  });
});
