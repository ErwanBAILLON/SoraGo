/**
 * Base API configuration for the application
 * This will be expanded when integrating with a real backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.sorago.com';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Generic API client for making HTTP requests
 */
export const apiClient = async <T>(
  endpoint: string, 
  options: FetchOptions = {}
): Promise<T> => {
  const { 
    method = 'GET', 
    headers = {}, 
    body 
  } = options;

  // Prepare headers with default content type
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include', // For handling authentication cookies
  };

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, requestOptions);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      };
    }
    
    // Return parsed JSON or empty object if no content
    if (response.status === 204) {
      return {} as T;
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
