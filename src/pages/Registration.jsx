import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, refreshSessionUser } from '../services/authService';
import { getPublicTeachers } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export default function Registration() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
  });
  const [teacherIds, setTeacherIds] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getPublicTeachers();
        if (!cancelled) setTeachers(list);
      } catch {
        if (!cancelled) setError('Ուսուցիչների ցանկը բեռնել չհաջողվեց');
      } finally {
        if (!cancelled) setTeachersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

    if (!teacherIds.length) {
      setError('Ընտրեք առնվազն մեկ ուսուցիչ');
      setLoading(false);
      return;
    }

    try {
      await register({ ...form, teacher_ids: teacherIds });
      const user = await refreshSessionUser();
      login(user);
      setForm({
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        password: '',
      });
      setTeacherIds([]);
      navigate('/dashboard');
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
                <div className="contact-form__label auth-page__field--full">
                  <span className="auth-page__checkbox-group-title">Ուսուցիչներ</span>
                  {teachersLoading ? (
                    <span className="dashboard__loading">Բեռնվում է ուսուցիչների ցանկը...</span>
                  ) : (
                    <div className="auth-page__checkbox-list" role="group" aria-label="Ուսուցիչներ">
                      {teachers.map((t) => (
                        <label key={t.id} className="auth-page__checkbox-item">
                          <input
                            type="checkbox"
                            checked={teacherIds.includes(t.id)}
                            onChange={() => {
                              setTeacherIds((prev) =>
                                prev.includes(t.id)
                                  ? prev.filter((id) => id !== t.id)
                                  : [...prev, t.id]
                              );
                              setError('');
                            }}
                          />
                          <span>
                            {t.last_name} {t.first_name}{' '}
                            <span className="auth-page__checkbox-meta">@{t.username}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  {!teachersLoading && teachers.length === 0 && (
                    <p className="dashboard__empty" style={{ marginTop: '0.5rem' }}>
                      Հասանելի ուսուցիչ չկա։ Ադմինը պետք է ստեղծի ուսուցիչների հաշիվներ։
                    </p>
                  )}
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn--primary auth-page__submit"
                disabled={loading || teachersLoading || teachers.length === 0}
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
