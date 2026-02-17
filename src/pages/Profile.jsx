import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/authService';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    weight_kg: '',
    height_sm: '',
    gender: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        weight_kg: user.weight_kg || '',
        height_sm: user.height_sm || '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updateData = {};
      if (form.first_name !== user.first_name) updateData.first_name = form.first_name;
      if (form.last_name !== user.last_name) updateData.last_name = form.last_name;
      if (form.weight_kg !== user.weight_kg) updateData.weight_kg = parseFloat(form.weight_kg);
      if (form.height_sm !== user.height_sm) updateData.height_sm = parseInt(form.height_sm, 10);
      if (form.gender !== user.gender) updateData.gender = form.gender;

      if (Object.keys(updateData).length === 0) {
        setError('Ոչ մի փոփոխություն չի կատարվել');
        setLoading(false);
        return;
      }

      const response = await updateProfile(updateData);
      updateUser(response.user);
      setIsEditing(false);
      setSuccess('Պրոֆիլը հաջողությամբ թարմացվեց');
    } catch (err) {
      setError(err.message || 'Պրոֆիլի թարմացումը ձախողվեց');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <section className="page-section">
        <div className="container">
          <div className="auth-page">
            <div className="auth-page__content">
              <p>Խնդրում ենք մուտք գործել</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container">
        <div className="auth-page">
          <div className="auth-page__content auth-page__content--large">
            <h1 className="auth-page__title">Պրոֆիլ</h1>
            
            {error && <div className="auth-page__error">{error}</div>}
            {success && <div className="auth-page__success" style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}

            <form className="auth-page__form" onSubmit={handleSubmit}>
              <div className="auth-page__form-grid">
                <label className="contact-form__label">
                  <span>Էլ. փոստ</span>
                  <input
                    type="email"
                    value={user.email}
                    className="contact-form__input"
                    disabled
                  />
                </label>
                <label className="contact-form__label">
                  <span>Օգտանուն</span>
                  <input
                    type="text"
                    value={user.username}
                    className="contact-form__input"
                    disabled
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                    required
                  />
                </label>
                <label className="contact-form__label">
                  <span>Քաշ (կգ)</span>
                  <input
                    type="number"
                    name="weight_kg"
                    value={form.weight_kg}
                    onChange={handleChange}
                    className="contact-form__input"
                    disabled={!isEditing}
                    step="0.1"
                    min="20"
                    max="300"
                  />
                </label>
                <label className="contact-form__label">
                  <span>Հասակ (սմ)</span>
                  <input
                    type="number"
                    name="height_sm"
                    value={form.height_sm}
                    onChange={handleChange}
                    className="contact-form__input"
                    disabled={!isEditing}
                    min="50"
                    max="250"
                  />
                </label>
                <label className="contact-form__label">
                  <span>Սեռ</span>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="contact-form__input"
                    disabled={!isEditing}
                  >
                    <option value="UNKNOWN">Չնշված</option>
                    <option value="MALE">Արական</option>
                    <option value="FEMALE">Իգական</option>
                  </select>
                </label>
              </div>

              {isEditing ? (
                <>
                  <button 
                    type="submit" 
                    className="btn btn--primary auth-page__submit"
                    disabled={loading}
                  >
                    {loading ? 'Բեռնվում է...' : 'Պահպանել'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn--secondary auth-page__submit"
                    onClick={() => {
                      setIsEditing(false);
                      setForm({
                        first_name: user.first_name || '',
                        last_name: user.last_name || '',
                        weight_kg: user.weight_kg || '',
                        height_sm: user.height_sm || '',
                        gender: user.gender || '',
                      });
                      setError('');
                      setSuccess('');
                    }}
                    disabled={loading}
                  >
                    Չեղարկել
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  className="btn btn--primary auth-page__submit"
                  onClick={() => setIsEditing(true)}
                >
                  Խմբագրել
                </button>
              )}
            </form>

            <button 
              type="button" 
              className="btn btn--secondary auth-page__submit"
              onClick={handleLogout}
              style={{ marginTop: '1rem' }}
            >
              Ելք
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
