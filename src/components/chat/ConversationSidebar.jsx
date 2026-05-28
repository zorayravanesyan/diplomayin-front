function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('hy-AM', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function ConversationSidebar({
  conversations,
  activeConversationId,
  loading,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  deletingId,
}) {
  return (
    <aside className="chat-sidebar" aria-label="Զրույցների ցանկ">
      <div className="chat-sidebar__header">
        <div>
          <h2 className="chat-sidebar__title">Զրույցներ</h2>
          <p className="chat-sidebar__subtitle">Ձեր առողջության օգնականը</p>
        </div>
        <button
          type="button"
          className="chat-sidebar__new"
          onClick={onCreateConversation}
          aria-label="Նոր զրույց"
        >
          +
        </button>
      </div>

      {loading ? (
        <p className="chat-sidebar__state">Բեռնում...</p>
      ) : conversations.length === 0 ? (
        <div className="chat-sidebar__empty">
          <p>Դեռ զրույց չկա։</p>
          <button type="button" className="btn btn--primary" onClick={onCreateConversation}>
            Նոր զրույց
          </button>
        </div>
      ) : (
        <ul className="chat-sidebar__list">
          {conversations.map((conversation) => (
            <li key={conversation.id} className="chat-sidebar__item-wrap">
              <button
                type="button"
                className={`chat-sidebar__item ${
                  Number(activeConversationId) === Number(conversation.id)
                    ? 'chat-sidebar__item--active'
                    : ''
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <span className="chat-sidebar__item-title">
                  {conversation.title || 'Անվերնագիր զրույց'}
                </span>
                {conversation.last_message_preview && (
                  <span className="chat-sidebar__preview">{conversation.last_message_preview}</span>
                )}
                <span className="chat-sidebar__date">{formatDate(conversation.updated_at)}</span>
              </button>
              {onDeleteConversation && (
                <button
                  type="button"
                  className="chat-sidebar__delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  disabled={Number(deletingId) === Number(conversation.id)}
                  aria-label="Ջնջել զրույցը"
                  title="Ջնջել"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
