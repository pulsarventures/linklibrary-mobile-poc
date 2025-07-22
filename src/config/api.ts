import { API_URL_DEV, API_URL_PROD } from '@env';

const isDevelopment = __DEV__;

// Default development URL if environment variable is not set
const DEFAULT_DEV_URL = 'https://api.linklibrary.ai/api/v1';
const DEFAULT_PROD_URL = 'https://api.linklibrary.ai/api/v1';

// Use environment variables if available, otherwise fall back to defaults
export const API_URL = isDevelopment 
  ? (API_URL_DEV || DEFAULT_DEV_URL)
  : (API_URL_PROD || DEFAULT_PROD_URL);

export const API_ENDPOINTS = {
  auth: {
    forgotPassword: `/auth/forgot-password`,
    googleAuth: `/auth/google/chrome-extension`,
    login: `/auth/login`,
    logout: `/auth/logout`,
    refreshToken: `/auth/refresh`,
    register: `/auth/register`,
    resetPassword: `/auth/reset-password`,
    social: `/auth/social`,
  },
  links: {
    create: `/links`,
    delete: (id: string) => `/links/${id}`,
    get: (id: string) => `/links/${id}`,
    list: `/links`,
    update: (id: string) => `/links/${id}`,
  },
  user: {
    me: `/users/me`,
    profile: `/user/profile`,
    updateProfile: `/user/profile`,
  },
};

export const API_BASE_URL = API_URL; 