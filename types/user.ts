export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'maintainer' | 'viewer';
  department?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'maintainer' | 'viewer';
  department?: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  role?: 'admin' | 'maintainer' | 'viewer';
  department?: string;
  isActive?: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}