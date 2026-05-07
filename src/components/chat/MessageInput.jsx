import { useState } from 'react';

export default function MessageInput({ disabled, sending, onSend }) {
  const [value, setValue] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = value.trim();
    if (!content || disabled || sending) return;

    setValue('');
    await onSend(content);
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <label className="chat-input__label" htmlFor="chat-message-input">
        Հաղորդագրություն
      </label>
      <textarea
        id="chat-message-input"
        className="chat-input__field"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Գրեք հաղորդագրություն..."
        rows={2}
        disabled={disabled || sending}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <button
        type="submit"
        className="btn btn--primary chat-input__button"
        disabled={disabled || sending || value.trim().length === 0}
      >
        {sending ? 'Ուղարկվում է...' : 'Ուղարկել'}
      </button>
    </form>
  );
}
