import { demoUsers } from '../../data/mockUsers';

const userKey = 'bhu-setu-demo-user';
const tokenKey = 'bhu-setu-token';
const API_URL = '/api/v1/auth';

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(userKey)) || demoUsers[0];
  } catch {
    return demoUsers[0];
  }
};

export const getAuthToken = () => {
  return localStorage.getItem(tokenKey) || '';
};

export const signIn = async (role, email = '') => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, email })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem(userKey, JSON.stringify(data.user));
        if (data.token) localStorage.setItem(tokenKey, data.token);
        return data.user;
      }
    }
  } catch (error) {
    console.warn('Backend API unavailable, using local session state:', error);
  }

  const fallbackUser = demoUsers.find((entry) => entry.role === role) || demoUsers[0];
  localStorage.setItem(userKey, JSON.stringify(fallbackUser));
  return fallbackUser;
};

export const verifyEKYC = async (aadhaarNumber, otp) => {
  try {
    const res = await fetch(`${API_URL}/ekyc-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aadhaarNumber, otp })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem(userKey, JSON.stringify(data.user));
        if (data.token) localStorage.setItem(tokenKey, data.token);
        return data;
      }
    }
  } catch (error) {
    console.warn('e-KYC API error:', error);
  }
  return { success: false, message: 'Identity verification failed.' };
};

export const signOut = async () => {
  localStorage.removeItem(userKey);
  localStorage.removeItem(tokenKey);
};
