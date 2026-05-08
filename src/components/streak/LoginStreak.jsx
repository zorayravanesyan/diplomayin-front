import { useState } from 'react';

export const LOGIN_STREAK_LEVELS = [
  {
    min: 0,
    max: 0,
    label: 'Նոր սկիզբ',
    emoji: '🌱',
    message: 'Մուտք գործիր ամեն օր և սկսիր քո շարքը',
    tone: 'starter',
  },
  {
    min: 1,
    max: 9,
    label: 'Սկսնակ',
    emoji: '✨',
    message: 'Շարունակիր նույն տեմպով',
    tone: 'starter',
  },
  {
    min: 10,
    max: 29,
    label: 'Թեժ շարք',
    gif: '/gifs/fire.gif',
    fallbackEmoji: '🔥',
    message: 'Շատ լավ արդյունք, պահիր կրակը',
    tone: 'fire',
  },
  {
    min: 30,
    max: 99,
    label: 'Լեգենդար շարք',
    gif: '/gifs/big-fire.gif',
    fallbackEmoji: '🏆',
    message: 'Լեգենդար արդյունք, շարունակիր նույն տեմպով',
    tone: 'legendary',
  },
  {
    min: 100,
    max: 999999,
    label: 'Անմահ',
    gif: '/gifs/legendary-fire.gif',
    fallbackEmoji: '⚡',
    message: 'Քո շարքը արդեն պատմություն է',
    tone: 'immortal',
  },
];

export function getLoginStreakLevel(streakCount = 0) {
  const count = Number.isFinite(Number(streakCount)) ? Number(streakCount) : 0;
  return (
    LOGIN_STREAK_LEVELS.find((level) => count >= level.min && count <= level.max) ??
    LOGIN_STREAK_LEVELS[0]
  );
}

export function LoginStreakEffect({ animation, tone }) {
  if (!animation) return null;

  return (
    <span
      className={`login-streak-effect login-streak-effect--${animation} login-streak-effect--${tone}`}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </span>
  );
}

export function LoginStreakBadge({ level }) {
  const [assetFailed, setAssetFailed] = useState(false);
  const IconComponent = typeof level.icon === 'function' ? level.icon : null;
  const fallbackEmoji = level.fallbackEmoji || '🔥';

  return (
    <span className={`login-streak-badge login-streak-badge--${level.tone}`}>
      {level.emoji && <span className="login-streak-badge__emoji">{level.emoji}</span>}
      {!level.emoji && IconComponent && (
        <span className="login-streak-badge__icon">
          <IconComponent />
        </span>
      )}
      {!level.emoji && !IconComponent && typeof level.icon === 'string' && (
        <span className="login-streak-badge__emoji">{level.icon}</span>
      )}
      {!level.emoji && !level.icon && level.gif && !assetFailed && (
        <img
          className="login-streak-badge__asset"
          src={level.gif}
          alt=""
          onError={() => setAssetFailed(true)}
        />
      )}
      {!level.emoji && !level.icon && level.gif && assetFailed && (
        <span className="login-streak-badge__emoji">{fallbackEmoji}</span>
      )}
      {!level.emoji && !level.icon && !level.gif && level.animation && (
        <LoginStreakEffect animation={level.animation} tone={level.tone} />
      )}
      {!level.emoji && !level.icon && !level.gif && !level.animation && level.image && !assetFailed && (
        <img
          className="login-streak-badge__asset"
          src={level.image}
          alt=""
          onError={() => setAssetFailed(true)}
        />
      )}
      {!level.emoji && !level.icon && !level.gif && !level.animation && level.image && assetFailed && (
        <span className="login-streak-badge__emoji">{fallbackEmoji}</span>
      )}
    </span>
  );
}

export default function LoginStreakCard({ streakCount = 0 }) {
  const safeCount = Math.max(0, Number(streakCount) || 0);
  const level = getLoginStreakLevel(safeCount);

  return (
    <section className={`login-streak-card login-streak-card--${level.tone}`}>
      <div className="login-streak-card__glow" aria-hidden="true" />
      <LoginStreakBadge level={level} />
      <div className="login-streak-card__body">
        <span className="login-streak-card__label">{level.label}</span>
        <strong className="login-streak-card__count">{safeCount} օր անընդմեջ</strong>
        <p className="login-streak-card__message">{level.message}</p>
      </div>
      <LoginStreakEffect animation={level.animation} tone={level.tone} />
    </section>
  );
}

export function HeaderStreakBadge({ streakCount = 0 }) {
  const safeCount = Math.max(0, Number(streakCount) || 0);
  const level = getLoginStreakLevel(safeCount);
  const gifStyle = level.gif ? { '--header-streak-gif': `url("${level.gif}")` } : undefined;

  return (
    <div
      className={`header-streak header-streak--${level.tone} ${level.gif ? 'header-streak--gif' : ''}`}
      style={gifStyle}
      title={`${level.label} · ${safeCount} օր անընդմեջ`}
    >
      <LoginStreakBadge level={level} />
      <div className="header-streak__content">
        <span className="header-streak__count">{safeCount} օր անընդմեջ</span>
        <span className="header-streak__label">{level.label}</span>
      </div>
      <LoginStreakEffect animation={level.animation || (level.gif ? 'fire' : null)} tone={level.tone} />
    </div>
  );
}
