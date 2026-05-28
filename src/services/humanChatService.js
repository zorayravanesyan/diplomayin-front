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

export async function sendHumanMessage(conversationId, { content = '', attachments = [] } = {}) {
  return apiRequest(`/human-chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      content: content ?? '',
      attachments,
    }),
  });
}

export async function deleteHumanMessages(conversationId, messageIds) {
  return apiRequest(`/human-chat/conversations/${conversationId}/messages/delete`, {
    method: 'POST',
    body: JSON.stringify({ message_ids: messageIds }),
  });
}

export async function forwardHumanMessages(conversationId, messageIds, targetConversationIds) {
  return apiRequest(`/human-chat/conversations/${conversationId}/messages/forward`, {
    method: 'POST',
    body: JSON.stringify({
      message_ids: messageIds,
      target_conversation_ids: targetConversationIds,
    }),
  });
}

export async function updateHumanGroup(conversationId, title) {
  return apiRequest(`/human-chat/conversations/${conversationId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

export async function addHumanGroupMembers(conversationId, memberIds) {
  return apiRequest(`/human-chat/conversations/${conversationId}/members`, {
    method: 'POST',
    body: JSON.stringify({ member_ids: memberIds }),
  });
}

export async function removeHumanGroupMember(conversationId, userId) {
  return apiRequest(`/human-chat/conversations/${conversationId}/members/${userId}`, {
    method: 'DELETE',
  });
}

export async function deleteHumanConversation(conversationId) {
  return apiRequest(`/human-chat/conversations/${conversationId}`, {
    method: 'DELETE',
  });
}

export async function getHumanUnreadSummary() {
  return apiRequest('/human-chat/unread', { method: 'GET' });
}

export async function markHumanConversationRead(conversationId) {
  return apiRequest(`/human-chat/conversations/${conversationId}/read`, {
    method: 'POST',
  });
}

export function connectHumanChatSocket() {
  const token = localStorage.getItem('accessToken');
  return io(getApiOrigin(), {
    transports: ['websocket'],
    auth: { token },
  });
}

