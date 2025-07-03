import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  full_name: z.string().nullable(),
  is_active: z.boolean(),
  is_verified: z.boolean(),
  created_at: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const loginCredentialsSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

export const registerCredentialsSchema = z.object({
  full_name: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export type RegisterCredentials = z.infer<typeof registerCredentialsSchema>;

export const authResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  is_revoked: z.boolean(),
  user: userSchema,
  message: z.string().optional(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;

export const passwordResetConfirmSchema = z.object({
  token: z.string(),
  new_password: z.string(),
});

export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>;
