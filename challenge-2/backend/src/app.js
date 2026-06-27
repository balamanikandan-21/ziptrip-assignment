import express from 'express';
import cors from 'cors';
import todosRoutes from './routes/todosRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // CORS so the Vite-served frontend (different port) can call the API.
  app.use(cors());
  app.use(express.json());

  // Tiny request logger (method, url, status, duration)
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(
        `${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`
      );
    });
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  // Resource routes
  app.use('/api/todos', todosRoutes);

  // 404 + error handling (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
