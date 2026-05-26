function titleForConversation(item) {
  if (item.type === 'DM') {
    const peer = item.dm_peer;
    const name = peer ? [peer.first_name, peer.last_name].filter(Boolean).join(' ').trim() : '';
    return item.title || name || peer?.username || 'Անձնական զրույց';
  }
  return item.title || 'Խմբային զրույց';
}

export default function ForwardMessagesModal({
  open,
  onClose,
  conversations,
  currentConversationId,
  selectedCount,
  onForward,
  submitting,
}) {
  if (!open) return null;

  const targets = conversations.filter((c) => Number(c.id) !== Number(currentConversationId));

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2 className="modal__title">Փոխանցել ({selectedCount})</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Փակել">
            ×
          </button>
        </div>

        <div className="modal__form">
          {targets.length === 0 ? (
            <p className="human-chat-picker__hint">Այլ զրույց չկա։</p>
          ) : (
            <ul className="auth-page__checkbox-list human-chat-picker__list">
              {targets.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="human-chat-picker__row"
                    onClick={() => onForward(c.id)}
                    disabled={submitting}
                  >
                    <span className="human-chat-picker__row-name">{titleForConversation(c)}</span>
                    <span className="human-chat-picker__row-meta">
                      {c.type === 'DM' ? 'Անձնական' : 'Խումբ'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
