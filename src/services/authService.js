import { apiRequest } from './httpClient.js';

function persistTokens(response) {
  if (response.accessToken && response.refreshToken) {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
  }
}

// Registration
export const register = async (data) => {
  const response = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: data.email,
      username: data.username,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      ...(data.gender && { gender: data.gender }),
      teacher_ids: data.teacher_ids,
    }),
  });
  persistTokens(response);
  return response;
};

// Login
export const login = async (loginData, password) => {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      login_data: loginData,
      password,
    }),
  });

  persistTokens(response);

  return response;
};

// Get profile
export const getProfile = async () => {
  return apiRequest('/auth/profile', {
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
  if (data.age !== undefined) updateData.age = data.age;
  if (data.gender !== undefined) updateData.gender = data.gender;

  return apiRequest('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
};

export async function refreshSessionUser() {
  const data = await getProfile();
  return data.user;
}

// Logout
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
