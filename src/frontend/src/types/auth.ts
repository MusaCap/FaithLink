export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'leader' | 'member';
  profilePhoto?: string;
  churchId?: string;
  churchName?: string;
  joinDate?: string;
  status?: string;
  isNewUser?: boolean;
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
  role?: 'admin' | 'leader' | 'member';
  churchChoice?: 'join' | 'create';
  selectedChurchId?: string;
  newChurchName?: string;
  joinCode?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: Date;
}
