import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ConversationSidebar from '../components/chat/ConversationSidebar';
import MessageInput from '../components/chat/MessageInput';
import MessageList from '../components/chat/MessageList';
import {
  createConversation,
  getConversation,
  listConversations,
  sendMessageStream,
} from '../services/chatService';

function createTempMessage(role, content) {
  return {
    id: `temp-${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    created_at: new Date().toISOString(),
  };
}

function getErrorMessage(error) {
  if (error?.code === 'UNAUTHORIZED') {
    return 'Խնդրում ենք կրկին մուտք գործել։';
  }
  if (error?.code === 'NOT_FOUND') {
    return 'Զրույցը չի գտնվել։';
  }
  return error?.message || 'Սխալ է տեղի ունեցել';
}

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const activeRequestRef = useRef(null);
  const skipMessageLoadRef = useRef(null);

  const activeConversation = useMemo(
    () => conversations.find((item) => Number(item.id) === Number(activeConversationId)),
    [conversations, activeConversationId]
  );

  const reloadConversations = useCallback(async () => {
    const items = await listConversations();
    setConversations(items);
    return items;
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    let cancelled = false;

    async function load() {
      setLoadingConversations(true);
      setError('');
      try {
        const items = await listConversations();
        if (cancelled) return;
        setConversations(items);
        if (items.length > 0) {
          setActiveConversationId(items[0].id);
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingConversations(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      activeRequestRef.current?.abort();
    };
  }, [authLoading, navigate, user]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    if (Number(skipMessageLoadRef.current) === Number(activeConversationId)) {
      skipMessageLoadRef.current = null;
      return;
    }

    let cancelled = false;

    async function loadMessages() {
      setLoadingMessages(true);
      setError('');
      try {
        const data = await getConversation(activeConversationId);
        if (!cancelled) {
          setMessages(data.messages ?? []);
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    }

    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [activeConversationId]);

  const handleCreateConversation = useCallback(async () => {
    if (creating) return;

    setCreating(true);
    setError('');
    try {
      const result = await createConversation();
      setConversations((prev) => [result.conversation, ...prev]);
      skipMessageLoadRef.current = result.conversation.id;
      setActiveConversationId(result.conversation.id);
      setMessages(result.messages ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }, [creating]);

  const handleSendMessage = useCallback(
    async (content) => {
      if (sending) return;

      setSending(true);
      setError('');

      const userMessage = createTempMessage('user', content);
      const assistantMessage = createTempMessage('assistant', '');
      let conversationId = activeConversationId;

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      try {
        if (!conversationId) {
          const result = await createConversation({ title: content.slice(0, 60) });
          conversationId = result.conversation.id;
          setConversations((prev) => [result.conversation, ...prev]);
          skipMessageLoadRef.current = conversationId;
          setActiveConversationId(conversationId);
        }

        const controller = new AbortController();
        activeRequestRef.current = controller;

        const result = await sendMessageStream(conversationId, content, {
          signal: controller.signal,
          onChunk: (chunk) => {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantMessage.id
                  ? { ...message, content: `${message.content}${chunk}` }
                  : message
              )
            );
          },
        });

        if (!result) {
          throw new Error('Սխալ է տեղի ունեցել');
        }

        setMessages((prev) =>
          prev.map((message) => {
            if (message.id === userMessage.id) return result.user_message;
            if (message.id === assistantMessage.id) return result.assistant_message;
            return message;
          })
        );
        await reloadConversations();
      } catch (err) {
        setMessages((prev) =>
          prev.filter(
            (message) => message.id !== userMessage.id && message.id !== assistantMessage.id
          )
        );
        setError(getErrorMessage(err));
      } finally {
        activeRequestRef.current = null;
        setSending(false);
      }
    },
    [activeConversationId, reloadConversations, sending]
  );

  if (authLoading) {
    return (
      <section className="page-section">
        <div className="container">
          <p className="chat-page__state">Բեռնում...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="chat-page">
      <div className="container chat-page__container">
        <div className="chat-page__shell">
          <ConversationSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            loading={loadingConversations}
            onSelectConversation={setActiveConversationId}
            onCreateConversation={handleCreateConversation}
          />

          <div className="chat-main">
            <div className="chat-main__header">
              <div>
                <h1 className="chat-main__title">
                  {activeConversation?.title || 'Առողջության զրույց'}
                </h1>
                <p className="chat-main__subtitle">
                  Գրեք հարցը, իսկ օգնականը կպատասխանի իրական ժամանակում։
                </p>
              </div>
              {creating && <span className="chat-main__badge">Ստեղծվում է...</span>}
            </div>

            {error && (
              <div className="auth-page__error chat-page__error" role="alert">
                {error}
              </div>
            )}

            <MessageList messages={messages} loading={loadingMessages} streaming={sending} />
            <MessageInput
              disabled={loadingConversations || loadingMessages || creating}
              sending={sending}
              onSend={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
