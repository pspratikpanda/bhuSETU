/**
 * useSocket.js — bhuSETU React hooks for Socket.IO events
 *
 * Provides memory-leak-safe event subscriptions via useEffect cleanup.
 *
 * Hooks exported:
 *   useSocket(eventName, callback)  — subscribe to a single socket event
 *   useSocketStatus()               — track connection status reactively
 *   useSocketConnect()              — get the active socket instance
 */

import { useEffect, useRef, useState } from 'react';
import { connectSocket, getSocket, getSocketStatus } from '../services/socket/socketService';

/**
 * Subscribe to a Socket.IO event.
 * Automatically registers on mount and removes listener on unmount.
 *
 * @param {string} eventName  — Socket.IO event name (e.g. 'notification:new')
 * @param {Function} callback — Handler function called with the event payload
 *
 * @example
 * useSocket('notification:new', (notif) => {
 *   setNotifications(prev => [notif, ...prev]);
 * });
 */
export function useSocket(eventName, callback) {
  // Keep callback in a ref so stale closures don't cause re-subscriptions
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const socket = connectSocket();

    const handler = (payload) => {
      callbackRef.current(payload);
    };

    socket.on(eventName, handler);

    // Cleanup: remove listener when component unmounts or eventName changes
    return () => {
      socket.off(eventName, handler);
    };
  }, [eventName]);
}

/**
 * Reactively track the Socket.IO connection status.
 * Updates automatically when connection state changes.
 *
 * @returns {'connected' | 'disconnected' | 'connecting'}
 *
 * @example
 * const status = useSocketStatus();
 * // 'connected' | 'disconnected' | 'connecting'
 */
export function useSocketStatus() {
  const [status, setStatus] = useState(() => getSocketStatus());

  useEffect(() => {
    const socket = connectSocket();

    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onConnecting = () => setStatus('connecting');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect_attempt', onConnecting);

    // Sync immediately in case socket was already connected before this mount
    setStatus(getSocketStatus());

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnect_attempt', onConnecting);
    };
  }, []);

  return status;
}

/**
 * Returns the active socket instance (connects automatically if not yet active).
 * Use only when direct socket access is needed; prefer useSocket for event handling.
 *
 * @returns {import('socket.io-client').Socket}
 */
export function useSocketConnect() {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = connectSocket();
  }, []);

  return getSocket();
}
