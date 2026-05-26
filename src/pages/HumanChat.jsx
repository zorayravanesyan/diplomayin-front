import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HumanConversationSidebar from '../components/humanChat/HumanConversationSidebar';
import HumanMessageList from '../components/humanChat/HumanMessageList';
import CreateGroupModal from '../components/humanChat/CreateGroupModal';
import CreateDmModal from '../components/humanChat/CreateDmModal';
import ConversationInfoModal from '../components/humanChat/ConversationInfoModal';
import ForwardMessagesModal from '../components/humanChat/ForwardMessagesModal';
import HumanMessageInput from '../components/humanChat/HumanMessageInput';
import {
  connectHumanChatSocket,
  createDm,
  createGroup,
  deleteHumanMessages,
  forwardHumanMessages,
  getHumanConversation,
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

function messagePreview(message) {
  if (message?.content?.trim()) return message.content.slice(0, 120);
  const attachments = message?.attachments ?? [];
  if (attachments.some((a) => a.type === 'STICKER')) return '🧩 Sticker';
  if (attachments.length) return '📷 Photo';
  return '';
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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [conversationInfo, setConversationInfo] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState(() => new Set());
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const activeConversation = useMemo(
    () => conversations.find((c) => Number(c.id) === Number(activeConversationId)),
    [conversations, activeConversationId]
  );

  const activeHeader = useMemo(() => {
    if (!activeConversation) return { title: 'Զրույց', subtitle: '' };
    if (activeConversation.type === 'DM') {
      const peer = activeConversation.dm_peer;
      const full = peer ? [peer.first_name, peer.last_name].filter(Boolean).join(' ').trim() : '';
      return {
        title: full || peer?.username || 'Անձնական զրույց',
        subtitle: peer?.username ? `@${peer.username}` : '',
      };
    }
    return { title: activeConversation.title || 'Խումբ', subtitle: 'Խմբային զրույց' };
  }, [activeConversation]);

  const isOwner = activeConversation?.my_role === 'OWNER';
  const selectedCount = selectedMessageIds.size;

  const clearSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedMessageIds(new Set());
  }, []);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
    clearSelection();
  }, [activeConversationId, clearSelection]);

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
          preview: messagePreview(msg) || null,
          updatedAt: msg.created_at,
        })
      );
    });

    socket.on('human_messages.deleted', (payload) => {
      const cid = payload?.conversation_id;
      if (Number(cid) !== Number(activeConversationIdRef.current)) return;
      const ids = new Set((payload?.message_ids ?? []).map((id) => Number(id)));
      if (!ids.size) return;
      setMessages((prev) => prev.filter((m) => !ids.has(Number(m.id))));
      if (payload?.conversation) {
        setConversations((prev) =>
          applyConversationPreview(prev, {
            conversationId: cid,
            preview: payload.conversation.last_message_preview ?? null,
            updatedAt: payload.conversation.updated_at,
          })
        );
      }
    });

    socket.on('human_conversation.joined', () => {
      reloadConversations().catch(() => {});
    });

    return () => {
      socket.off('human_message.created');
      socket.off('human_messages.deleted');
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

  const openConversationInfo = useCallback(async (conversationId) => {
    setShowInfoModal(true);
    setInfoLoading(true);
    try {
      const data = await getHumanConversation(conversationId);
      setConversationInfo(data);
    } catch (err) {
      setConversationInfo(null);
      setError(getErrorMessage(err));
    } finally {
      setInfoLoading(false);
    }
  }, []);

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

  const toggleMessageSelect = useCallback((messageId) => {
    setSelectedMessageIds((prev) => {
      const next = new Set(prev);
      const id = Number(messageId);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (!activeConversationId || !isOwner || selectedCount === 0) return;
    setActionLoading(true);
    setError('');
    try {
      const ids = [...selectedMessageIds];
      const result = await deleteHumanMessages(activeConversationId, ids);
      setMessages((prev) => prev.filter((m) => !ids.includes(Number(m.id))));
      if (result.conversation) {
        setConversations((prev) =>
          applyConversationPreview(prev, {
            conversationId: activeConversationId,
            preview: result.conversation.last_message_preview ?? null,
            updatedAt: result.conversation.updated_at,
          })
        );
      }
      clearSelection();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }, [activeConversationId, clearSelection, isOwner, selectedCount, selectedMessageIds]);

  const handleForwardTo = useCallback(
    async (targetConversationId) => {
      if (!activeConversationId || selectedCount === 0) return;
      setActionLoading(true);
      setError('');
      try {
        const ids = [...selectedMessageIds];
        await forwardHumanMessages(activeConversationId, ids, [targetConversationId]);
        setShowForwardModal(false);
        clearSelection();
        await reloadConversations();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setActionLoading(false);
      }
    },
    [activeConversationId, clearSelection, reloadConversations, selectedCount, selectedMessageIds]
  );

  const handleSend = useCallback(
    async ({ content = '', attachments = [] }) => {
      if (!activeConversationId || sending) return;
      const trimmed = content?.trim?.() ?? '';
      if (!trimmed && (!attachments || attachments.length === 0)) return;

      setSending(true);
      setError('');

      try {
        const result = await sendHumanMessage(activeConversationId, {
          content: trimmed,
          attachments,
        });
        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === String(result.message?.id))) return prev;
          return [...prev, { ...result.message, isMine: true }];
        });
        setConversations((prev) =>
          applyConversationPreview(prev, {
            conversationId: activeConversationId,
            preview: messagePreview(result.message) || null,
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
              {selectionMode ? (
                <div className="chat-actions">
                  <span className="chat-actions__count">Ընտրված՝ {selectedCount}</span>
                  <div className="chat-actions__buttons">
                    <button
                      type="button"
                      className="btn btn--outline"
                      onClick={() => setShowForwardModal(true)}
                      disabled={selectedCount === 0 || actionLoading}
                    >
                      Փոխանցել
                    </button>
                    {isOwner && (
                      <button
                        type="button"
                        className="btn btn--outline"
                        onClick={handleDeleteSelected}
                        disabled={selectedCount === 0 || actionLoading}
                      >
                        Ջնջել
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={clearSelection}
                      disabled={actionLoading}
                    >
                      Չեղարկել
                    </button>
                  </div>
                </div>
              ) : (
                <div className="chat-main__header-row">
                  <div>
                    <h1 className="chat-main__title">
                      <button
                        type="button"
                        className="tg-like__header-btn"
                        onClick={() => activeConversationId && openConversationInfo(activeConversationId)}
                        disabled={!activeConversationId}
                      >
                        {activeHeader.title}
                      </button>
                    </h1>
                    <p className="chat-main__subtitle">
                      {activeHeader.subtitle || 'Հաղորդագրությունները գալիս են իրական ժամանակում։'}
                    </p>
                  </div>
                  {activeConversationId && messages.length > 0 && (
                    <button
                      type="button"
                      className="btn btn--outline chat-actions__select"
                      onClick={() => setSelectionMode(true)}
                    >
                      Ընտրել
                    </button>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="auth-page__error chat-page__error" role="alert">
                {error}
              </div>
            )}

            <HumanMessageList
              messages={messages}
              loading={loadingMessages}
              selectionMode={selectionMode}
              selectedIds={selectedMessageIds}
              onToggleSelect={toggleMessageSelect}
            />
            <HumanMessageInput
              disabled={
                !activeConversationId ||
                loadingConversations ||
                loadingMessages ||
                selectionMode
              }
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

      <ConversationInfoModal
        open={showInfoModal}
        onClose={() => !infoLoading && setShowInfoModal(false)}
        info={conversationInfo}
        loading={infoLoading}
      />

      <ForwardMessagesModal
        open={showForwardModal}
        onClose={() => !actionLoading && setShowForwardModal(false)}
        conversations={conversations}
        currentConversationId={activeConversationId}
        selectedCount={selectedCount}
        onForward={handleForwardTo}
        submitting={actionLoading}
      />
    </section>
  );
}

