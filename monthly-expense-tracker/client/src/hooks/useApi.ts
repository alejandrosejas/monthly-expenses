import { useState, useCallback } from 'react';
import api, { ApiError } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | Error | null;
}

interface UseApiResponse<T> extends UseApiState<T> {
  execute: () => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for making API calls with loading and error states
 */
export function useApi<T, P extends any[]>(
  apiMethod: (...args: P) => Promise<T>,
  ...params: P
): UseApiResponse<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiMethod(...params);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const apiError = error instanceof ApiError 
        ? error 
        : error instanceof Error
          ? new ApiError(error.message, 0)
          : new ApiError('Unknown error', 0);
          
      setState({ data: null, loading: false, error: apiError });
      return null;
    }
  }, [apiMethod, ...params]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for GET requests
 */
export function useGet<T>(endpoint: string, queryParams?: Record<string, string>) {
  return useApi<T, [string, Record<string, string> | undefined]>(
    api.get,
    endpoint,
    queryParams
  );
}

/**
 * Hook for POST requests
 */
export function usePost<T, D = unknown>(endpoint: string, data: D) {
  return useApi<T, [string, D]>(api.post, endpoint, data);
}

/**
 * Hook for PUT requests
 */
export function usePut<T, D = unknown>(endpoint: string, data: D) {
  return useApi<T, [string, D]>(api.put, endpoint, data);
}

/**
 * Hook for DELETE requests
 */
export function useDelete<T>(endpoint: string) {
  return useApi<T, [string]>(api.delete, endpoint);
}

export default {
  useGet,
  usePost,
  usePut,
  useDelete,
};