import { useEffect, useRef } from 'react';

function roleLabel(role) {
  if (role === 'user') return 'Դուք';
  if (role === 'assistant') return 'Օգնական';
  return 'Համակարգ';
}

export default function MessageList({ messages, loading, streaming }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, streaming]);

  if (loading) {
    return (
      <div className="chat-messages chat-messages--center">
        <p className="chat-page__state">Բեռնում...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="chat-messages chat-messages--center">
        <div className="chat-empty">
          <span className="chat-empty__icon" aria-hidden="true" />
          <h2 className="chat-empty__title">Սկսեք նոր զրույց</h2>
          <p className="chat-empty__text">
            Հարցրեք մարզումների, սննդակարգի կամ առողջ սովորությունների մասին։
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-messages" aria-live="polite">
      {messages.map((message) => (
        <article
          key={message.id}
          className={`chat-message chat-message--${message.role || 'assistant'}`}
        >
          <div className="chat-message__bubble">
            <span className="chat-message__author">{roleLabel(message.role)}</span>
            <p className="chat-message__content">{message.content}</p>
          </div>
        </article>
      ))}
      {streaming && (
        <div className="chat-typing" aria-label="Օգնականը գրում է">
          <span />
          <span />
          <span />
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
