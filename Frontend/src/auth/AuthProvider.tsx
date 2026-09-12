import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { demoUsers, type Role, type User } from '../demo/data';
import { clearAccessToken, getAccessToken, setAccessToken } from './tokenStore';
import { env } from '../lib/env';
import { client } from '../lib/api/client';

type AuthContextValue = { user: User | null; loading: boolean; login: (role: Role, email: string, password: string, name?: string, className?: string) => Promise<void>; logout: () => Promise<void>; };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (env.VITE_DEMO_MODE) { setLoading(false); return; }
    const token = getAccessToken();
    if (!token) { setLoading(false); return; }
    client.get('/user/me').then((r) => setUser(normalizeUser(r.data.data ?? r.data.user ?? r.data))).catch(() => { clearAccessToken(); setUser(null); }).finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    login: async (role, email, password, name, className) => {
      if (env.VITE_DEMO_MODE) {
        if (role === 'admin' && (email !== 'admin@accesslearn.demo' || password !== 'admin123')) {
          throw new Error('Use admin@accesslearn.demo and admin123 to open the admin panel.');
        }
        clearAccessToken();
        const next = {
          ...demoUsers[role],
          email: role === 'admin' ? 'admin@accesslearn.demo' : email,
          name: role === 'student' ? name?.trim() || demoUsers.student.name : demoUsers.admin.name,
          className: role === 'student' ? className || demoUsers.student.className : demoUsers.admin.className,
        };
        setUser(next); return;
      }
      try {
        const r = role === 'student'
          ? await client.post('/user/student-login', { udid: email, name, className })
          : await client.post('/user/login', { email, password, role: 'administration' });
        const payload = r.data.data ?? r.data;
        setAccessToken(payload.accessToken); setUser(normalizeUser(payload.user));
      } catch (error) {
        if (role !== 'student') throw error;
        const temporaryUser = normalizeUser({ id: 'temporary-student', username: name || 'Temporary Student', email: 'temporary.student@accesslearn.local', role: 'student', className: className || 'Class 10' });
        setUser(temporaryUser);
      }
    },
    logout: async () => {
      try { if (!env.VITE_DEMO_MODE) await client.post('/auth/logout'); } finally {
        clearAccessToken(); setUser(null);
      }
    },
  }), [loading, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function normalizeUser(value: any): User {
  return { ...value, id: value.id ?? value._id, name: value.name ?? value.username ?? 'AccessLearn user', role: value.role === 'administration' ? 'admin' : 'student', className: value.className ?? 'Class 10' };
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
