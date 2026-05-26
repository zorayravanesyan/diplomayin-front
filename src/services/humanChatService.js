import { apiRequest, getApiOrigin } from './httpClient.js';
import { io } from 'socket.io-client';

const inflight = new Map();

function keyFor(path) {
  return path;
}

export async function createDm(userId) {
  return apiRequest('/human-chat/dm', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function createGroup({ title = null, memberIds = [] } = {}) {
  return apiRequest('/human-chat/groups', {
    method: 'POST',
    body: JSON.stringify({
      title,
      member_ids: memberIds,
    }),
  });
}

export async function listHumanConversations() {
  const data = await apiRequest('/human-chat/conversations', { method: 'GET' });
  return data.conversations ?? [];
}

export async function getHumanConversation(conversationId) {
  return apiRequest(`/human-chat/conversations/${conversationId}`, { method: 'GET' });
}

export async function listHumanMessages(conversationId, { cursor = null, limit = 30 } = {}) {
  const qs = new URLSearchParams();
  if (cursor) qs.set('cursor', cursor);
  if (limit) qs.set('limit', String(limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const path = `/human-chat/conversations/${conversationId}/messages${suffix}`;
  const k = keyFor(path);
  if (inflight.has(k)) return inflight.get(k);

  const p = apiRequest(path, { method: 'GET' }).finally(() => {
    inflight.delete(k);
  });
  inflight.set(k, p);
  return p;
}

export async function sendHumanMessage(conversationId, content) {
  return apiRequest(`/human-chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export function connectHumanChatSocket() {
  const token = localStorage.getItem('accessToken');
  return io(getApiOrigin(), {
    transports: ['websocket'],
    auth: { token },
  });
}

