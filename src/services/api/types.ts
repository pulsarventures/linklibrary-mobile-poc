export interface User {
  id: number;
  email: string;
  name: string | null;
  full_name: string | null;
  avatar: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface OAuth2LoginFormData {
  username: string;
  password: string;
  grant_type: 'password';
  client_id: string;
  client_secret: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  access_token_expires_in: number;
  refresh_token_expires_in: number;
  is_revoked: boolean;
  user: User;
  message?: string;
}

export interface SocialAuthRequest {
  provider: 'google' | 'apple';
  token: string;
  name?: string;
  email?: string;
}

export interface SocialAuthResponse extends AuthResponse {}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
} 