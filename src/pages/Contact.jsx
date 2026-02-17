import { useState } from 'react';

const locations = [
  {
    id: 1,
    name: 'Երևան, կենտրոն',
    address: 'Մաշտոցի 20, Երևան',
    hours: 'Երկ–Ուրբ 09:00–18:00',
  },
  {
    id: 2,
    name: 'Առողջապահական կենտրոն',
    address: 'Բաղրամյան 24, Երևան',
    hours: 'Երկ–Շաբ 10:00–20:00',
  },
];

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Static app — no backend; simulate send
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Կապ եւ հասցեներ</h1>
          <p className="page-hero__subtitle">
            Գրեք մեզ կամ այցելեք մեր հասցեներին
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="container contact-grid">
          <div className="contact-form-block">
            <h2 className="section-title">Կապի ձեւ</h2>
            {sent ? (
              <div className="contact-form__success">
                Հաղորդագրությունը ուղարկված է։ Կապ կհաստատենք հնարավորինս շուտ։
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <label className="contact-form__label">
                  <span>Անուն</span>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="contact-form__input"
                    required
                  />
                </label>
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
                  <span>Թեմա</span>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="contact-form__input"
                  />
                </label>
                <label className="contact-form__label">
                  <span>Հաղորդագրություն</span>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className="contact-form__input contact-form__textarea"
                    rows={4}
                    required
                  />
                </label>
                <button type="submit" className="btn btn--primary contact-form__submit">
                  Ուղարկել
                </button>
              </form>
            )}
          </div>

          <div className="contact-locations">
            <h2 className="section-title">Հասցեներ</h2>
            <div className="locations-list">
              {locations.map((loc) => (
                <div key={loc.id} className="location-card">
                  <h3 className="location-card__name">{loc.name}</h3>
                  <p className="location-card__address">{loc.address}</p>
                  <p className="location-card__hours">{loc.hours}</p>
                </div>
              ))}
            </div>
            <div className="contact-map-placeholder">
              <span className="contact-map-placeholder__text">Քարտեզի բլոկ (ստատիկ)</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
