import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'donor' | 'receiver' | 'admin';
  phone?: string;
  address?: string;
}

export const authService = {
  async register(data: { name: string; email: string; password: string; role: string }) {
    const res = await api.post('/register', data);
    const { user, token } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post('/login', data);
    const { user, token } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async logout() {
    try {
      await api.post('/logout');
    } catch {
      // ignore error on logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async me(): Promise<User | null> {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const res = await api.get('/me');
      return res.data;
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  },

  async updateRole(role: 'donor' | 'receiver'): Promise<User> {
    const res = await api.put('/users/role', { role });
    localStorage.setItem('user', JSON.stringify(res.data));
    return res.data;
  },

  getStoredUser(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  },
};
