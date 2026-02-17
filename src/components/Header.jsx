import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import IMG from '../data/images';

const navItems = [
  { path: '/', label: 'Գլխավոր' },
  { path: '/about', label: 'Մեր մասին' },
  { path: '/sliders', label: 'Սլայդերներ' },
  { path: '/contact', label: 'Կապ եւ հասցեներ' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo">
          <img src={IMG.logo} alt="" className="header__logo-img" />
          <span>Առողջ ապրելակերպ</span>
        </Link>
        <button
          type="button"
          className="header__toggle"
          aria-label="Մենյու"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`header__link ${location.pathname === path ? 'header__link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="header__auth">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="btn btn--outline header__auth-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  Պրոֆիլ
                </Link>
                <button
                  type="button"
                  className="btn btn--primary header__auth-btn"
                  onClick={handleLogout}
                >
                  Ելք
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn--outline header__auth-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  Մուտք
                </Link>
                <Link
                  to="/registration"
                  className="btn btn--primary header__auth-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  Գրանցում
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
