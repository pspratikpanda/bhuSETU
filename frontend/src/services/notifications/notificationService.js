import { notifications } from '../../data/mockNotifications';

const API_URL = '/api/v1/notifications';

export const getNotifications = async () => {
  try {
    const res = await fetch(API_URL);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (error) {
    console.warn('Backend API unavailable, using local notification records:', error);
  }
  return notifications;
};
