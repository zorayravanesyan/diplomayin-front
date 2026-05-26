function displayName(user) {
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
  return name || user?.username || (user?.id ? `#${user.id}` : '');
}

export default function ConversationInfoModal({ open, onClose, info, loading }) {
  if (!open) return null;

  const conversation = info?.conversation;
  const members = info?.members ?? [];
  const isDm = conversation?.type === 'DM';
  const peer = conversation?.dm_peer;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2 className="modal__title">{isDm ? 'Տվյալներ' : 'Խմբի տվյալներ'}</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Փակել">
            ×
          </button>
        </div>

        <div className="modal__form">
          {loading ? (
            <p className="human-chat-picker__hint">Բեռնում...</p>
          ) : isDm ? (
            <div className="tg-info__card">
              <div className="tg-info__row">
                <span className="tg-info__label">Login</span>
                <span className="tg-info__value">@{peer?.username || '-'}</span>
              </div>
              <div className="tg-info__row">
                <span className="tg-info__label">Անուն Ազգանուն</span>
                <span className="tg-info__value">{displayName(peer) || '-'}</span>
              </div>
              <div className="tg-info__row">
                <span className="tg-info__label">Email</span>
                <span className="tg-info__value">{peer?.email || '-'}</span>
              </div>
              <div className="tg-info__row">
                <span className="tg-info__label">Age</span>
                <span className="tg-info__value">{peer?.age ?? '-'}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="tg-info__card" style={{ marginBottom: 16 }}>
                <div className="tg-info__row">
                  <span className="tg-info__label">Խմբի անուն</span>
                  <span className="tg-info__value">{conversation?.title || 'Խումբ'}</span>
                </div>
                <div className="tg-info__row">
                  <span className="tg-info__label">Անդամներ</span>
                  <span className="tg-info__value">{members.length}</span>
                </div>
              </div>

              <div className="tg-info__members">
                {members.map((m) => (
                  <div key={m.user?.id ?? Math.random()} className="tg-info__member">
                    <div className="tg-info__member-main">
                      <div className="tg-info__member-name">{displayName(m.user)}</div>
                      <div className="tg-info__member-sub">
                        @{m.user?.username || '-'} · {m.user?.email || '-'} · age: {m.user?.age ?? '-'}
                      </div>
                    </div>
                    <div className="tg-info__member-role">{m.role}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

