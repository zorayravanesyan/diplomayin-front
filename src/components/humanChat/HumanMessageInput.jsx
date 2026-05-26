import { useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import StickerPickerPanel from './StickerPickerPanel.jsx';
import { uploadChatImage } from '../../services/uploadService.js';

export default function HumanMessageInput({ disabled, sending, onSend }) {
  const [value, setValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  const busy = disabled || sending || uploading;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = value.trim();
    if (!content || busy) return;

    setValue('');
    setShowEmoji(false);
    setShowStickers(false);
    await onSend({ content, attachments: [] });
  };

  const insertEmoji = (emojiData) => {
    const emoji = emojiData.emoji;
    const el = textareaRef.current;
    if (!el) {
      setValue((prev) => `${prev}${emoji}`);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const next = `${value.slice(0, start)}${emoji}${value.slice(end)}`;
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const handleImagePick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || busy) return;

    setUploading(true);
    setShowEmoji(false);
    setShowStickers(false);
    try {
      const uploaded = await uploadChatImage(file);
      await onSend({
        content: '',
        attachments: [
          {
            type: 'IMAGE',
            url: uploaded.url,
            mime: uploaded.mime,
            size_bytes: uploaded.size_bytes,
            width: uploaded.width,
            height: uploaded.height,
          },
        ],
      });
    } finally {
      setUploading(false);
    }
  };

  const handleStickerSelect = async (sticker) => {
    setShowStickers(false);
    if (busy) return;
    await onSend({
      content: '',
      attachments: [
        {
          type: 'STICKER',
          url: sticker.url,
          width: sticker.width,
          height: sticker.height,
        },
      ],
    });
  };

  const toggleEmoji = () => {
    setShowEmoji((v) => !v);
    setShowStickers(false);
  };

  const toggleStickers = () => {
    setShowStickers((v) => !v);
    setShowEmoji(false);
  };

  return (
    <form className="chat-input chat-input--human" onSubmit={handleSubmit}>
      {(showEmoji || showStickers) && (
        <div className="chat-input__panels">
          {showEmoji && (
            <div className="chat-input__emoji">
              <EmojiPicker onEmojiClick={insertEmoji} width="100%" height={300} />
            </div>
          )}
          {showStickers && (
            <div className="chat-input__stickers">
              <div className="chat-input__stickers-head">Sticker-ներ</div>
              <StickerPickerPanel onSelect={handleStickerSelect} />
            </div>
          )}
        </div>
      )}

      <div className="chat-input__composer">
        <div className="chat-input__tools">
          <button
            type="button"
            className={`chat-input__tool ${showEmoji ? 'chat-input__tool--active' : ''}`}
            onClick={toggleEmoji}
            disabled={busy}
            title="Emoji"
            aria-label="Emoji"
          >
            😊
          </button>
          <button
            type="button"
            className="chat-input__tool"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            title="Նկար"
            aria-label="Նկար"
          >
            📷
          </button>
          <button
            type="button"
            className={`chat-input__tool chat-input__tool--stickers ${showStickers ? 'chat-input__tool--active' : ''}`}
            onClick={toggleStickers}
            disabled={busy}
            title="Sticker-ներ"
            aria-label="Sticker-ներ"
          >
            <span className="chat-input__tool-icon" aria-hidden="true">
              🧩
            </span>
            <span className="chat-input__tool-label">Stickers</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="chat-input__file"
            onChange={handleImagePick}
          />
        </div>

        <label className="chat-input__label" htmlFor="human-chat-message-input">
          Հաղորդագրություն
        </label>
        <textarea
          ref={textareaRef}
          id="human-chat-message-input"
          className="chat-input__field chat-input__field--human"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Գրեք հաղորդագրություն..."
          rows={1}
          disabled={busy}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />

        <button
          type="submit"
          className="btn btn--primary chat-input__button chat-input__button--human"
          disabled={busy || value.trim().length === 0}
        >
          {uploading ? '...' : sending ? '...' : 'Ուղարկել'}
        </button>
      </div>
    </form>
  );
}
