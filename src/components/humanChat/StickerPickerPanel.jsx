import { useEffect, useMemo, useState } from 'react';
import { listAllStickers } from '../../services/stickerService.js';
import { mediaUrl } from '../../services/uploadService.js';

export default function StickerPickerPanel({ onSelect }) {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const items = await listAllStickers();
        if (!cancelled) setStickers(items);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Չհաջողվեց բեռնել sticker-ները');
          setStickers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const s of stickers) {
      const key = s.pack_name || `Pack ${s.pack_id}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    return [...map.entries()];
  }, [stickers]);

  if (loading) {
    return <p className="human-chat-picker__hint">Sticker-ներ բեռնվում են...</p>;
  }

  if (error) {
    return <p className="human-chat-picker__hint">{error}</p>;
  }

  if (!stickers.length) {
    return (
      <p className="human-chat-picker__hint">
        Sticker չկա։ Backend-ում աշխատացրեք՝ npm run db:migrate && npm run db:seed
      </p>
    );
  }

  return (
    <div className="sticker-picker sticker-picker--inline">
      {grouped.map(([packName, packStickers]) => (
        <section key={packName} className="sticker-picker__section">
          <h3 className="sticker-picker__section-title">{packName}</h3>
          <div className="sticker-picker__grid">
            {packStickers.map((sticker) => (
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
        </section>
      ))}
    </div>
  );
}
