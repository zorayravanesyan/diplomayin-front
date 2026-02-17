import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            Առողջ ապրելակերպ
          </Link>
          <p className="footer__tagline">
            Թվային հարթակ առողջ սովորությունների եւ կյանքի որակի համար
          </p>
        </div>
        <nav className="footer__links">
          <Link to="/">Գլխավոր</Link>
          <Link to="/about">Մեր մասին</Link>
          <Link to="/sliders">Սլայդերներ</Link>
          <Link to="/contact">Կապ</Link>
        </nav>
        <p className="footer__copy">
          © {year} Diplomayin. Բոլոր իրավունքները պաշտպանված են։
        </p>
      </div>
    </footer>
  );
}
