import { apiRequest } from './httpClient.js';

export async function getPublicTeachers() {
  const data = await apiRequest('/users/teachers', { method: 'GET' });
  return data.teachers ?? [];
}

export async function getMyTeachers() {
  const data = await apiRequest('/users/me/teachers', { method: 'GET' });
  return data.teachers ?? [];
}

export async function getMyStudents() {
  const data = await apiRequest('/users/me/students', { method: 'GET' });
  return data.students ?? [];
}
