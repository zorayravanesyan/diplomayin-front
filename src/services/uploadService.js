import { getApiOrigin, getApiRoot } from './httpClient.js';

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${getApiOrigin()}${path}`;
}

export async function uploadChatImage(file) {
  const token = localStorage.getItem('accessToken');
  const form = new FormData();
  form.append('file', file);

  const response = await fetch(`${getApiRoot()}/uploads/images`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: form,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    const err = new Error(error.message || 'Upload failed');
    err.code = error.code;
    throw err;
  }

  return response.json();
}
