import { useEffect, useState } from 'react';
import { useDebouncedUserSearch } from '../../hooks/useDebouncedUserSearch.js';

function displayName(user) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return name || user.username || `#${user.id}`;
}

export default function CreateDmModal({ open, onClose, onSelect, selecting, currentUserId }) {
  const [searchQuery, setSearchQuery] = useState('');

  const { results, searching } = useDebouncedUserSearch({
    enabled: open,
    query: searchQuery,
    currentUserId,
  });

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2 className="modal__title">Նոր անձնական զրույց</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Փակել">
            ×
          </button>
        </div>

        <div className="modal__form">
          <label className="contact-form__label auth-page__field--full">
            <span>Փնտրել օգտատեր</span>
            <input
              type="search"
              className="contact-form__input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Անուն, ազգանուն կամ օգտանուն"
              disabled={selecting}
              autoComplete="off"
              autoFocus
            />
          </label>

          <div className="human-chat-picker__results" aria-live="polite">
            {searching && <p className="human-chat-picker__hint">Փնտրում...</p>}
            {!searching && searchQuery.trim().length > 0 && results.length === 0 && (
              <p className="human-chat-picker__hint">Ոչինչ չի գտնվել</p>
            )}
            {!searching && results.length > 0 && (
              <ul className="auth-page__checkbox-list human-chat-picker__list">
                {results.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      className="human-chat-picker__row"
                      onClick={() => onSelect(u.id)}
                      disabled={selecting}
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
      </div>
    </div>
  );
}
