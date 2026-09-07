import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession, refreshToken as refreshSessionToken } from '@/utils/auth';
import posthog from 'posthog-js';
import { logger } from '@/utils/logger';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://web-runna-v2legajos.up.railway.app/api',
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    // The refresh cookie is httpOnly by design, so only the server action may
    // read it and rotate the access token.
    return await refreshSessionToken();
  } catch (error) {
    logger.error('Token refresh failed:', error);
    return null;
  }
};

axiosInstance.interceptors.request.use(
  async (config) => {
    if (!config.headers.Authorization) {
      const session = await getSession();
      const accessToken = typeof session === 'string' ? session : null;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (typeof window !== 'undefined') {
      const method = error.config?.method?.toUpperCase();
      const endpoint = error.config?.url || 'Unknown endpoint';
      const status = error.response?.status;
      logger.error(`API Error - ${endpoint}:`, {
        method,
        status,
        data: error.response?.data,
      });

      // Error tracking en PostHog (sin payloads: solo metadata accionable).
      try {
        posthog.capture('api_error', {
          endpoint,
          method,
          status: status ?? 0,
          // status 0 => error de red / sin respuesta del servidor.
          is_network_error: !error.response,
        });
      } catch {
        // No bloquear el flujo de error si PostHog no está disponible.
      }
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('/token/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          processQueue(null, newToken);
          return axiosInstance(originalRequest);
        } else {
          processQueue(new Error('Token refresh failed'), null);
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
