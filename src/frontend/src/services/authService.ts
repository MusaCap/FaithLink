import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class AuthService {
  private transformUserResponse(response: any): User {
    const { user } = response.data || response;
    return {
      id: user.id,
      email: user.email,
      firstName: user.member?.firstName || '',
      lastName: user.member?.lastName || '',
      role: user.role,
      memberNumber: user.member?.memberNumber,
      profilePhoto: user.member?.profilePhotoUrl,
      churchId: user.churchId,
      churchName: user.churchName,
      joinDate: user.joinDate,
      status: user.status,
      isNewUser: user.isNewUser,
      permissions: user.permissions || [],
      createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined
    };
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Login failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Store the token if login successful
    if (data.data?.accessToken) {
      localStorage.setItem('auth_token', data.data.accessToken);
      const transformedUser = this.transformUserResponse(data);
      localStorage.setItem('user', JSON.stringify(transformedUser));
      return {
        token: data.data.accessToken,
        user: transformedUser,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
    }
    
    return data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.fetchWithAuth('/api/auth/me');
    return this.transformUserResponse(response);
  }

  async refreshToken(): Promise<AuthResponse> {
    return this.fetchWithAuth('/api/auth/refresh', {
      method: 'POST',
    });
  }

  async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Optional: Call backend logout if endpoint exists
    try {
      await this.fetchWithAuth('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Logout locally even if backend call fails
      console.log('Backend logout failed, but local logout successful');
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.fetchWithAuth('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return this.fetchWithAuth('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  isTokenValid(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
