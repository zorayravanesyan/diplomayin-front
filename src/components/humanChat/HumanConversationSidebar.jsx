function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('hy-AM', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function titleForConversation(item) {
  if (item.type === 'DM') {
    const peer = item.dm_peer;
    const name = peer ? [peer.first_name, peer.last_name].filter(Boolean).join(' ').trim() : '';
    return item.title || name || peer?.username || 'Անձնական զրույց';
  }
  return item.title || 'Խմբային զրույց';
}

function unreadLabel(count) {
  const n = Number(count) || 0;
  if (n <= 0) return null;
  if (n === 1) return '1 չկարդացված';
  return `${n} չկարդացված`;
}

function initialsForConversation(item) {
  const title = titleForConversation(item);
  const parts = String(title).trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? 'C';
  const b = parts[1]?.[0] ?? '';
  return `${a}${b}`.toUpperCase();
}

export default function HumanConversationSidebar({
  conversations,
  activeConversationId,
  loading,
  onSelectConversation,
  onCreateDm,
  onCreateGroup,
}) {
  return (
    <aside className="chat-sidebar" aria-label="Մարդկանց զրույցների ցանկ">
      <div className="chat-sidebar__header">
        <div>
          <h2 className="chat-sidebar__title">Զրույցներ</h2>
          <p className="chat-sidebar__subtitle">Մարդկանց հաղորդագրություններ</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="chat-sidebar__new"
            onClick={onCreateDm}
            aria-label="Նոր DM"
            title="Նոր DM"
          >
            DM
          </button>
          <button
            type="button"
            className="chat-sidebar__new"
            onClick={onCreateGroup}
            aria-label="Նոր խումբ"
            title="Նոր խումբ"
          >
            +
          </button>
        </div>
      </div>

      {loading ? (
        <p className="chat-sidebar__state">Բեռնում...</p>
      ) : conversations.length === 0 ? (
        <div className="chat-sidebar__empty">
          <p>Դեռ զրույց չկա։</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn--outline" onClick={onCreateDm}>
              Նոր DM
            </button>
            <button type="button" className="btn btn--primary" onClick={onCreateGroup}>
              Նոր խումբ
            </button>
          </div>
        </div>
      ) : (
        <ul className="chat-sidebar__list">
          {conversations.map((conversation) => {
            const unread = Number(conversation.unread_count) || 0;
            const isActive = Number(activeConversationId) === Number(conversation.id);
            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  className={`chat-sidebar__item ${isActive ? 'chat-sidebar__item--active' : ''} ${
                    unread > 0 && !isActive ? 'chat-sidebar__item--unread' : ''
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <span className="tg-like__avatar" aria-hidden="true">
                    {initialsForConversation(conversation)}
                  </span>
                  <span className="tg-like__meta">
                    <span className="chat-sidebar__item-title">{titleForConversation(conversation)}</span>
                    {conversation.last_message_preview && (
                      <span className="chat-sidebar__preview">{conversation.last_message_preview}</span>
                    )}
                    {unread > 0 && !isActive && (
                      <span className="chat-sidebar__unread-label">{unreadLabel(unread)}</span>
                    )}
                  </span>
                  <span className="chat-sidebar__item-end">
                    {unread > 0 && !isActive && (
                      <span className="chat-sidebar__unread-badge" aria-label={unreadLabel(unread)}>
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                    <span className="chat-sidebar__date">{formatDate(conversation.updated_at)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

