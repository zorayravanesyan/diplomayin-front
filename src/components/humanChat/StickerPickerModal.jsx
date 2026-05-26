import { useEffect, useState } from 'react';
import { listStickerPacks, getStickerPack } from '../../services/stickerService.js';
import { mediaUrl } from '../../services/uploadService.js';

export default function StickerPickerModal({ open, onClose, onSelect }) {
  const [packs, setPacks] = useState([]);
  const [activePackId, setActivePackId] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const items = await listStickerPacks();
        if (cancelled) return;
        setPacks(items);
        if (items.length > 0) {
          setActivePackId(items[0].id);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !activePackId) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const data = await getStickerPack(activePackId);
        if (!cancelled) setStickers(data.stickers ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, activePackId]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <h2 className="modal__title">Sticker-ներ</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Փակել">
            ×
          </button>
        </div>

        <div className="modal__form sticker-picker">
          <div className="sticker-picker__tabs">
            {packs.map((pack) => (
              <button
                key={pack.id}
                type="button"
                className={`sticker-picker__tab ${
                  Number(activePackId) === Number(pack.id) ? 'sticker-picker__tab--active' : ''
                }`}
                onClick={() => setActivePackId(pack.id)}
              >
                {pack.name}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="human-chat-picker__hint">Բեռնում...</p>
          ) : (
            <div className="sticker-picker__grid">
              {stickers.map((sticker) => (
                <button
                  key={sticker.id}
                  type="button"
                  className="sticker-picker__item"
                  onClick={() => onSelect(sticker)}
                  title={sticker.name || ''}
                >
                  <img src={mediaUrl(sticker.url)} alt={sticker.name || 'sticker'} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
