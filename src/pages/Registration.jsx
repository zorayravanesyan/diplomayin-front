import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

export default function Registration() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation - only required fields
    if (!form.email || !form.username || !form.first_name || !form.last_name || !form.password) {
      setError('Խնդրում ենք լրացնել բոլոր դաշտերը');
      setLoading(false);
      return;
    }

    try {
      await register(form);
      setForm({
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        password: '',
      });
      navigate('/success', { state: { message: 'Գրանցումը հաջողությամբ կատարվեց' } });
    } catch (err) {
      setError(err.message || 'Գրանցումը ձախողվեց');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <div className="container">
        <div className="auth-page">
          <div className="auth-page__content auth-page__content--large">
            <h1 className="auth-page__title">Գրանցում</h1>
            <form className="auth-page__form" onSubmit={handleSubmit}>
              {error && <div className="auth-page__error">{error}</div>}
              <div className="auth-page__form-grid">
                <label className="contact-form__label">
                  <span>Էլ. փոստ</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="contact-form__input"
                    required
                  />
                </label>
                <label className="contact-form__label">
                  <span>Օգտանուն</span>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="contact-form__input"
                    required
                  />
                </label>
                <label className="contact-form__label">
                  <span>Անուն</span>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    className="contact-form__input"
                    required
                  />
                </label>
                <label className="contact-form__label">
                  <span>Ազգանուն</span>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
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
              </div>
              <button 
                type="submit" 
                className="btn btn--primary auth-page__submit"
                disabled={loading}
              >
                {loading ? 'Բեռնվում է...' : 'Գրանցվել'}
              </button>
              <p className="auth-page__footer">
                Արդեն ունե՞ք հաշիվ: <Link to="/login">Մուտք գործեք</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
