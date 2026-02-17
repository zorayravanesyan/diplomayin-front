import { Link } from 'react-router-dom';
import IMG from '../data/images';

export default function Home() {
  return (
    <>
      <section className="hero hero--parallax" style={{ backgroundImage: `url(${IMG.bannerYoga})` }}>
        <div className="hero__overlay" />
        <div className="container hero__inner">
          <h1 className="hero__title">
            Առողջ ապրելակերպը կյանքի որակի հիմքն է
          </h1>
          <p className="hero__subtitle">
            Թվային տեխնոլոգիաները ստեղծում են նոր հնարավորություններ՝ վեբ եւ բջջային
            հավելվածների միջոցով առողջ սովորությունները խթանելու եւ վերահսկելու համար։
          </p>
          <div className="hero__actions">
            <Link to="/about" className="btn btn--primary">
              Իմացեք ավելին
            </Link>
            <Link to="/contact" className="btn btn--outline">
              Կապ
            </Link>
          </div>
        </div>
      </section>

      <section className="parallax-banner" style={{ backgroundImage: `url(${IMG.bannerTraining})` }}>
        <div className="parallax-banner__overlay" />
        <div className="container parallax-banner__content">
          <h2 className="parallax-banner__title">Մարզումներ եւ ուժ</h2>
          <p className="parallax-banner__text">Ֆիզիկական ակտիվությունը կյանքի որակի հիմքն է</p>
        </div>
      </section>

      <section className="page-section page-section--alt">
        <div className="container">
          <h2 className="section-title">Ինչու մենք</h2>
          <p className="section-subtitle">
            Մեկ միասնական միջավայր՝ մարզումների, սննդակարգի եւ սովորությունների
            վերահսկման համար։
          </p>
          <div className="features">
            <div className="feature-card">
              <div className="feature-card__icon">💪</div>
              <h3 className="feature-card__title">Մարզումներ</h3>
              <p className="feature-card__text">
                Վարժությունների ընտրություն, գրանցում եւ առաջընթացի ամփոփում։
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">🥗</div>
              <h3 className="feature-card__title">Սննդակարգ</h3>
              <p className="feature-card__text">
                Կալորիականության հաշվարկ եւ անհատականացված առաջարկություններ։
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">📊</div>
              <h3 className="feature-card__title">Վիզուալիզացիա</h3>
              <p className="feature-card__text">
                Գրաֆիկներ եւ աղյուսակներ՝ առաջընթացի պատկերավոր ներկայացման համար։
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="parallax-banner" style={{ backgroundImage: `url(${IMG.bannerFood})` }}>
        <div className="parallax-banner__overlay" />
        <div className="container parallax-banner__content">
          <h2 className="parallax-banner__title">Առողջ սնունդ</h2>
          <p className="parallax-banner__text">Բալանսավորված սննդակարգը առողջության անբաժան մասն է</p>
        </div>
      </section>

      <section className="page-section">
        <div className="container cta-block">
          <h2 className="section-title">Սկսեք այսօր</h2>
          <p className="section-subtitle">
            Առողջ ապրելակերպի հարթակը ձեզ հետ է ամեն քայլում։
          </p>
          <Link to="/sliders" className="btn btn--primary">
            Դիտել սլայդերներ
          </Link>
        </div>
      </section>

      <section className="parallax-banner" style={{ backgroundImage: `url(${IMG.bannerSleep})` }}>
        <div className="parallax-banner__overlay" />
        <div className="container parallax-banner__content">
          <h2 className="parallax-banner__title">Առողջ քուն</h2>
          <p className="parallax-banner__text">Քնի ռեժիմը ազդում է առողջության եւ էներգիայի վրա</p>
        </div>
      </section>
    </>
  );
}
