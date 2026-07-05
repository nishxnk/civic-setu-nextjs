import axios from 'axios';
import { config } from '@/config/config';
import { auth } from '@/lib/firebase';

const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — inject Firebase token
apiClient.interceptors.request.use(
  async (reqConfig) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        reqConfig.headers.Authorization = `Bearer ${token}`;
      } else if (typeof window !== 'undefined') {
        const legacyToken = localStorage.getItem('authToken');
        if (legacyToken) {
          reqConfig.headers.Authorization = `Bearer ${legacyToken}`;
        }
      }
    } catch {
      // Firebase not initialized — skip token
    }
    return reqConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401/403
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        // Don't redirect here — let the auth context handle it
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
