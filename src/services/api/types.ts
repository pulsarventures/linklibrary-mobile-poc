export type ApiError = {
  code?: string;
  message: string;
  status?: number;
}

export type AuthResponse = {
  access_token: string;
  access_token_expires_in: number;
  access_token_expires_at?: number; // New epoch timestamp from API
  is_revoked: boolean;
  message?: string;
  refresh_token: string;
  refresh_token_expires_in: number;
  refresh_token_expires_at?: number; // New epoch timestamp from API
  token_type: string;
  user: User;
}

export type LoginRequest = {
  password: string;
  username: string;
}

export type OAuth2LoginFormData = {
  client_id: string;
  client_secret: string;
  grant_type: 'password';
  password: string;
  username: string;
}

export type RegisterRequest = {
  email: string;
  full_name: string;
  password: string;
}

export type SocialAuthRequest = {
  email?: string;
  name?: string;
  provider: 'apple' | 'google';
  token: string;
}

export type SocialAuthResponse = {} & AuthResponse

export type User = {
  avatar: null | string;
  created_at: string;
  email: string;
  full_name: null | string;
  id: number;
  is_active: boolean;
  is_verified: boolean;
  name: null | string;
  updated_at: string;
} 