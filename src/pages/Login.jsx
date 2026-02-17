import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    login: '',
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

    if (!form.login || !form.password) {
      setError('Խնդրում ենք լրացնել բոլոր դաշտերը');
      setLoading(false);
      return;
    }

    try {
      const response = await loginService(form.login, form.password);
      login(response.user);
      setForm({ login: '', password: '' });
      navigate('/success', { state: { message: 'Մուտքը հաջողությամբ կատարվեց' } });
    } catch (err) {
      setError(err.message || 'Մուտքը ձախողվեց');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <div className="container">
        <div className="auth-page">
          <div className="auth-page__content">
            <h1 className="auth-page__title">Մուտք</h1>
            <form className="auth-page__form" onSubmit={handleSubmit}>
              {error && <div className="auth-page__error">{error}</div>}
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
              <button 
                type="submit" 
                className="btn btn--primary auth-page__submit"
                disabled={loading}
              >
                {loading ? 'Բեռնվում է...' : 'Մուտք գործել'}
              </button>
              <p className="auth-page__footer">
                Չունե՞ք հաշիվ: <Link to="/registration">Գրանցվեք</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
