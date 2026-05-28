import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHumanChatUnread } from '../contexts/HumanChatUnreadContext';
import { HeaderStreakBadge } from './streak/LoginStreak';
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
  const { totalUnread } = useHumanChatUnread();
  const hasUnread = totalUnread > 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container header__inner">
        {user && <HeaderStreakBadge streakCount={user.login_streak_count} />}
        <div className="header__left">
          <Link to="/" className="header__logo">
            <img src={IMG.logo} alt="" className="header__logo-img" />
            <span>Առողջ ապրելակերպ</span>
          </Link>
        </div>
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
                  to="/dashboard"
                  className="btn btn--outline header__auth-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  Վահան
                </Link>
                <Link
                  to="/profile"
                  className="btn btn--outline header__auth-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  Պրոֆիլ
                </Link>
                <Link
                  to="/chat"
                  className="btn btn--outline header__auth-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  Զրույց
                </Link>
                <Link
                  to="/human-chat"
                  className={`btn btn--outline header__auth-btn header__auth-btn--chat ${
                    hasUnread ? 'header__auth-btn--unread' : ''
                  }`}
                  onClick={() => setMenuOpen(false)}
                  aria-label={hasUnread ? `Չատ, ${totalUnread} չկարդացված` : 'Չատ'}
                >
                  Չատ
                  {hasUnread && (
                    <span className="header__unread-badge" aria-hidden="true">
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                  )}
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
