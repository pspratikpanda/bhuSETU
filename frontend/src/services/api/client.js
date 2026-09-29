import axios from 'axios';

// API client reserved for the future Express service. No server is currently connected.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});
