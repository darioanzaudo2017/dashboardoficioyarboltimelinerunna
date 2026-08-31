"use server";
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";
import { JwtPayload } from "jsonwebtoken";
import { UserPermissions } from './userZustand';

const authClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://web-runna-v2legajos.up.railway.app/api',
});

const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
};

const decodeJwtPayload = (token: string): JwtPayload | null => {
  const decoded = jwt.decode(token);
  return decoded && typeof decoded === 'object' ? decoded : null;
};

export async function decodeToken(accessToken?: string) {
  try {
    const token = accessToken || cookies().get("accessToken")?.value;
    if (!token) return null;

    return decodeJwtPayload(token);
  } catch {
    return null;
  }
}

export async function login(username: string, password: string) {
  try {
    const response = await authClient.post('/token/', { username, password });

    const tokens = {
      refresh: response.data.refresh,
      access: response.data.access,
    };

    const cookieStore = cookies();

    cookieStore.set("refreshToken", tokens.refresh, {
      ...authCookieOptions,
    });

    cookieStore.set("accessToken", tokens.access, {
      ...authCookieOptions,
    });

    return { success: true };
  } catch (error: any) {
    // Return error details to be handled on the client side
    return {
      success: false,
      error: {
        message: error.response?.data?.detail || error.message || 'Login failed',
        status: error.response?.status,
        details: error.response?.data
      }
    };
  }
}

export const getSession = async (returnUserData: boolean = false): Promise<string | UserPermissions | null> => {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (!accessToken) {
      return null;
    }

    // The backend validates the signature. Here we only inspect expiration to
    // avoid sending a token that is already known to be stale.
    const decoded = decodeJwtPayload(accessToken);
    if (!decoded) return null;
    const currentTime = Math.floor(Date.now() / 1000);
    let validAccessToken = accessToken;

    // If token is expired, try to refresh it
    if (decoded.exp && decoded.exp < currentTime) {
      const refreshToken = cookieStore.get('refreshToken')?.value;
      if (!refreshToken) {
        return null;
      }

      try {
        const response = await authClient.post('/token/refresh/', {
          refresh: refreshToken
        });

        validAccessToken = response.data.access;
        cookieStore.set('accessToken', validAccessToken, authCookieOptions);
        if (response.data.refresh) {
          cookieStore.set('refreshToken', response.data.refresh, authCookieOptions);
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
      }
    }

    if (!returnUserData) {
      return validAccessToken;
    }

    // Get user data
    try {
      const response = await authClient.get<UserPermissions>('/user/me/', {
        headers: { Authorization: `Bearer ${validAccessToken}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  } catch (error) {
    console.error('Error in getSession:', error);
    return null;
  }
};

export async function logout() {
  const cookieStore = cookies();
  cookieStore.delete("refreshToken");
  cookieStore.delete("accessToken");
  cookieStore.delete("mock_username");
}

/**
 * Refresh the access token using the refresh token (Server-side)
 * POST /api/token/refresh/
 * @returns The new access token or null if refresh fails
 */
export async function refreshToken(): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const refreshTokenValue = cookieStore.get('refreshToken')?.value;

    if (!refreshTokenValue) {
      console.warn('No refresh token available');
      return null;
    }

    const response = await authClient.post('/token/refresh/', {
      refresh: refreshTokenValue
    });

    const newAccessToken = response.data.access;

    if (newAccessToken) {
      cookieStore.set('accessToken', newAccessToken, authCookieOptions);
      if (response.data.refresh) {
        cookieStore.set('refreshToken', response.data.refresh, authCookieOptions);
      }

      return newAccessToken;
    }

    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear tokens on refresh failure
    const cookieStore = cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    return null;
  }
}
