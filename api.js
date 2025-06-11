import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default timeout
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Default 15 second timeout
});

// Store token in-memory here for interceptor usage
let accessToken = null;
let refreshToken = null;

// Helper to set tokens
export const setTokens = (tokens) => {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken; // if you have refresh tokens
};

// Helper to clear tokens (e.g., on logout)
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
};

// Request interceptor to attach token
axiosInstance.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors & refresh token once
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if request was aborted
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      return Promise.reject(error);
    }

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      refreshToken
    ) {
      originalRequest._retry = true;

      try {
        // Call your refresh token API endpoint
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        // Update tokens
        setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });

        // Update the Authorization header and retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// AUTH FUNCTIONS

export const login = async (email, password) => {
  const res = await axiosInstance.post('/auth/login', { email, password });
  // Assume response includes tokens
  setTokens({
    accessToken: res.data.token,
    refreshToken: res.data.refreshToken,
  });
  return res.data; // { user, token, refreshToken }
};

export const register = async (email, password, name) => {
  const res = await axiosInstance.post('/auth/register', {
    email,
    password,
    name,
  });
  setTokens({
    accessToken: res.data.token,
    refreshToken: res.data.refreshToken,
  });
  return res.data; // { user, token, refreshToken }
};

export const logout = () => {
  clearTokens();
  // Optionally notify backend or clear localStorage/sessionStorage here
};

// TASK CRUD FUNCTIONS - Updated to accept token and options

export const getTasks = async (token = null, options = {}) => {
  const config = {
    ...options, // This includes signal, timeout, etc.
  };
  
  // If token is provided explicitly, use it (for backward compatibility)
  if (token && token !== accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  
  const res = await axiosInstance.get('/tasks', config);
  return res.data;
};

export const createTask = async (taskData, token = null, options = {}) => {
  const config = {
    ...options,
  };
  
  if (token && token !== accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  
  const res = await axiosInstance.post('/tasks', taskData, config);
  return res.data;
};

export const updateTask = async (taskId, updates, token = null, options = {}) => {
  const config = {
    ...options,
  };
  
  if (token && token !== accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  
  const res = await axiosInstance.put(`/tasks/${taskId}`, updates, config);
  return res.data;
};

export const deleteTask = async (taskId, token = null, options = {}) => {
  const config = {
    ...options,
  };
  
  if (token && token !== accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  
  const res = await axiosInstance.delete(`/tasks/${taskId}`, config);
  return res.data;
};

export const getProfile = async (token = null, options = {}) => {
  const config = {
    ...options,
  };
  
  if (token && token !== accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  
  const res = await axiosInstance.get('/auth/me', config);
  return res.data;
};

// Utility function to check if token is expired
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

// Helper to set access token (for compatibility with your App.js)
export const setAccessToken = (token) => {
  accessToken = token;
};