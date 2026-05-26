import { useEffect, useRef } from 'react';
import { mediaUrl } from '../../services/uploadService.js';

function senderLabel(message) {
  if (message.isMine) return 'Դուք';
  return (
    [message.sender?.first_name, message.sender?.last_name].filter(Boolean).join(' ').trim() ||
    message.sender?.username ||
    'Օգտատեր'
  );
}

function MessageAttachments({ attachments }) {
  if (!attachments?.length) return null;

  return (
    <div className="chat-message__attachments">
      {attachments.map((att) => {
        const src = mediaUrl(att.url);
        if (att.type === 'STICKER') {
          return (
            <img
              key={att.id ?? att.url}
              className="chat-message__sticker"
              src={src}
              alt="sticker"
              width={att.width || 128}
              height={att.height || 128}
            />
          );
        }
        return (
          <a key={att.id ?? att.url} href={src} target="_blank" rel="noreferrer">
            <img className="chat-message__image" src={src} alt="image" loading="lazy" />
          </a>
        );
      })}
    </div>
  );
}

export default function HumanMessageList({
  messages,
  loading,
  selectionMode,
  selectedIds,
  onToggleSelect,
}) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, selectionMode]);

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
    <div className={`chat-messages ${selectionMode ? 'chat-messages--select' : ''}`} aria-live="polite">
      {messages.map((message) => {
        const isSelected = selectedIds.has(Number(message.id));
        const hasText = Boolean(message.content?.trim());
        return (
          <article
            key={message.id}
            className={`chat-message ${
              message.isMine ? 'chat-message--user' : 'chat-message--assistant'
            } ${isSelected ? 'chat-message--selected' : ''}`}
            onClick={() => selectionMode && onToggleSelect(message.id)}
            role={selectionMode ? 'button' : undefined}
            tabIndex={selectionMode ? 0 : undefined}
            onKeyDown={(e) => {
              if (!selectionMode) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleSelect(message.id);
              }
            }}
          >
            {selectionMode && (
              <span
                className={`chat-message__check ${isSelected ? 'chat-message__check--on' : ''}`}
                aria-hidden="true"
              >
                {isSelected ? '✓' : ''}
              </span>
            )}
            <div className="chat-message__bubble">
              <span className="chat-message__author">{senderLabel(message)}</span>
              <MessageAttachments attachments={message.attachments} />
              {hasText && <p className="chat-message__content">{message.content}</p>}
            </div>
          </article>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
