const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

export function getApiRoot() {
  return API_ROOT;
}

/**
 * @param {string} path - e.g. '/auth/register' or '/users/teachers'
 * @param {RequestInit} options
 */
export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = path.startsWith('http') ? path : `${API_ROOT}${path}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    const err = new Error(error.message || `HTTP error! status: ${response.status}`);
    err.code = error.code;
    err.details = error.details;
    throw err;
  }

  return response.json();
}
