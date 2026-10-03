import { useCallback, useEffect, useState } from 'react';
import { connectSocket } from '../services/socket/socketService';

const STORAGE_KEY = 'bhu-setu-notifications';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(notifications) {
  try {
    // Keep only the latest 50 to avoid bloating localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

/** Keep the notification feed in sync with the Socket.IO notification stream. */
export function useNotifications() {
  const [notifications, setNotifications] = useState(() => loadFromStorage());

  useEffect(() => {
    const socket = connectSocket();
    const handleNotification = (notification) => {
      setNotifications((current) => {
        const updated = [
          { ...notification, unread: notification.unread ?? true },
          ...current,
        ];
        saveToStorage(updated);
        return updated;
      });
    };

    socket.on('notification:new', handleNotification);
    return () => socket.off('notification:new', handleNotification);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((current) => {
      const updated = current.map((notification) => ({
        ...notification,
        unread: false,
      }));
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const unreadCount = notifications.reduce(
    (count, notification) => count + (notification.unread ? 1 : 0),
    0
  );

  return { notifications, unreadCount, markAllRead };
}
