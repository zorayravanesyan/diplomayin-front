const API_BASE_URL = 'http://localhost:5050/api/auth';

// Get stored token
const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

// API call helper
const apiCall = async (endpoint, options = {}) => {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Registration
export const register = async (data) => {
  const response = await apiCall('/register', {
    method: 'POST',
    body: JSON.stringify({
      email: data.email,
      username: data.username,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
    }),
  });
  return response;
};

// Login
export const login = async (loginData, password) => {
  const response = await apiCall('/login', {
    method: 'POST',
    body: JSON.stringify({
      login_data: loginData,
      password,
    }),
  });
  
  // Save tokens
  if (response.accessToken && response.refreshToken) {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
  }
  
  return response;
};

// Get profile
export const getProfile = async () => {
  return apiCall('/profile', {
    method: 'GET',
  });
};

// Update profile
export const updateProfile = async (data) => {
  const updateData = {};
  if (data.first_name !== undefined) updateData.first_name = data.first_name;
  if (data.last_name !== undefined) updateData.last_name = data.last_name;
  if (data.weight_kg !== undefined) updateData.weight_kg = data.weight_kg;
  if (data.height_sm !== undefined) updateData.height_sm = data.height_sm;
  if (data.gender !== undefined) updateData.gender = data.gender;

  return apiCall('/profile', {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
};

// Logout
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
