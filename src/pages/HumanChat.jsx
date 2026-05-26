import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HumanConversationSidebar from '../components/humanChat/HumanConversationSidebar';
import HumanMessageList from '../components/humanChat/HumanMessageList';
import CreateGroupModal from '../components/humanChat/CreateGroupModal';
import CreateDmModal from '../components/humanChat/CreateDmModal';
import MessageInput from '../components/chat/MessageInput';
import {
  connectHumanChatSocket,
  createDm,
  createGroup,
  listHumanConversations,
  listHumanMessages,
  sendHumanMessage,
} from '../services/humanChatService';

function getErrorMessage(error) {
  if (error?.code === 'UNAUTHORIZED') return 'Խնդրում ենք կրկին մուտք գործել։';
  if (error?.code === 'FORBIDDEN') return 'Մուտքը արգելված է։';
  if (error?.code === 'NOT_FOUND') return 'Չի գտնվել։';
  return error?.message || 'Սխալ է տեղի ունեցել';
}

function decorateMessages(rows, myUserId) {
  return (rows ?? []).map((m) => ({
    ...m,
    isMine: Number(m.sender_user_id) === Number(myUserId),
  }));
}

function applyConversationPreview(prev, { conversationId, preview, updatedAt }) {
  const cid = Number(conversationId);
  const existing = prev.find((c) => Number(c.id) === cid);
  if (!existing) return prev;
  const patched = {
    ...existing,
    last_message_preview: preview ?? existing.last_message_preview ?? null,
    updated_at: updatedAt ?? existing.updated_at,
  };
  return [patched, ...prev.filter((c) => Number(c.id) !== cid)];
}

export default function HumanChat() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const activeConversationIdRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showDmModal, setShowDmModal] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [creatingDm, setCreatingDm] = useState(false);

  const activeConversation = useMemo(
    () => conversations.find((c) => Number(c.id) === Number(activeConversationId)),
    [conversations, activeConversationId]
  );

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const reloadConversations = useCallback(async () => {
    const items = await listHumanConversations();
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
        const items = await listHumanConversations();
        if (cancelled) return;
        setConversations(items);
        if (items.length > 0) setActiveConversationId(items[0].id);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingConversations(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, navigate, user]);

  useEffect(() => {
    if (!user) return;

    const socket = connectHumanChatSocket();
    socketRef.current = socket;

    socket.on('connect_error', () => {
      // ignore noisy errors, user will see via REST errors
    });

    socket.on('human_message.created', (payload) => {
      const msg = payload?.message;
      if (!msg) return;
      if (Number(msg.conversation_id) !== Number(activeConversationIdRef.current)) return;
      setMessages((prev) => {
        // Dedup: some UIs may optimistically add same id before socket arrives
        if (prev.some((m) => String(m.id) === String(msg.id))) return prev;
        return [...prev, { ...msg, isMine: Number(msg.sender_user_id) === Number(user.id) }];
      });
      setConversations((prev) =>
        applyConversationPreview(prev, {
          conversationId: msg.conversation_id,
          preview: msg.content?.slice?.(0, 120) ?? null,
          updatedAt: msg.created_at,
        })
      );
    });

    socket.on('human_conversation.joined', () => {
      // Keep this as fetch because this event can happen for other conversations.
      reloadConversations().catch(() => {});
    });

    return () => {
      socket.off('human_message.created');
      socket.off('human_conversation.joined');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [reloadConversations, user]);

  // Ensure this socket joins the active conversation room (server-side)
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeConversationId) return;
    socket.emit('human_conversation.subscribe', { conversation_id: activeConversationId });
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId || !user) {
      setMessages([]);
      setNextCursor(null);
      return;
    }

    let cancelled = false;

    async function loadMessages() {
      setLoadingMessages(true);
      setError('');
      try {
        const result = await listHumanMessages(activeConversationId, { limit: 50 });
        if (cancelled) return;
        setMessages(decorateMessages(result.messages, user.id));
        setNextCursor(result.next_cursor);
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
  }, [activeConversationId, user]);

  const handleCreateGroupSubmit = useCallback(
    async ({ title, memberIds }) => {
      setCreatingGroup(true);
      setError('');
      try {
        const result = await createGroup({ title, memberIds });
        await reloadConversations();
        setActiveConversationId(result.conversation.id);
        setShowGroupModal(false);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setCreatingGroup(false);
      }
    },
    [reloadConversations]
  );

  const handleCreateDmSelect = useCallback(
    async (userId) => {
      setCreatingDm(true);
      setError('');
      try {
        const result = await createDm(userId);
        await reloadConversations();
        setActiveConversationId(result.conversation.id);
        setShowDmModal(false);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setCreatingDm(false);
      }
    },
    [reloadConversations]
  );

  const handleSend = useCallback(
    async (content) => {
      if (!activeConversationId || sending) return;
      setSending(true);
      setError('');

      try {
        const result = await sendHumanMessage(activeConversationId, content);
        // optimistic add; socket event might also arrive
        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === String(result.message?.id))) return prev;
          return [...prev, { ...result.message, isMine: true }];
        });
        setConversations((prev) =>
          applyConversationPreview(prev, {
            conversationId: activeConversationId,
            preview: result.message?.content?.slice?.(0, 120) ?? null,
            updatedAt: result.message?.created_at ?? null,
          })
        );
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setSending(false);
      }
    },
    [activeConversationId, sending]
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
          <HumanConversationSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            loading={loadingConversations}
            onSelectConversation={setActiveConversationId}
            onCreateDm={() => setShowDmModal(true)}
            onCreateGroup={() => setShowGroupModal(true)}
          />

          <div className="chat-main">
            <div className="chat-main__header">
              <div>
                <h1 className="chat-main__title">
                  {activeConversation?.title || (activeConversation?.type === 'DM' ? 'Անձնական զրույց' : 'Խմբային զրույց')}
                </h1>
                <p className="chat-main__subtitle">Հաղորդագրությունները գալիս են իրական ժամանակում։</p>
              </div>
            </div>

            {error && (
              <div className="auth-page__error chat-page__error" role="alert">
                {error}
              </div>
            )}

            <HumanMessageList messages={messages} loading={loadingMessages} />
            <MessageInput
              disabled={!activeConversationId || loadingConversations || loadingMessages}
              sending={sending}
              onSend={handleSend}
            />
          </div>
        </div>
      </div>

      <CreateGroupModal
        open={showGroupModal}
        onClose={() => !creatingGroup && setShowGroupModal(false)}
        onSubmit={handleCreateGroupSubmit}
        submitting={creatingGroup}
        currentUserId={user?.id}
      />
      <CreateDmModal
        open={showDmModal}
        onClose={() => !creatingDm && setShowDmModal(false)}
        onSelect={handleCreateDmSelect}
        selecting={creatingDm}
        currentUserId={user?.id}
      />
    </section>
  );
}

