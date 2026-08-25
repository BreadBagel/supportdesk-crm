import { Router, Response } from 'express';
import { db, TicketPriority, TicketStatus, TicketCategory } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../auth.js';

export const ticketRouter = Router();

ticketRouter.use(authenticateToken);

// Helper to expand ticket record with relational details
function expandTicket(t: ReturnType<typeof db.getTickets>[0]) {
  const customer = db.getCustomerById(t.customerId);
  const assignedAgent = t.assignedAgentId ? db.getUserById(t.assignedAgentId) : null;
  const createdBy = db.getUserById(t.createdById);
  const comments = db.getCommentsByTicketId(t.id);

  return {
    ...t,
    customerName: customer ? customer.name : 'Unknown Customer',
    customerEmail: customer ? customer.email : '',
    customerCompany: customer ? customer.company : '',
    assignedAgentName: assignedAgent ? assignedAgent.name : null,
    createdByName: createdBy ? createdBy.name : 'System User',
    commentsCount: comments.length,
  };
}

// Helper to check role-based ticket permission
function checkTicketAccess(
  ticket: ReturnType<typeof db.getTicketById>,
  user: NonNullable<AuthenticatedRequest['user']>
): { allowed: boolean; error?: string } {
  if (!ticket) {
    return { allowed: false, error: 'Ticket not found' };
  }

  // Admin has full access to all tickets
  if (user.role === 'ADMIN') {
    return { allowed: true };
  }

  // Customer role permission check
  if (user.role === 'CUSTOMER') {
    if (ticket.customerId === user.customerId || ticket.createdById === user.id) {
      return { allowed: true };
    }
    return { allowed: false, error: 'Access denied to this support ticket' };
  }

  // Agent role permission check:
  // Allowed if ticket is unassigned, assigned to this agent, or created by this agent
  if (user.role === 'AGENT') {
    if (!ticket.assignedAgentId || ticket.assignedAgentId === user.id || ticket.createdById === user.id) {
      return { allowed: true };
    }
    return { allowed: false, error: "You don't have permission on this ticket, contact administrator" };
  }

  return { allowed: false, error: 'Access denied' };
}

// GET /api/tickets - List & Filter Tickets
ticketRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let tickets = db.getTickets();

  // Role scoping:
  if (user.role === 'CUSTOMER') {
    tickets = tickets.filter(
      (t) => (user.customerId && t.customerId === user.customerId) || t.createdById === user.id
    );
  } else if (user.role === 'AGENT') {
    tickets = tickets.filter(
      (t) => !t.assignedAgentId || t.assignedAgentId === user.id || t.createdById === user.id
    );
  }

  // Search filter (by query param 'q': Ticket ID, Subject, Customer Name)
  const query = (req.query.q as string)?.trim().toLowerCase();
  if (query) {
    tickets = tickets.filter((t) => {
      const expanded = expandTicket(t);
      return (
        expanded.id.toLowerCase().includes(query) ||
        expanded.subject.toLowerCase().includes(query) ||
        expanded.customerName.toLowerCase().includes(query) ||
        expanded.customerCompany.toLowerCase().includes(query)
      );
    });
  }

  // Status filter
  const statusFilter = req.query.status as TicketStatus;
  if (statusFilter) {
    tickets = tickets.filter((t) => t.status === statusFilter);
  }

  // Priority filter
  const priorityFilter = req.query.priority as TicketPriority;
  if (priorityFilter) {
    tickets = tickets.filter((t) => t.priority === priorityFilter);
  }

  // Category filter
  const categoryFilter = req.query.category as TicketCategory;
  if (categoryFilter) {
    tickets = tickets.filter((t) => t.category === categoryFilter);
  }

  // Agent filter
  const agentFilter = req.query.agentId as string;
  if (agentFilter) {
    tickets = tickets.filter((t) => t.assignedAgentId === agentFilter);
  }

  // Sort by latest updated
  tickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const expandedList = tickets.map(expandTicket);
  res.json(expandedList);
});

// GET /api/tickets/:id - Single Ticket Details
ticketRouter.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const ticket = db.getTicketById(id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const access = checkTicketAccess(ticket, user);
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  res.json(expandTicket(ticket));
});

// POST /api/tickets - Create Ticket
ticketRouter.post('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { subject, description, priority, category, customerId, assignedAgentId } = req.body;

  if (!subject || !description) {
    res.status(400).json({ error: 'Subject and description are required' });
    return;
  }

  let finalCustomerId = customerId;
  if (user.role === 'CUSTOMER') {
    // Force customer's own customerId
    if (user.customerId) {
      finalCustomerId = user.customerId;
    } else {
      // Find or create customer entry for this user
      let cust = db.getCustomers().find((c) => c.email.toLowerCase() === user.email.toLowerCase());
      if (!cust) {
        cust = db.createCustomer({
          name: user.name,
          email: user.email,
          phone: '',
          company: 'Customer Portal',
        });
      }
      finalCustomerId = cust.id;
    }
  }

  if (!finalCustomerId) {
    // Fallback if creating via Admin without selecting customer
    const firstCust = db.getCustomers()[0];
    finalCustomerId = firstCust ? firstCust.id : 'cust-1';
  }

  const newTicket = db.createTicket({
    subject,
    description,
    priority: priority || 'MEDIUM',
    status: 'OPEN',
    category: category || 'TECHNICAL',
    customerId: finalCustomerId,
    assignedAgentId: assignedAgentId || null,
    createdById: user.id,
  });

  // Automatically add an initial system comment/activity log
  db.addComment({
    ticketId: newTicket.id,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    content: `Ticket created with status OPEN and ${newTicket.priority} priority.`,
  });

  res.status(201).json(expandTicket(newTicket));
});

// PUT /api/tickets/:id - Update Ticket
ticketRouter.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const ticket = db.getTicketById(id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const access = checkTicketAccess(ticket, user);
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const { subject, description, priority, status, category, assignedAgentId } = req.body;

  // Customers can update subject/description, but cannot reassign agents or change internal status arbitrarily
  if (user.role === 'CUSTOMER') {
    const updated = db.updateTicket(id, {
      subject: subject !== undefined ? subject : ticket.subject,
      description: description !== undefined ? description : ticket.description,
    });
    res.json(expandTicket(updated!));
    return;
  }

  // Admins and Agents can update all attributes
  const updates: Partial<Parameters<typeof db.updateTicket>[1]> = {};

  if (subject !== undefined) updates.subject = subject;
  if (description !== undefined) updates.description = description;
  if (priority !== undefined) updates.priority = priority;
  if (status !== undefined) {
    updates.status = status;
    if (status !== ticket.status) {
      db.addComment({
        ticketId: id,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        content: `Status updated from ${ticket.status} to ${status}.`,
      });
    }
  }
  if (category !== undefined) updates.category = category;
  if (assignedAgentId !== undefined) {
    updates.assignedAgentId = assignedAgentId;
    if (assignedAgentId !== ticket.assignedAgentId) {
      const agent = assignedAgentId ? db.getUserById(assignedAgentId) : null;
      db.addComment({
        ticketId: id,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        content: agent
          ? `Ticket assigned to agent ${agent.name}.`
          : 'Ticket unassigned.',
      });
    }
  }

  const updated = db.updateTicket(id, updates);
  res.json(expandTicket(updated!));
});

// DELETE /api/tickets/:id - Delete Ticket
ticketRouter.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const ticket = db.getTicketById(id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const access = checkTicketAccess(ticket, user);
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const deleted = db.deleteTicket(id);
  if (!deleted) {
    res.status(500).json({ error: 'Failed to delete ticket' });
    return;
  }

  res.json({ message: 'Ticket deleted successfully' });
});

// GET /api/tickets/:id/comments - Get Comments
ticketRouter.get('/:id/comments', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const ticket = db.getTicketById(id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const access = checkTicketAccess(ticket, user);
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const comments = db.getCommentsByTicketId(id);
  res.json(comments);
});

// POST /api/tickets/:id/comments - Add Comment
ticketRouter.post('/:id/comments', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const { content } = req.body;

  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Comment content cannot be empty' });
    return;
  }

  const ticket = db.getTicketById(id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const access = checkTicketAccess(ticket, user);
  if (!access.allowed) {
    res.status(403).json({ error: access.error });
    return;
  }

  const comment = db.addComment({
    ticketId: id,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    content: content.trim(),
  });

  res.status(201).json(comment);
});
