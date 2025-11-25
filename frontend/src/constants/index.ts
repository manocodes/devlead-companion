// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Auth Constants
export const AUTH_TOKEN_KEY = 'token';

// Query Keys for React Query
export const QUERY_KEYS = {
  USER_PROFILE: 'userProfile',
  // Add more query keys as you build features
} as const;

// App Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  // Add more routes as needed
} as const;
