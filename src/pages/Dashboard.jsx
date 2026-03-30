import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMyTeachers, getMyStudents } from '../services/userService';

function genderLabel(g) {
  if (g === 'MALE') return 'Արական';
  if (g === 'FEMALE') return 'Իգական';
  return '—';
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [people, setPeople] = useState([]);
  const [heading, setHeading] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        if (user.role === 'STUDENT') {
          setHeading('Իմ ուսուցիչները');
          const teachers = await getMyTeachers();
          if (!cancelled) setPeople(teachers);
        } else if (user.role === 'TICHER') {
          setHeading('Իմ աշակերտները');
          const students = await getMyStudents();
          if (!cancelled) setPeople(students);
        } else {
          setHeading('Վահան');
          if (!cancelled) setPeople([]);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Բեռնումը ձախողվեց');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, navigate]);

  if (authLoading || (!user && !error)) {
    return (
      <section className="page-section">
        <div className="container">
          <p className="dashboard__loading">Բեռնվում է...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container">
        <div className="dashboard">
          <h1 className="dashboard__title">{heading}</h1>
          <p className="dashboard__welcome">
            {user.first_name} {user.last_name}
            {user.role && (
              <span className="dashboard__role">
                {' '}
                · {user.role === 'STUDENT' ? 'Աշակերտ' : user.role === 'TICHER' ? 'Ուսուցիչ' : 'Ադմին'}
              </span>
            )}
          </p>

          {error && <div className="auth-page__error dashboard__error">{error}</div>}

          {loading ? (
            <p className="dashboard__loading">Բեռնվում է...</p>
          ) : user.role === 'ADMIN' ? (
            <p className="dashboard__empty">
              Ադմինի համար այստեղ ցուցադրվող ցանկ չկա։{' '}
              <Link to="/profile">Պրոֆիլ</Link>
            </p>
          ) : people.length === 0 ? (
            <p className="dashboard__empty">Դատարկ ցանկ։</p>
          ) : (
            <ul className="dashboard__list">
              {people.map((p) => (
                <li key={p.id} className="dashboard__card">
                  <div className="dashboard__card-name">
                    {p.first_name} {p.last_name}
                  </div>
                  <div className="dashboard__card-meta">
                    <span>@{p.username}</span>
                    <span>{genderLabel(p.gender)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="dashboard__actions">
            <Link to="/profile" className="btn btn--outline">
              Պրոֆիլ
            </Link>
            <Link to="/" className="btn btn--primary">
              Գլխավոր
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
