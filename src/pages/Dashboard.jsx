import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getMyTeachers,
  getMyStudents,
  getAdminOverview,
  getUserWithRelations,
} from '../services/userService';

function genderLabel(g) {
  if (g === 'MALE') return 'Արական';
  if (g === 'FEMALE') return 'Իգական';
  return '—';
}

function roleLabel(r) {
  if (r === 'STUDENT') return 'Աշակերտ';
  if (r === 'TICHER') return 'Ուսուցիչ';
  if (r === 'ADMIN') return 'Ադմին';
  return r || '—';
}

function ViewIcon() {
  return (
    <svg
      className="dashboard__view-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
      />
    </svg>
  );
}

function PersonList({ people, onViewPerson }) {
  if (people.length === 0) {
    return <p className="dashboard__empty">Դատարկ ցանկ։</p>;
  }
  return (
    <ul className="dashboard__list">
      {people.map((p) => (
        <li key={p.id} className="dashboard__card">
          <div className="dashboard__card-row">
            <div className="dashboard__card-body">
              <div className="dashboard__card-name">
                {p.first_name} {p.last_name}
              </div>
              <div className="dashboard__card-meta">
                <span>@{p.username}</span>
                <span>{genderLabel(p.gender)}</span>
              </div>
            </div>
            {onViewPerson && (
              <button
                type="button"
                className="dashboard__view-btn"
                onClick={() => onViewPerson(p)}
                aria-label={`Դիտել ${p.first_name} ${p.last_name}`}
                title="Դիտել"
              >
                <ViewIcon />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function UserDetailModal({ user: u, loading, error, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="dashboard__modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="dashboard__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="dashboard__modal-close"
          onClick={onClose}
          aria-label="Փակել"
        >
          ×
        </button>
        {loading && <p className="dashboard__loading">Բեռնվում է...</p>}
        {error && !loading && (
          <div className="auth-page__error dashboard__modal-error">{error}</div>
        )}
        {u && !loading && (
          <>
            <h2 id="user-detail-title" className="dashboard__modal-title">
              {u.first_name} {u.last_name}
            </h2>
            <p className="dashboard__modal-sub">
              @{u.username} · {genderLabel(u.gender)} · {roleLabel(u.role)}
            </p>

            {u.role === 'STUDENT' && (
              <div className="dashboard__modal-section">
                <h3 className="dashboard__modal-section-title">Ուսուցիչներ</h3>
                {u.teachers?.length ? (
                  <ul className="dashboard__modal-list">
                    {u.teachers.map((t) => (
                      <li key={t.id}>
                        {t.first_name} {t.last_name} (@{t.username})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="dashboard__empty">Չկան կցված ուսուցիչներ։</p>
                )}
              </div>
            )}

            {u.role === 'TICHER' && (
              <div className="dashboard__modal-section">
                <h3 className="dashboard__modal-section-title">Աշակերտներ</h3>
                {u.students?.length ? (
                  <ul className="dashboard__modal-list">
                    {u.students.map((s) => (
                      <li key={s.id}>
                        {s.first_name} {s.last_name} (@{s.username})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="dashboard__empty">Աշակերտ չկա։</p>
                )}
              </div>
            )}

            {u.role === 'ADMIN' && (
              <p className="dashboard__empty">Ադմինի համար կապված ցանկ չկա։</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [people, setPeople] = useState([]);
  const [heading, setHeading] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [adminTab, setAdminTab] = useState('teachers');
  const [adminTeachers, setAdminTeachers] = useState([]);
  const [adminStudents, setAdminStudents] = useState([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const openUserDetail = useCallback(async (p) => {
    setDetailOpen(true);
    setDetailUser(null);
    setDetailError('');
    setDetailLoading(true);
    try {
      const u = await getUserWithRelations(p.id);
      setDetailUser(u);
    } catch (e) {
      setDetailError(e.message || 'Բեռնումը ձախողվեց');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setDetailUser(null);
    setDetailError('');
    setDetailLoading(false);
  }, []);

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
        } else if (user.role === 'ADMIN') {
          setHeading('Վահան — ադմին');
          const { teachers = [], students = [] } = await getAdminOverview();
          if (!cancelled) {
            setAdminTeachers(teachers);
            setAdminStudents(students);
          }
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

  const adminActivePeople = adminTab === 'teachers' ? adminTeachers : adminStudents;

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
            <>
              <div className="dashboard__tabs" role="tablist" aria-label="Ադմին ցուցակներ">
                <button
                  type="button"
                  role="tab"
                  className={`dashboard__tab ${adminTab === 'teachers' ? 'dashboard__tab--active' : ''}`}
                  aria-selected={adminTab === 'teachers'}
                  id="admin-tab-teachers"
                  aria-controls="admin-panel-teachers"
                  onClick={() => setAdminTab('teachers')}
                >
                  Ուսուցիչներ
                  <span className="dashboard__tab-count">({adminTeachers.length})</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`dashboard__tab ${adminTab === 'students' ? 'dashboard__tab--active' : ''}`}
                  aria-selected={adminTab === 'students'}
                  id="admin-tab-students"
                  aria-controls="admin-panel-students"
                  onClick={() => setAdminTab('students')}
                >
                  Աշակերտներ
                  <span className="dashboard__tab-count">({adminStudents.length})</span>
                </button>
              </div>
              <div
                role="tabpanel"
                id={adminTab === 'teachers' ? 'admin-panel-teachers' : 'admin-panel-students'}
                aria-labelledby={adminTab === 'teachers' ? 'admin-tab-teachers' : 'admin-tab-students'}
              >
                <PersonList
                  people={adminActivePeople}
                  onViewPerson={openUserDetail}
                />
              </div>
            </>
          ) : people.length === 0 ? (
            <p className="dashboard__empty">Դատարկ ցանկ։</p>
          ) : (
            <PersonList people={people} onViewPerson={openUserDetail} />
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

      {detailOpen && (
        <UserDetailModal
          user={detailUser}
          loading={detailLoading}
          error={detailError}
          onClose={closeDetail}
        />
      )}
    </section>
  );
}
