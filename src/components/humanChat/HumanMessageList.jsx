import { useEffect, useRef } from 'react';

export default function HumanMessageList({ messages, loading }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

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
          <h2 className="chat-empty__title">Գրեք առաջին հաղորդագրությունը</h2>
          <p className="chat-empty__text">Սկսեք զրույցը։</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-messages" aria-live="polite">
      {messages.map((message) => (
        <article
          key={message.id}
          className={`chat-message ${
            message.isMine ? 'chat-message--user' : 'chat-message--assistant'
          }`}
        >
          <div className="chat-message__bubble">
            <span className="chat-message__author">
              {message.isMine
                ? 'Դուք'
                : [message.sender?.first_name, message.sender?.last_name].filter(Boolean).join(' ').trim() ||
                  message.sender?.username ||
                  'Օգտատեր'}
            </span>
            <p className="chat-message__content">{message.content}</p>
          </div>
        </article>
      ))}
      <div ref={endRef} />
    </div>
  );
}

