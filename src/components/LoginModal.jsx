import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    login: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.login || !form.password) {
      setError('Խնդրում ենք լրացնել բոլոր դաշտերը');
      return;
    }

    // TODO: Replace with actual API call
    try {
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(form),
      // });
      // if (!response.ok) throw new Error('Login failed');
      
      // Simulate success for now
      console.log('Login attempt:', form);
      onClose();
      setForm({ login: '', password: '' });
      navigate('/success', { state: { message: 'Մուտքը հաջողությամբ կատարվեց' } });
    } catch (err) {
      setError(err.message || 'Մուտքը ձախողվեց');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Մուտք</h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Փակել"
          >
            ×
          </button>
        </div>
        <form className="modal__form" onSubmit={handleSubmit}>
          {error && <div className="modal__error">{error}</div>}
          <label className="contact-form__label">
            <span>Օգտանուն կամ էլ. փոստ</span>
            <input
              type="text"
              name="login"
              value={form.login}
              onChange={handleChange}
              className="contact-form__input"
              required
            />
          </label>
          <label className="contact-form__label">
            <span>Գաղտնաբառ</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="contact-form__input"
              required
            />
          </label>
          <button type="submit" className="btn btn--primary modal__submit">
            Մուտք գործել
          </button>
        </form>
      </div>
    </div>
  );
}
