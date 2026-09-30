import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';

let io = null;

/**
 * Initialize Socket.IO server and attach to existing http.Server.
 * Call once from server.js after creating the HTTP server.
 */
export function initSocketManager(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // ── JWT Auth middleware ────────────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      // Allow guest connections (demo mode) — attach a demo user identity
      socket.user = {
        id: 'USR-DEMO',
        name: 'Guest',
        role: 'Citizen',
        district: 'Khunti',
      };
      return next();
    }

    const payload = verifyToken(token);
    if (!payload) {
      return next(new Error('Invalid or expired authentication token'));
    }

    socket.user = payload;
    next();
  });

  // ── Connection handler ─────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const { id: userId, role, name } = socket.user || {};

    // Join private user room
    if (userId) {
      socket.join(`room:user:${userId}`);
    }

    // Join role-based rooms
    if (role && role !== 'Citizen') {
      socket.join('room:officers');
    } else {
      if (userId) socket.join(`room:citizen:${userId}`);
    }

    console.log(
      `🔌 [Socket] Connected: ${name || 'Guest'} (${role || 'Unknown'}) — socket ${socket.id}`
    );

    // Keepalive ping/pong
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 [Socket] Disconnected: ${socket.id} — ${reason}`);
    });
  });

  console.log('📡 [Socket.IO] WebSocket Engine initialised and listening.');
  return io;
}

// ── Emit helpers (used by route handlers) ─────────────────────────────────────

/**
 * Emit an event to a specific user's private room.
 * @param {string} userId
 * @param {string} event
 * @param {object} payload
 */
export function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`room:user:${userId}`).emit(event, payload);
}

/**
 * Emit an event to all connected officers.
 * @param {string} event
 * @param {object} payload
 */
export function emitToOfficers(event, payload) {
  if (!io) return;
  io.to('room:officers').emit(event, payload);
}

/**
 * Emit an event to all connected clients (broadcast).
 * @param {string} event
 * @param {object} payload
 */
export function emitGlobal(event, payload) {
  if (!io) return;
  io.emit(event, payload);
}

/**
 * Get the raw io instance (for advanced use).
 */
export function getIO() {
  return io;
}
