import { demoUsers } from '../../data/mockUsers';

const userKey = 'bhu-setu-demo-user';
export const getCurrentUser = () => {
  try { return JSON.parse(localStorage.getItem(userKey)) || demoUsers[0]; } catch { return demoUsers[0]; }
};

// TODO: Replace prototype role switching with backend JWT authentication and authorization.
export const signIn = async (role) => {
  const user = demoUsers.find((entry) => entry.role === role) || demoUsers[0];
  localStorage.setItem(userKey, JSON.stringify(user));
  return user;
};

export const signOut = async () => localStorage.removeItem(userKey);
