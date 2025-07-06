import { API_URL_DEV, API_URL_PROD } from '@env';

const isDevelopment = __DEV__;

// Default development URL if environment variable is not set
const DEFAULT_DEV_URL = 'http://localhost:8000/api/v1';
const DEFAULT_PROD_URL = 'https://api.linklibrary.app/api/v1';

export const API_URL = isDevelopment 
  ? (API_URL_DEV || DEFAULT_DEV_URL)
  : (API_URL_PROD || DEFAULT_PROD_URL);

export const API_ENDPOINTS = {
  auth: {
    login: `/auth/login`,
    register: `/auth/register`,
    refreshToken: `/auth/refresh`,
    logout: `/auth/logout`,
    social: `/auth/social`,
    forgotPassword: `/auth/forgot-password`,
    resetPassword: `/auth/reset-password`,
  },
  user: {
    me: `/users/me`,
    profile: `/user/profile`,
    updateProfile: `/user/profile`,
  },
  links: {
    list: `/links`,
    create: `/links`,
    get: (id: string) => `/links/${id}`,
    update: (id: string) => `/links/${id}`,
    delete: (id: string) => `/links/${id}`,
  },
};

export const API_BASE_URL = API_URL; 