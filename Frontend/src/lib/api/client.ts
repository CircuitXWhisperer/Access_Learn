import axios from 'axios';
import { env } from '../env';
import { getAccessToken, setAccessToken, clearAccessToken } from '../../auth/tokenStore';

export const client = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let refreshing: Promise<string | null> | null = null;

export const refreshClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status !== 401 || original?._retry || original?.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }
    original._retry = true;
    refreshing ??= refreshClient.post('/auth/refresh').then((r) => {
      const token = r.data?.data?.accessToken ?? null;
      if (token) setAccessToken(token);
      return token;
    }).catch(() => {
      clearAccessToken();
      return null;
    }).finally(() => { refreshing = null; });
    const token = await refreshing;
    if (!token) return Promise.reject(error);
    original.headers.Authorization = `Bearer ${token}`;
    return client(original);
  },
);
