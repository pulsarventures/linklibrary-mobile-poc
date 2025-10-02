import { z } from 'zod';

export const userSchema = z.object({
  avatar: z.string().nullable(),
  created_at: z.string(),
  email: z.string().email(),
  full_name: z.string().nullable(),
  id: z.number(),
  is_active: z.boolean(),
  is_verified: z.boolean(),
});

export type User = z.infer<typeof userSchema>;

export const loginCredentialsSchema = z.object({
  password: z.string(),
  username: z.string(),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

export const registerCredentialsSchema = z.object({
  email: z.string().email(),
  full_name: z.string(),
  password: z.string(),
});

export type RegisterCredentials = z.infer<typeof registerCredentialsSchema>;

export const authResponseSchema = z.object({
  access_token: z.string(),
  access_token_expires_at: z.number(), // Epoch timestamp
  access_token_expires_in: z.number(),
  is_revoked: z.boolean(),
  message: z.string().optional(),
  refresh_token: z.string(),
  refresh_token_expires_at: z.number(), // Epoch timestamp
  refresh_token_expires_in: z.number(),
  token_type: z.string(),
  user: userSchema.optional(), // User is optional on refresh
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;

export const passwordResetConfirmSchema = z.object({
  new_password: z.string(),
  token: z.string(),
});

export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>;
