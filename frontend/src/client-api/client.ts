export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  is_super_admin: boolean;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const API_BASE_URL = 'http://localhost:3000';

export const getUserProfile = async (token: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
};

export const getAllUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

export const getAllOrganizations = async (): Promise<Organization[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/organizations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch Organizations');
  }
  return response.json();
};

export const getHelloMessage = async (): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/hello`);
  if (!response.ok) {
    throw new Error('Failed to fetch hello message');
  }
  return response.text();
};

export interface EnvCheckResponse {
  hasGoogleClientId: boolean;
  hasGoogleClientSecret: boolean;
  hasGoogleCallbackUrl: boolean;
  googleClientIdPrefix: string;
  googleCallbackUrl: string;
}

export const getEnvCheck = async (): Promise<EnvCheckResponse> => {
  const response = await fetch(`${API_BASE_URL}/env-check`);
  if (!response.ok) {
    throw new Error('Failed to fetch environment check');
  }
  return response.json();
};

export const createOrganization = async (data: { name: string; description?: string }): Promise<Organization> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/organizations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create organization');
  }
  return response.json();
};
