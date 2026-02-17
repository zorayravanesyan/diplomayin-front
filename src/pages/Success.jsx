import { Link, useLocation } from 'react-router-dom';

export default function Success() {
  const location = useLocation();
  const message = location.state?.message || 'Գործողությունը հաջողությամբ կատարվեց';

  return (
    <section className="page-section">
      <div className="container">
        <div className="success-page">
          <div className="success-page__icon">✓</div>
          <h1 className="success-page__title">Հաջողություն</h1>
          <p className="success-page__message">{message}</p>
          <Link to="/" className="btn btn--primary">
            Վերադառնալ գլխավոր էջ
          </Link>
        </div>
      </div>
    </section>
  );
}
