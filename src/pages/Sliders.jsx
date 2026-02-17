import { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    title: 'Ֆիզիկական ակտիվություն',
    text: 'Մարզումների պլանավորումը եւ կատարված վարժությունների գրանցումը նպաստում են կայուն առողջ վարքագծի արմատավորմանը։',
    emoji: '🏃',
  },
  {
    id: 2,
    title: 'Բալանսավորված սննդակարգ',
    text: 'Կալորիաների հաշվառումը եւ անհատականացված առաջարկությունները օգնում են պահպանել առողջ սննդակարգ։',
    emoji: '🥑',
  },
  {
    id: 3,
    title: 'Հոգեկան առողջություն',
    text: 'Քնի ռեժիմի եւ սթրեսի կառավարման հետեւումը բարձրացնում է կյանքի որակը։',
    emoji: '🧘',
  },
  {
    id: 4,
    title: 'Տվյալների վիզուալիզացիա',
    text: 'Գրաֆիկների եւ աղյուսակների միջոցով օգտատերը կարող է կենտրոնացված ձեւով հետեւել առողջական ցուցանիշներին։',
    emoji: '📈',
  },
  {
    id: 5,
    title: 'UX եւ մոտիվացիա',
    text: 'Պարզ ինտերֆեյսը, տրամաբանական նավիգացիան եւ հիշեցումները բարձրացնում են երկարաժամկետ ներգրավվածությունը։',
    emoji: '✨',
  },
];

export default function Sliders() {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const goTo = (index) => {
    setCurrent((index + slides.length) % slides.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 4000);
  };

  useEffect(() => {
    if (!autoPlay) return;
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 4000);
    return () => clearInterval(t);
  }, [autoPlay]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title">Սլայդերներ</h1>
          <p className="page-hero__subtitle">
            Առողջ ապրելակերպի հիմնական առանցքները
          </p>
        </div>
      </section>

      <section className="page-section slider-section">
        <div className="container">
          <div className="slider">
            <div className="slider__track">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`slider__slide ${index === current ? 'slider__slide--active' : ''}`}
                  aria-hidden={index !== current}
                >
                  <div className="slider__emoji">{slide.emoji}</div>
                  <h2 className="slider__title">{slide.title}</h2>
                  <p className="slider__text">{slide.text}</p>
                </div>
              ))}
            </div>
            <div className="slider__dots">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`slider__dot ${index === current ? 'slider__dot--active' : ''}`}
                  aria-label={`Գնալ սլայդ ${index + 1}`}
                  onClick={() => goTo(index)}
                />
              ))}
            </div>
            <div className="slider__arrows">
              <button
                type="button"
                className="slider__arrow"
                aria-label="Նախորդ"
                onClick={() => goTo(current - 1)}
              >
                ‹
              </button>
              <button
                type="button"
                className="slider__arrow"
                aria-label="Հաջորդ"
                onClick={() => goTo(current + 1)}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
