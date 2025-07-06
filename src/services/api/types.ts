export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialAuthRequest {
  provider: 'google' | 'apple';
  token: string;
  name?: string;
  email?: string;
}

export interface SocialAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  user: User;
} 