import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
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
      setForm({ login: '', password: '' });
      navigate('/success', { state: { message: 'Մուտքը հաջողությամբ կատարվեց' } });
    } catch (err) {
      setError(err.message || 'Մուտքը ձախողվեց');
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
              <button type="submit" className="btn btn--primary auth-page__submit">
                Մուտք գործել
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
