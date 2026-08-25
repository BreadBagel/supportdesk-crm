import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, UserRole } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth.js';

export const userRouter = Router();

// Authenticate all user routes
userRouter.use(authenticateToken);

// GET /api/users - List all users (ADMIN and AGENT can list users/agents)
userRouter.get('/', requireRole(['ADMIN', 'AGENT']), (req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers().map(({ passwordHash, ...u }) => u);
  res.json(users);
});

// POST /api/users - Create new staff/user
userRouter.post('/', requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400).json({ error: 'Name, email, password, and role are required' });
    return;
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    res.status(400).json({ error: 'User with this email already exists' });
    return;
  }

  const validRoles: UserRole[] = ['ADMIN', 'AGENT', 'CUSTOMER'];
  if (!validRoles.includes(role)) {
    res.status(400).json({ error: 'Invalid role specified' });
    return;
  }

  let customerId: string | undefined = undefined;

  // If creating a Customer user, link or create a customer record
  if (role === 'CUSTOMER') {
    const cust = db.createCustomer({
      name,
      email,
      phone: '+1 (555) 123-4567',
      company: 'General Customer',
      notes: 'Created by Admin',
    });
    customerId = cust.id;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = db.createUser({
    name,
    email,
    passwordHash,
    role,
    customerId,
  });

  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

// PUT /api/users/:id/role - Promote/Demote User Role
userRouter.put('/:id/role', requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles: UserRole[] = ['ADMIN', 'AGENT', 'CUSTOMER'];
  if (!validRoles.includes(role)) {
    res.status(400).json({ error: 'Invalid role' });
    return;
  }

  // Prevent admin from demoting themselves if they are the only admin
  if (req.user?.id === id && role !== 'ADMIN') {
    const adminCount = db.getUsers().filter((u) => u.role === 'ADMIN').length;
    if (adminCount <= 1) {
      res.status(400).json({ error: 'Cannot demote the sole Administrator account.' });
      return;
    }
  }

  const updatedUser = db.updateUserRole(id, role);
  if (!updatedUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { passwordHash, ...safeUser } = updatedUser;
  res.json(safeUser);
});

// DELETE /api/users/:id - Delete user
userRouter.delete('/:id', requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (req.user?.id === id) {
    res.status(400).json({ error: 'You cannot delete your own account while logged in.' });
    return;
  }

  const deleted = db.deleteUser(id);
  if (!deleted) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ message: 'User deleted successfully' });
});
