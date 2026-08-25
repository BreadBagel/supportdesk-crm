import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../auth.js';

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const isValidPassword = bcrypt.compareSync(password, user.passwordHash);
  if (!isValidPassword) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = generateToken(user);

  const { passwordHash, ...userWithoutPassword } = user;
  res.json({
    user: userWithoutPassword,
    token,
  });
});

// POST /api/auth/register
authRouter.post('/register', (req, res) => {
  const { name, email, password, company, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  const existingUser = db.getUserByEmail(email);
  if (existingUser) {
    res.status(400).json({ error: 'An account with this email already exists' });
    return;
  }

  // Create Customer record for this new customer user
  const customer = db.createCustomer({
    name,
    email,
    phone: phone || '+1 (555) 000-0000',
    company: company || 'Individual Account',
    notes: 'Registered via web portal',
  });

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = db.createUser({
    name,
    email,
    passwordHash,
    role: 'CUSTOMER',
    customerId: customer.id,
  });

  const token = generateToken(newUser);

  const { passwordHash: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    user: userWithoutPassword,
    token,
  });
});

// GET /api/auth/me
authRouter.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const user = db.getUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const { passwordHash, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// POST /api/auth/demo-login
authRouter.post('/demo-login', (req, res) => {
  const { role } = req.body; // 'ADMIN', 'AGENT', 'CUSTOMER'

  let targetEmail = 'admin@supportdesk.com';
  if (role === 'AGENT') {
    targetEmail = 'sarah.agent@supportdesk.com';
  } else if (role === 'CUSTOMER') {
    targetEmail = 'john.doe@techcorp.com';
  }

  const user = db.getUserByEmail(targetEmail);
  if (!user) {
    res.status(404).json({ error: `Demo account for ${role} not found` });
    return;
  }

  const token = generateToken(user);
  const { passwordHash, ...userWithoutPassword } = user;

  res.json({
    user: userWithoutPassword,
    token,
  });
});
