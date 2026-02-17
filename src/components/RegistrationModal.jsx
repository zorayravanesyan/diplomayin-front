import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegistrationModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
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

    // Validation
    if (!form.email || !form.username || !form.first_name || !form.last_name || 
        !form.password || !form.gender || !form.age || !form.height || !form.weight) {
      setError('Խնդրում ենք լրացնել բոլոր դաշտերը');
      return;
    }

    const ageNum = parseInt(form.age, 10);
    const heightNum = parseFloat(form.height);
    const weightNum = parseFloat(form.weight);

    if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
      setError('Տարիքը պետք է լինի 1-150 միջակայքում');
      return;
    }

    if (isNaN(heightNum) || heightNum < 50 || heightNum > 250) {
      setError('Հասակը պետք է լինի 50-250 սմ միջակայքում');
      return;
    }

    if (isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
      setError('Քաշը պետք է լինի 20-300 կգ միջակայքում');
      return;
    }

    // TODO: Replace with actual API call
    try {
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...form,
      //     age: ageNum,
      //     height: heightNum,
      //     weight: weightNum,
      //   }),
      // });
      // if (!response.ok) throw new Error('Registration failed');
      
      // Simulate success for now
      console.log('Registration attempt:', {
        ...form,
        age: ageNum,
        height: heightNum,
        weight: weightNum,
      });
      onClose();
      setForm({
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        password: '',
        gender: '',
        age: '',
        height: '',
        weight: '',
      });
      navigate('/success', { state: { message: 'Գրանցումը հաջողությամբ կատարվեց' } });
    } catch (err) {
      setError(err.message || 'Գրանցումը ձախողվեց');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Գրանցում</h2>
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
          <div className="modal__form-grid">
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
            <label className="contact-form__label">
              <span>Սեռ</span>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="contact-form__input"
                required
              >
                <option value="">Ընտրել</option>
                <option value="MALE">Արական</option>
                <option value="FEMALE">Իգական</option>
              </select>
            </label>
            <label className="contact-form__label">
              <span>Տարիք</span>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                className="contact-form__input"
                min="1"
                max="150"
                required
              />
            </label>
            <label className="contact-form__label">
              <span>Հասակ (սմ)</span>
              <input
                type="number"
                name="height"
                value={form.height}
                onChange={handleChange}
                className="contact-form__input"
                min="50"
                max="250"
                step="0.1"
                required
              />
            </label>
            <label className="contact-form__label">
              <span>Քաշ (կգ)</span>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                className="contact-form__input"
                min="20"
                max="300"
                step="0.1"
                required
              />
            </label>
          </div>
          <button type="submit" className="btn btn--primary modal__submit">
            Գրանցվել
          </button>
        </form>
      </div>
    </div>
  );
}
