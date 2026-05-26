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

/** Ադմին — { teachers, students } մեկ հարցումով */
export async function getAdminOverview() {
  return apiRequest('/users/admin/overview', { method: 'GET' });
}

export async function getAdminTeachersRoster() {
  const data = await apiRequest('/users/admin/teachers', { method: 'GET' });
  return data.teachers ?? [];
}

export async function getAdminStudentsRoster() {
  const data = await apiRequest('/users/admin/students', { method: 'GET' });
  return data.students ?? [];
}

/** user + settings + teachers[] + students[] + teacher_ids */
export async function getUserWithRelations(userId) {
  const data = await apiRequest(`/users/${userId}`, { method: 'GET' });
  return data.user;
}

export async function updateUserById(userId, body) {
  const data = await apiRequest(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return data.user;
}

export async function createTeacher(body) {
  const data = await apiRequest('/users/teachers', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return data.user;
}

export async function searchUsers(q, { limit = 20 } = {}) {
  const qs = new URLSearchParams();
  if (q) qs.set('q', q);
  if (limit) qs.set('limit', String(limit));
  const data = await apiRequest(`/users/search?${qs.toString()}`, { method: 'GET' });
  return data.users ?? [];
}
