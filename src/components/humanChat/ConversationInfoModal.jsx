import { useEffect, useMemo, useState } from 'react';
import { useDebouncedUserSearch } from '../../hooks/useDebouncedUserSearch.js';

function displayName(user) {
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
  return name || user?.username || (user?.id ? `#${user.id}` : '');
}

export default function ConversationInfoModal({
  open,
  onClose,
  info,
  loading,
  currentUserId,
  isOwner,
  onUpdateTitle,
  onAddMembers,
  onRemoveMember,
  onDeleteConversation,
  actionLoading,
}) {
  const [titleDraft, setTitleDraft] = useState('');
  const [addQuery, setAddQuery] = useState('');
  const [localError, setLocalError] = useState('');

  const conversation = info?.conversation;
  const members = info?.members ?? [];
  const isDm = conversation?.type === 'DM';
  const peer = conversation?.dm_peer;

  const excludeUserIds = useMemo(
    () => members.map((m) => m.user?.id).filter(Boolean),
    [members]
  );

  const { results: addResults, searching: addSearching, clearResults } = useDebouncedUserSearch({
    enabled: open && isOwner && !isDm,
    query: addQuery,
    currentUserId,
    excludeUserIds,
  });

  useEffect(() => {
    if (open && conversation?.title != null) {
      setTitleDraft(conversation.title || '');
    }
    if (!open) {
      setTitleDraft('');
      setAddQuery('');
      clearResults();
      setLocalError('');
    }
  }, [open, conversation?.title, clearResults]);

  if (!open) return null;

  async function handleSaveTitle(event) {
    event.preventDefault();
    const trimmed = titleDraft.trim();
    if (!trimmed) {
      setLocalError('Խմբի անունը պարտադիր է');
      return;
    }
    setLocalError('');
    try {
      await onUpdateTitle?.(trimmed);
    } catch (err) {
      setLocalError(err?.message || 'Սխալ է տեղի ունեցել');
    }
  }

  async function handleAddUser(user) {
    setLocalError('');
    try {
      await onAddMembers?.([user.id]);
      setAddQuery('');
      clearResults();
    } catch (err) {
      setLocalError(err?.message || 'Սխալ է տեղի ունեցել');
    }
  }

  async function handleRemove(userId) {
    if (!window.confirm('Հեռացնե՞լ այս անդամին խմբից')) return;
    setLocalError('');
    try {
      await onRemoveMember?.(userId);
    } catch (err) {
      setLocalError(err?.message || 'Սխալ է տեղի ունեցել');
    }
  }

  async function handleDeleteChat() {
    const label = isDm ? 'զրույցը' : 'խումբը';
    if (!window.confirm(`Ջնջե՞լ ${label}։ Այս գործողությունը հետարկելի չէ։`)) return;
    setLocalError('');
    try {
      await onDeleteConversation?.();
    } catch (err) {
      setLocalError(err?.message || 'Սխալ է տեղի ունեցել');
    }
  }

  const canDeleteChat = isDm || isOwner;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2 className="modal__title">{isDm ? 'Տվյալներ' : 'Խմբի կառավարում'}</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Փակել">
            ×
          </button>
        </div>

        <div className="modal__form">
          {localError && <div className="modal__error">{localError}</div>}

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
              {isOwner && (
                <form onSubmit={handleSaveTitle} style={{ marginBottom: 16 }}>
                  <label className="contact-form__label auth-page__field--full">
                    <span>Խմբի անուն</span>
                    <input
                      type="text"
                      className="contact-form__input"
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      maxLength={120}
                      disabled={actionLoading}
                    />
                  </label>
                  <button
                    type="submit"
                    className="btn btn--outline"
                    disabled={actionLoading || !titleDraft.trim()}
                  >
                    Պահպանել անունը
                  </button>
                </form>
              )}

              {!isOwner && (
                <div className="tg-info__card" style={{ marginBottom: 16 }}>
                  <div className="tg-info__row">
                    <span className="tg-info__label">Խմբի անուն</span>
                    <span className="tg-info__value">{conversation?.title || 'Խումբ'}</span>
                  </div>
                </div>
              )}

              <div className="tg-info__members">
                {members.map((m) => (
                  <div key={m.user?.id ?? Math.random()} className="tg-info__member">
                    <div className="tg-info__member-main">
                      <div className="tg-info__member-name">{displayName(m.user)}</div>
                      <div className="tg-info__member-sub">
                        @{m.user?.username || '-'} · {m.role}
                      </div>
                    </div>
                    {isOwner &&
                      m.role !== 'OWNER' &&
                      Number(m.user?.id) !== Number(currentUserId) && (
                        <button
                          type="button"
                          className="btn btn--outline"
                          onClick={() => handleRemove(m.user.id)}
                          disabled={actionLoading}
                        >
                          Հեռացնել
                        </button>
                      )}
                  </div>
                ))}
              </div>

              {isOwner && (
                <div style={{ marginTop: 16 }}>
                  <label className="contact-form__label auth-page__field--full">
                    <span>Ավելացնել անդամ</span>
                    <input
                      type="search"
                      className="contact-form__input"
                      value={addQuery}
                      onChange={(e) => setAddQuery(e.target.value)}
                      placeholder="Փնտրել օգտատեր"
                      disabled={actionLoading}
                      autoComplete="off"
                    />
                  </label>
                  <div className="human-chat-picker__results" aria-live="polite">
                    {addSearching && <p className="human-chat-picker__hint">Փնտրում...</p>}
                    {!addSearching && addQuery.trim() && addResults.length === 0 && (
                      <p className="human-chat-picker__hint">Ոչինչ չի գտնվել</p>
                    )}
                    {!addSearching && addResults.length > 0 && (
                      <ul className="auth-page__checkbox-list human-chat-picker__list">
                        {addResults.map((u) => (
                          <li key={u.id}>
                            <button
                              type="button"
                              className="human-chat-picker__row"
                              onClick={() => handleAddUser(u)}
                              disabled={actionLoading}
                            >
                              <span className="human-chat-picker__row-name">{displayName(u)}</span>
                              <span className="human-chat-picker__row-meta">@{u.username}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {canDeleteChat && (
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border, #e5e5e5)' }}>
              <button
                type="button"
                className="btn btn--outline"
                style={{ color: '#c0392b', borderColor: '#c0392b' }}
                onClick={handleDeleteChat}
                disabled={actionLoading}
              >
                {isDm ? 'Ջնջել զրույցը' : 'Ջնջել խումբը'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
