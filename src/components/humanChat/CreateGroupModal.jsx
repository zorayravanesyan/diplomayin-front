import { useEffect, useState } from 'react';
import { useDebouncedUserSearch } from '../../hooks/useDebouncedUserSearch.js';

function displayName(user) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return name || user.username || `#${user.id}`;
}

export default function CreateGroupModal({
  open,
  onClose,
  onSubmit,
  submitting,
  currentUserId,
}) {
  const [title, setTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [localError, setLocalError] = useState('');

  const { results, searching } = useDebouncedUserSearch({
    enabled: open,
    query: searchQuery,
    currentUserId,
    excludeUserIds: selected.map((u) => u.id),
  });

  useEffect(() => {
    if (!open) {
      setTitle('');
      setSearchQuery('');
      setSelected([]);
      setLocalError('');
    }
  }, [open]);

  if (!open) return null;

  const selectedIds = new Set(selected.map((u) => Number(u.id)));

  function toggleUser(user) {
    const id = Number(user.id);
    if (selectedIds.has(id)) {
      setSelected((prev) => prev.filter((u) => Number(u.id) !== id));
    } else {
      setSelected((prev) => [...prev, user]);
    }
    setLocalError('');
  }

  function removeSelected(id) {
    setSelected((prev) => prev.filter((u) => Number(u.id) !== Number(id)));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (selected.length < 1) {
      setLocalError('Ընտրեք առնվազն մեկ անդամ');
      return;
    }
    setLocalError('');
    await onSubmit({
      title: title.trim() || null,
      memberIds: selected.map((u) => u.id),
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2 className="modal__title">Նոր խումբ</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Փակել">
            ×
          </button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          {localError && <div className="modal__error">{localError}</div>}

          <label className="contact-form__label auth-page__field--full">
            <span>Խմբի անուն</span>
            <input
              type="text"
              className="contact-form__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Օրինակ՝ Թիմ 1"
              maxLength={120}
              disabled={submitting}
            />
          </label>

          {selected.length > 0 && (
            <div className="human-chat-picker__selected">
              {selected.map((u) => (
                <span key={u.id} className="human-chat-picker__chip">
                  {displayName(u)}
                  <button
                    type="button"
                    className="human-chat-picker__chip-remove"
                    onClick={() => removeSelected(u.id)}
                    aria-label="Հեռացնել"
                    disabled={submitting}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <label className="contact-form__label auth-page__field--full">
            <span>Փնտրել անդամներ</span>
            <input
              type="search"
              className="contact-form__input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Անուն, ազգանուն կամ օգտանուն"
              disabled={submitting}
              autoComplete="off"
            />
          </label>

          <div className="human-chat-picker__results" aria-live="polite">
            {searching && <p className="human-chat-picker__hint">Փնտրում...</p>}
            {!searching && searchQuery.trim().length > 0 && results.length === 0 && (
              <p className="human-chat-picker__hint">Ոչինչ չի գտնվել</p>
            )}
            {!searching && results.length > 0 && (
              <ul className="auth-page__checkbox-list human-chat-picker__list">
                {results.map((u) => {
                  const isSelected = selectedIds.has(Number(u.id));
                  return (
                    <li key={u.id}>
                      <button
                        type="button"
                        className={`human-chat-picker__row ${isSelected ? 'human-chat-picker__row--selected' : ''}`}
                        onClick={() => toggleUser(u)}
                        disabled={submitting}
                      >
                        <span className="human-chat-picker__row-name">{displayName(u)}</span>
                        <span className="human-chat-picker__row-meta">@{u.username}</span>
                        {isSelected && <span className="human-chat-picker__check">✓</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <button
            type="submit"
            className="btn btn--primary modal__submit"
            disabled={submitting || selected.length < 1}
          >
            {submitting ? 'Ստեղծվում է...' : 'Ստեղծել խումբ'}
          </button>
        </form>
      </div>
    </div>
  );
}
