
import { handleMockRequest } from './mockAdapter';

// In a real app, this would be determined by env vars
const USE_MOCK = true;
const BASE_URL = 'https://api.terrapro.com/v1';

interface RequestConfig extends RequestInit {
    params?: Record<string, string>;
}

export const httpClient = {
    get: async <T>(endpoint: string, config?: RequestConfig): Promise<T> => {
        if (USE_MOCK) {
            return handleMockRequest(endpoint, 'GET') as Promise<T>;
        }
        return fetch(`${BASE_URL}${endpoint}`).then(res => res.json());
    },

    post: async <T>(endpoint: string, body: any, config?: RequestConfig): Promise<T> => {
        if (USE_MOCK) {
            return handleMockRequest(endpoint, 'POST', body) as Promise<T>;
        }
        return fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json());
    },

    put: async <T>(endpoint: string, body: any, config?: RequestConfig): Promise<T> => {
        if (USE_MOCK) {
            return handleMockRequest(endpoint, 'PUT', body) as Promise<T>;
        }
        return fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json());
    },

    delete: async <T>(endpoint: string, config?: RequestConfig): Promise<T> => {
        if (USE_MOCK) {
            return handleMockRequest(endpoint, 'DELETE') as Promise<T>;
        }
        return fetch(`${BASE_URL}${endpoint}`, { method: 'DELETE' }).then(res => res.json());
    }
};
