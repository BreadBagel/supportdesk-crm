import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth.js';

export const customerRouter = Router();

customerRouter.use(authenticateToken);

// GET /api/customers - List customers
customerRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let customers = db.getCustomers();

  // If role is CUSTOMER, only return their linked customer profile
  if (user.role === 'CUSTOMER') {
    if (user.customerId) {
      customers = customers.filter((c) => c.id === user.customerId);
    } else {
      customers = customers.filter((c) => c.email.toLowerCase() === user.email.toLowerCase());
    }
  }

  const tickets = db.getTickets();

  // Annotate with active ticket count
  const annotated = customers.map((c) => {
    const custTickets = tickets.filter((t) => t.customerId === c.id);
    return {
      ...c,
      ticketCount: custTickets.length,
    };
  });

  res.json(annotated);
});

// GET /api/customers/:id - Get single customer profile
customerRouter.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  if (user.role === 'CUSTOMER' && user.customerId !== id) {
    res.status(403).json({ error: 'Access denied to other customer profiles' });
    return;
  }

  const customer = db.getCustomerById(id);
  if (!customer) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }

  const custTickets = db.getTickets().filter((t) => t.customerId === id);

  res.json({
    ...customer,
    ticketCount: custTickets.length,
    tickets: custTickets,
  });
});

// POST /api/customers - Create new customer (ADMIN, AGENT)
customerRouter.post('/', requireRole(['ADMIN', 'AGENT']), (req: AuthenticatedRequest, res: Response) => {
  const { name, email, phone, company, notes } = req.body;

  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }

  const newCustomer = db.createCustomer({
    name,
    email,
    phone: phone || '',
    company: company || '',
    notes: notes || '',
  });

  res.status(201).json(newCustomer);
});

// PUT /api/customers/:id - Update customer (ADMIN, AGENT)
customerRouter.put('/:id', requireRole(['ADMIN', 'AGENT']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, company, notes } = req.body;

  const updated = db.updateCustomer(id, { name, email, phone, company, notes });
  if (!updated) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }

  res.json(updated);
});

// DELETE /api/customers/:id - Delete customer (ADMIN, AGENT)
customerRouter.delete('/:id', requireRole(['ADMIN', 'AGENT']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const deleted = db.deleteCustomer(id);
  if (!deleted) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }

  res.json({ message: 'Customer deleted successfully' });
});
