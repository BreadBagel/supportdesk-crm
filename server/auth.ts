import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserRecord, UserRole } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required.');
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    customerId?: string;
  };
}

export function generateToken(user: UserRecord): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      customerId: user.customerId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedRequest['user'];
    // Verify user still exists
    if (!decoded || !decoded.id) {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }
    const user = db.getUserById(decoded.id);
    if (!user) {
      res.status(401).json({ error: 'User account no longer exists' });
      return;
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      customerId: user.customerId,
    };
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired authentication token' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Permission denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
      });
      return;
    }
    next();
  };
}
