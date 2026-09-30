/**
 * socketService.js — bhuSETU Socket.IO client singleton
 *
 * Manages a single persistent Socket.IO connection for the entire frontend.
 * The socket is authenticated using the JWT stored in localStorage by authService.
 *
 * Usage:
 *   import { getSocket, connectSocket, disconnectSocket } from './socketService';
 *   const socket = getSocket();
 *   socket.on('notification:new', handler);
 */

import { io } from 'socket.io-client';

const TOKEN_KEY = 'bhu-setu-token';

let socket = null;

/**
 * Initialize and return the Socket.IO singleton.
 * Safe to call multiple times — returns existing socket if already connected.
 */
export function connectSocket() {
  if (socket && socket.connected) return socket;

  const token = localStorage.getItem(TOKEN_KEY) || '';

  socket = io('/', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 10,
    reconnectionDelay: 1500,
    reconnectionDelayMax: 10000,
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('✅ [Socket.IO] Connected to bhuSETU WebSocket engine:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('⚠️ [Socket.IO] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 [Socket.IO] Disconnected:', reason);
  });

  return socket;
}

/**
 * Get the active socket instance (connects if not already active).
 */
export function getSocket() {
  if (!socket) return connectSocket();
  return socket;
}

/**
 * Gracefully disconnect and destroy the socket (call on sign-out).
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 [Socket.IO] Disconnected cleanly.');
  }
}

/**
 * Returns the current connection status string.
 * @returns {'connected' | 'disconnected' | 'connecting'}
 */
export function getSocketStatus() {
  if (!socket) return 'disconnected';
  if (socket.connected) return 'connected';
  return 'connecting';
}
