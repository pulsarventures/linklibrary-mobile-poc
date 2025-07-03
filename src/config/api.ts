import { API_URL_DEV, API_URL_PROD } from '@env';

const isDevelopment = __DEV__;

export const API_URL = isDevelopment ? API_URL_DEV : API_URL_PROD;

export const API_ENDPOINTS = {
  auth: {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
    refreshToken: `${API_URL}/auth/refresh-token`,
  },
  user: {
    profile: `${API_URL}/user/profile`,
    updateProfile: `${API_URL}/user/profile`,
  },
  // Add more endpoints as needed
}; 