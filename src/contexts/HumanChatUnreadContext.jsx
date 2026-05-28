import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  connectHumanChatSocket,
  getHumanUnreadSummary,
  markHumanConversationRead,
} from '../services/humanChatService';

const HumanChatUnreadContext = createContext(null);

function normalizeSummary(data) {
  const byConversation = data?.by_conversation ?? {};
  const normalized = {};
  for (const [key, value] of Object.entries(byConversation)) {
    const n = Number(value) || 0;
    if (n > 0) normalized[Number(key)] = n;
  }
  return {
    totalUnread: Number(data?.total_unread) || 0,
    byConversation: normalized,
  };
}

export function HumanChatUnreadProvider({ children }) {
  const { user } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);
  const [byConversation, setByConversation] = useState({});
  const socketRef = useRef(null);

  const applySummary = useCallback((data) => {
    const next = normalizeSummary(data);
    setTotalUnread(next.totalUnread);
    setByConversation(next.byConversation);
    return next;
  }, []);

  const refreshUnread = useCallback(async () => {
    if (!user) {
      setTotalUnread(0);
      setByConversation({});
      return { totalUnread: 0, byConversation: {} };
    }
    try {
      const data = await getHumanUnreadSummary();
      return applySummary(data);
    } catch {
      return null;
    }
  }, [applySummary, user]);

  const markRead = useCallback(
    async (conversationId) => {
      if (!user || !conversationId) return;
      try {
        const data = await markHumanConversationRead(conversationId);
        applySummary(data);
      } catch {
        await refreshUnread();
      }
    },
    [applySummary, refreshUnread, user]
  );

  useEffect(() => {
    if (!user) {
      setTotalUnread(0);
      setByConversation({});
      return undefined;
    }

    refreshUnread();

    const socket = connectHumanChatSocket();
    socketRef.current = socket;

    socket.on('human_unread.updated', (payload) => {
      applySummary(payload);
    });

    socket.on('human_message.created', (payload) => {
      const msg = payload?.message;
      if (!msg?.conversation_id || Number(msg.sender_user_id) === Number(user.id)) return;
      refreshUnread();
    });

    return () => {
      socket.off('human_unread.updated');
      socket.off('human_message.created');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [applySummary, refreshUnread, user]);

  const value = useMemo(
    () => ({
      totalUnread,
      byConversation,
      refreshUnread,
      markRead,
      getUnreadForConversation: (conversationId) =>
        byConversation[Number(conversationId)] ?? 0,
    }),
    [totalUnread, byConversation, refreshUnread, markRead]
  );

  return (
    <HumanChatUnreadContext.Provider value={value}>{children}</HumanChatUnreadContext.Provider>
  );
}

export function useHumanChatUnread() {
  const ctx = useContext(HumanChatUnreadContext);
  if (!ctx) {
    throw new Error('useHumanChatUnread must be used within HumanChatUnreadProvider');
  }
  return ctx;
}
