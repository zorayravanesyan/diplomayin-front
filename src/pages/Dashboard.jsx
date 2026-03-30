import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getMyTeachers,
  getMyStudents,
  getAdminOverview,
  getUserWithRelations,
  getPublicTeachers,
  updateUserById,
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

function UserDetailModal({ user: u, loading, error, onClose, canEdit, onSaved, onUserRefresh }) {
  const [allTeachers, setAllTeachers] = useState([]);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!u || !canEdit) {
      setEditForm(null);
      return;
    }
    setEditForm({
      first_name: u.first_name ?? '',
      last_name: u.last_name ?? '',
      email: u.email ?? '',
      username: u.username ?? '',
      gender: u.gender ?? 'UNKNOWN',
      password: '',
      weight_kg: u.settings?.weight_kg != null ? String(u.settings.weight_kg) : '',
      height_sm: u.settings?.height_sm != null ? String(u.settings.height_sm) : '',
      experience_months:
        u.settings?.experience_months != null ? String(u.settings.experience_months) : '0',
      teacherIds:
        u.role === 'STUDENT'
          ? [...(u.teacher_ids?.length ? u.teacher_ids : u.teachers?.map((t) => t.id) ?? [])]
          : [],
    });
    setSaveError('');
  }, [u, canEdit]);

  useEffect(() => {
    if (!canEdit || u?.role !== 'STUDENT') {
      setAllTeachers([]);
      return;
    }
    let cancelled = false;
    getPublicTeachers()
      .then((list) => {
        if (!cancelled) setAllTeachers(list);
      })
      .catch(() => {
        if (!cancelled) setAllTeachers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [canEdit, u?.role, u?.id]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => (prev ? { ...prev, [name]: value } : prev));
    setSaveError('');
  };

  const toggleTeacher = (id) => {
    setEditForm((prev) => {
      if (!prev) return prev;
      const ids = prev.teacherIds.includes(id)
        ? prev.teacherIds.filter((x) => x !== id)
        : [...prev.teacherIds, id];
      return { ...prev, teacherIds: ids };
    });
    setSaveError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!u || !editForm) return;
    if (u.role === 'STUDENT' && editForm.teacherIds.length < 1) {
      setSaveError('Ընտրեք առնվազն մեկ ուսուցիչ');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const wRaw = editForm.weight_kg === '' ? null : parseFloat(editForm.weight_kg, 10);
      const hRaw = editForm.height_sm === '' ? null : parseInt(editForm.height_sm, 10);
      const expRaw =
        editForm.experience_months === ''
          ? 0
          : parseInt(editForm.experience_months, 10);

      const payload = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        username: editForm.username,
        gender: editForm.gender,
        settings: {
          weight_kg: wRaw !== null && Number.isNaN(wRaw) ? null : wRaw,
          height_sm: hRaw !== null && Number.isNaN(hRaw) ? null : hRaw,
          experience_months: Number.isNaN(expRaw) ? 0 : expRaw,
        },
      };
      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }
      if (u.role === 'STUDENT') {
        payload.teacher_ids = editForm.teacherIds;
      }
      const updated = await updateUserById(u.id, payload);
      onUserRefresh?.(updated);
      onSaved?.();
    } catch (err) {
      setSaveError(err.message || 'Պահպանումը ձախողվեց');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="dashboard__modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`dashboard__modal ${canEdit ? 'dashboard__modal--wide' : ''}`}
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
        {u && !loading && !canEdit && (
          <>
            <h2 id="user-detail-title" className="dashboard__modal-title">
              {u.first_name} {u.last_name}
            </h2>
            <p className="dashboard__modal-sub">
              @{u.username}
              {u.email ? ` · ${u.email}` : ''} · {genderLabel(u.gender)} · {roleLabel(u.role)}
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

        {u && !loading && canEdit && editForm && (
          <form className="dashboard__edit-form" onSubmit={handleSave}>
            <h2 id="user-detail-title" className="dashboard__modal-title">
              Խմբագրել · {u.first_name} {u.last_name}
            </h2>
            <p className="dashboard__modal-sub">{roleLabel(u.role)}</p>

            {saveError && (
              <div className="auth-page__error dashboard__modal-error">{saveError}</div>
            )}

            <div className="dashboard__edit-grid">
              <label className="contact-form__label">
                <span>Անուն</span>
                <input
                  name="first_name"
                  value={editForm.first_name}
                  onChange={handleEditChange}
                  className="contact-form__input"
                  required
                />
              </label>
              <label className="contact-form__label">
                <span>Ազգանուն</span>
                <input
                  name="last_name"
                  value={editForm.last_name}
                  onChange={handleEditChange}
                  className="contact-form__input"
                  required
                />
              </label>
              <label className="contact-form__label">
                <span>Էլ. փոստ</span>
                <input
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="contact-form__input"
                  required
                />
              </label>
              <label className="contact-form__label">
                <span>Օգտանուն</span>
                <input
                  name="username"
                  value={editForm.username}
                  onChange={handleEditChange}
                  className="contact-form__input"
                  required
                />
              </label>
              <label className="contact-form__label">
                <span>Սեռ</span>
                <select
                  name="gender"
                  value={editForm.gender}
                  onChange={handleEditChange}
                  className="contact-form__input"
                >
                  <option value="UNKNOWN">Չնշված</option>
                  <option value="MALE">Արական</option>
                  <option value="FEMALE">Իգական</option>
                </select>
              </label>
              <label className="contact-form__label">
                <span>Նոր գաղտնաբառ (ըստ ցանկության)</span>
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={editForm.password}
                  onChange={handleEditChange}
                  className="contact-form__input"
                  placeholder="Թողնել դատարկ"
                />
              </label>
              <label className="contact-form__label">
                <span>Քաշ (կգ)</span>
                <input
                  name="weight_kg"
                  type="number"
                  step="0.1"
                  value={editForm.weight_kg}
                  onChange={handleEditChange}
                  className="contact-form__input"
                />
              </label>
              <label className="contact-form__label">
                <span>Հասակ (սմ)</span>
                <input
                  name="height_sm"
                  type="number"
                  value={editForm.height_sm}
                  onChange={handleEditChange}
                  className="contact-form__input"
                />
              </label>
              <label className="contact-form__label">
                <span>Փորձառության ամիսներ</span>
                <input
                  name="experience_months"
                  type="number"
                  min="0"
                  value={editForm.experience_months}
                  onChange={handleEditChange}
                  className="contact-form__input"
                />
              </label>
            </div>

            {u.role === 'STUDENT' && (
              <div className="dashboard__modal-section">
                <span className="auth-page__checkbox-group-title">Ուսուցիչներ</span>
                <div className="auth-page__checkbox-list">
                  {allTeachers.map((t) => (
                    <label key={t.id} className="auth-page__checkbox-item">
                      <input
                        type="checkbox"
                        checked={editForm.teacherIds.includes(t.id)}
                        onChange={() => toggleTeacher(t.id)}
                      />
                      <span>
                        {t.last_name} {t.first_name}{' '}
                        <span className="auth-page__checkbox-meta">@{t.username}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="dashboard__modal-actions">
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Պահպանվում է...' : 'Պահպանել'}
              </button>
              <button type="button" className="btn btn--outline" onClick={onClose}>
                Չեղարկել
              </button>
            </div>
          </form>
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

  const reloadAdminOverview = useCallback(async () => {
    if (!user || user.role !== 'ADMIN') return;
    try {
      const { teachers = [], students = [] } = await getAdminOverview();
      setAdminTeachers(teachers);
      setAdminStudents(students);
    } catch {
      /* ignore */
    }
  }, [user]);

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
          const { teachers = [], students: st = [] } = await getAdminOverview();
          if (!cancelled) {
            setAdminTeachers(teachers);
            setAdminStudents(st);
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

  const handleUserSaved = useCallback(async () => {
    await reloadAdminOverview();
  }, [reloadAdminOverview]);

  const handleUserRefresh = useCallback((updated) => {
    setDetailUser(updated);
  }, []);

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
  const isAdmin = user.role === 'ADMIN';

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
          canEdit={isAdmin}
          onSaved={handleUserSaved}
          onUserRefresh={handleUserRefresh}
        />
      )}
    </section>
  );
}
