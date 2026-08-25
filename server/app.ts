import express from 'express';
import { authRouter } from './routes/authRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { customerRouter } from './routes/customerRoutes.js';
import { ticketRouter } from './routes/ticketRoutes.js';
import { dashboardRouter } from './routes/dashboardRoutes.js';

export function createApp() {
  const app = express();

  if (process.env.VERCEL) {
    app.use((req, res, next) => {
      if (req.url.startsWith('/api/index')) {
        req.url = `/api${req.url.slice('/api/index'.length) || '/'}`;
      } else if (req.url !== '/api' && !req.url.startsWith('/api/')) {
        req.url = `/api${req.url}`;
      }
      next();
    });
  }

  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/customers', customerRouter);
  app.use('/api/tickets', ticketRouter);
  app.use('/api/dashboard', dashboardRouter);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  return app;
}