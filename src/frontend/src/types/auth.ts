export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'pastor' | 'group_leader' | 'member';
  profilePhoto?: string;
  churchId: string;
  permissions: Permission[];
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete')[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  churchName?: string;
  role?: 'admin' | 'member';
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: Date;
}
