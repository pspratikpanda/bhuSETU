import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { connectDB } from './db/postgres.js';
import { initDatabase } from './db/initDb.js';
import { initSocketManager } from './socket/socketManager.js';
import authRoutes from './routes/auth.js';
import parcelRoutes from './routes/parcels.js';
import applicationRoutes from './routes/applications.js';
import documentRoutes from './routes/documents.js';
import conflictRoutes from './routes/conflicts.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import gisRoutes from './routes/gis.js';
import ocrRoutes from './routes/ocr.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security & Hardening Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled CSP header to allow local dev assets & inline scripts if needed
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Rate limiting: Limit requests to 300 per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'bhuSETU Backend API (PostgreSQL/PostGIS)',
    timestamp: new Date().toISOString(),
    websocket: 'Socket.IO v4 active',
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/parcels', parcelRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/conflicts', conflictRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/gis', gisRoutes);
app.use('/api/v1/ocr', ocrRoutes);

// Fallback for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found on bhuSETU backend API' });
});

// ── HTTP Server + Socket.IO ────────────────────────────────────────────────
const httpServer = createServer(app);
initSocketManager(httpServer);

// Connect to Postgres and Initialize Database Schema & Seed Data before listening
async function startServer() {
  await connectDB();
  await initDatabase();

  httpServer.listen(PORT, () => {
    console.log(`🚀 bhuSETU Backend Server running at http://localhost:${PORT}`);
    console.log(`📡 Healthcheck available at http://localhost:${PORT}/api/v1/health`);
    console.log(`🔌 Socket.IO WebSocket engine active on ws://localhost:${PORT}`);
  });
}

startServer();
