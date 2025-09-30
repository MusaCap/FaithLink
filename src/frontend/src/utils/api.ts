// Centralized API configuration for production deployment
export const API_CONFIG = {
  // Use environment variable for production deployment, fallback to localhost for development
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: '/api/auth',
    MEMBERS: '/api/members',
    GROUPS: '/api/groups',
    EVENTS: '/api/events',
    JOURNEYS: '/api/journeys',
    CARE: '/api/care',
    COMMUNICATIONS: '/api/communications',
    REPORTS: '/api/reports',
    VOLUNTEERS: '/api/volunteers',
    SETTINGS: '/api/settings'
  }
};

// Helper function to build full API URLs
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function for authenticated fetch requests
export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('auth_token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  return fetch(getApiUrl(endpoint), {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });
};

// Environment info for debugging
export const getEnvironmentInfo = () => {
  return {
    apiBaseUrl: API_CONFIG.BASE_URL,
    isProduction: process.env.NODE_ENV === 'production',
    nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
  };
};
