import { apiRequest, getApiRoot } from './httpClient.js';

function authHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function readJsonError(response) {
  const error = await response.json().catch(() => ({ message: 'Սխալ է տեղի ունեցել' }));
  const err = new Error(error.message || 'Սխալ է տեղի ունեցել');
  err.code = error.code;
  err.details = error.details;
  throw err;
}

function parseSseEvent(rawEvent) {
  let event = 'message';
  const dataLines = [];

  for (const line of rawEvent.split(/\r?\n/)) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  const dataText = dataLines.join('\n');
  return {
    event,
    data: dataText ? JSON.parse(dataText) : null,
  };
}

export async function createConversation({ title = null, firstMessage = '' } = {}) {
  return apiRequest('/chat/conversations', {
    method: 'POST',
    body: JSON.stringify({
      title,
      ...(firstMessage.trim() && { first_message: firstMessage.trim() }),
    }),
  });
}

export async function listConversations() {
  const data = await apiRequest('/chat/conversations', { method: 'GET' });
  return data.conversations ?? [];
}

export async function getConversation(conversationId) {
  return apiRequest(`/chat/conversations/${conversationId}`, { method: 'GET' });
}

export async function sendMessage(conversationId, content) {
  return apiRequest(`/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function sendMessageStream(conversationId, content, { onChunk, signal } = {}) {
  const response = await fetch(`${getApiRoot()}/chat/conversations/${conversationId}/messages/stream`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ content }),
    signal,
  });

  if (!response.ok) {
    await readJsonError(response);
  }

  if (!response.body) {
    const result = await sendMessage(conversationId, content);
    onChunk?.(result.assistant_message?.content ?? '');
    return result;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let donePayload = null;

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() ?? '';

    for (const rawEvent of events) {
      if (!rawEvent.trim()) continue;

      const { event, data } = parseSseEvent(rawEvent);
      if (event === 'chunk') {
        onChunk?.(data?.content ?? '');
      } else if (event === 'done') {
        donePayload = data;
      } else if (event === 'error') {
        const err = new Error(data?.message || 'Սխալ է տեղի ունեցել');
        err.code = data?.code;
        err.details = data?.details;
        throw err;
      }
    }

    if (done) break;
  }

  return donePayload;
}
