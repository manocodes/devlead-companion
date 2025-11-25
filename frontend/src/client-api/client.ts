export interface User {
    email: string;
    [key: string]: any;
}

const API_BASE_URL = 'http://localhost:3000';

export const getUserProfile = async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch profile');
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
