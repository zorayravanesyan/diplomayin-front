import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/authService';
import { getRandomDietRecommendations } from '../services/dietService';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    weight_kg: '',
    height_sm: '',
    age: '',
    gender: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dietOpen, setDietOpen] = useState(false);
  const [dietLoading, setDietLoading] = useState(false);
  const [dietError, setDietError] = useState('');
  const [dietInfo, setDietInfo] = useState({
    bmi: null,
    age: null,
    recommendations: [],
  });

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        weight_kg: user?.settings?.weight_kg != null ? String(user.settings.weight_kg) : '',
        height_sm: user?.settings?.height_sm != null ? String(user.settings.height_sm) : '',
        age: user?.settings?.age != null ? String(user.settings.age) : '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  const loadDietRecommendations = async () => {
    setDietLoading(true);
    setDietError('');
    try {
      const result = await getRandomDietRecommendations();
      setDietInfo(result);
    } catch (err) {
      setDietInfo({ bmi: null, age: null, recommendations: [] });
      setDietError(
        err.code === 'VALIDATION_ERROR'
          ? 'Սննդակարգի առաջարկների համար լրացրեք քաշը և հասակը։'
          : err.message || 'Սննդակարգի առաջարկները բեռնել չհաջողվեց'
      );
    } finally {
      setDietLoading(false);
    }
  };

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
      const currentWeight = user?.settings?.weight_kg == null ? '' : String(user.settings.weight_kg);
      const currentHeight = user?.settings?.height_sm == null ? '' : String(user.settings.height_sm);
      const currentAge = user?.settings?.age == null ? '' : String(user.settings.age);
      if (form.weight_kg !== currentWeight) {
        updateData.weight_kg = form.weight_kg === '' ? null : parseFloat(form.weight_kg);
      }
      if (form.height_sm !== currentHeight) {
        updateData.height_sm = form.height_sm === '' ? null : parseInt(form.height_sm, 10);
      }
      if (form.age !== currentAge) {
        updateData.age = form.age === '' ? null : parseInt(form.age, 10);
      }
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

  const handleOpenDiet = () => {
    setDietOpen(true);
    loadDietRecommendations();
  };

  const handleCloseDiet = () => {
    setDietOpen(false);
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
                  <span>Տարիք</span>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    className="contact-form__input"
                    disabled={!isEditing}
                    min="1"
                    max="120"
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
                        weight_kg: user?.settings?.weight_kg != null ? String(user.settings.weight_kg) : '',
                        height_sm: user?.settings?.height_sm != null ? String(user.settings.height_sm) : '',
                        age: user?.settings?.age != null ? String(user.settings.age) : '',
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
              className="btn btn--outline auth-page__submit"
              onClick={handleOpenDiet}
              disabled={dietLoading}
            >
              {dietLoading ? 'Բեռնում...' : 'Սննդակարգի առաջարկներ'}
            </button>

            <button 
              type="button" 
              className="btn btn--secondary auth-page__submit"
              onClick={handleLogout}
              style={{ marginTop: '1rem' }}
            >
              Ելք
            </button>

            {dietOpen && (
              <div className="profile-diet__backdrop" onClick={handleCloseDiet} role="presentation">
                <div
                  className="profile-diet__modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="profile-diet-title"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className="profile-diet__close"
                    onClick={handleCloseDiet}
                    aria-label="Փակել"
                  >
                    ×
                  </button>
                  <section className="profile-diet" aria-labelledby="profile-diet-title">
                    <div className="profile-diet__header">
                      <div>
                        <h2 id="profile-diet-title" className="profile-diet__title">
                          Սննդակարգի առաջարկներ
                        </h2>
                        <p className="profile-diet__subtitle">
                          Առաջարկները ընտրվում են ըստ ձեր քաշի, հասակի, տարիքի և սեռի։
                        </p>
                      </div>
                      {(dietInfo.bmi || dietInfo.age) && (
                        <div className="profile-diet__meta">
                          {dietInfo.bmi && <span>BMI՝ {dietInfo.bmi}</span>}
                          {dietInfo.age && <span>Տարիք՝ {dietInfo.age}</span>}
                        </div>
                      )}
                    </div>

                    {dietLoading ? (
                      <p className="profile-diet__state">Բեռնում...</p>
                    ) : dietError ? (
                      <div className="auth-page__error profile-diet__error">{dietError}</div>
                    ) : dietInfo.recommendations.length === 0 ? (
                      <p className="profile-diet__state">Առաջարկներ չկան։</p>
                    ) : (
                      <div className="profile-diet__grid">
                        {dietInfo.recommendations.map((item) => (
                          <article key={item.id} className="profile-diet__card">
                            <div className="profile-diet__card-head">
                              <span className="profile-diet__badge">
                                {item.gender === 'male' ? 'Արական' : 'Իգական'}
                              </span>
                              <span className="profile-diet__range">
                                BMI {item.min_bmi}–{item.max_bmi === -1 ? '∞' : item.max_bmi}
                              </span>
                            </div>
                            {item.closeness_percentage != null && (
                              <div className="profile-diet__match">
                                Համապատասխանություն՝ {item.closeness_percentage}%
                              </div>
                            )}
                            <ul className="profile-diet__meals">
                              <li>
                                <strong>Նախաճաշ՝</strong> {item.recommendations.breakfast}
                              </li>
                              <li>
                                <strong>Ճաշ՝</strong> {item.recommendations.lunch}
                              </li>
                              <li>
                                <strong>Ընթրիք՝</strong> {item.recommendations.dinner}
                              </li>
                            </ul>
                            <div className="profile-diet__nutrients">
                              {item.key_nutrients.map((nutrient) => (
                                <span key={nutrient}>{nutrient}</span>
                              ))}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}

                    {!dietLoading && (
                      <button
                        type="button"
                        className="btn btn--primary profile-diet__refresh"
                        onClick={loadDietRecommendations}
                      >
                        Թարմացնել
                      </button>
                    )}
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
