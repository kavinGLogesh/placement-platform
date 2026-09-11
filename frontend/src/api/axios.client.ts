import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach timestamp and optional tokens
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add custom trace or timestamp headers if needed
    config.headers.set('X-Request-Timestamp', new Date().toISOString());
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Uniform error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorDetails = {
      message: error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data
        ? String((error.response.data as { message: unknown }).message)
        : error.message || 'Network communication failure',
      statusCode: error.response?.status,
      code: error.code,
    };
    return Promise.reject(errorDetails);
  }
);
