import { ApiResponse, ErrorResponse } from 'shared';

const API_BASE_URL = '/api';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;
  details?: Record<string, string[]>;

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Base fetch function with error handling
 */
async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      throw new ApiError('Invalid response format', response.status);
    }
    
    const data = await response.json();
    
    // Handle API error responses
    if (!response.ok) {
      const errorData = data as ErrorResponse;
      throw new ApiError(
        errorData.message || 'An error occurred', 
        response.status,
        errorData.details
      );
    }
    
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof Error) {
      throw new ApiError(
        error.message || 'Network error', 
        0
      );
    }
    
    throw new ApiError('Unknown error', 0);
  }
}

/**
 * Generic GET request
 */
export function get<T>(endpoint: string, queryParams?: Record<string, string>): Promise<T> {
  const url = queryParams 
    ? `${endpoint}?${new URLSearchParams(queryParams)}`
    : endpoint;
    
  return fetchApi<T>(url, { method: 'GET' });
}

/**
 * Generic POST request
 */
export function post<T, D = unknown>(endpoint: string, data: D): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Generic PUT request
 */
export function put<T, D = unknown>(endpoint: string, data: D): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Generic DELETE request
 */
export function del<T>(endpoint: string): Promise<T> {
  return fetchApi<T>(endpoint, { method: 'DELETE' });
}

export default {
  get,
  post,
  put,
  delete: del,
};