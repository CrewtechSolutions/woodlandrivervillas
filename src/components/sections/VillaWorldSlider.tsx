import React, { useEffect } from 'react';

export const VillaWorldSlider: React.FC = () => {
  useEffect(() => {
    if (typeof (window as any).initApp === 'function') {
      (window as any).initApp();
    }
  }, []);

  const cards = [
    { title: 'Private Pool', image: '/assets/img/cards/1/1.png', delay: 2 },
    { title: 'Fireplace', image: '/assets/img/cards/1/2.png', delay: 4 },
    { title: 'Dine', image: '/assets/img/cards/1/3.png', delay: 6 },
    { title: 'Scenic Walks', image: '/assets/img/cards/1/4.png', delay: 8 },
    { title: 'Turf', image: '/assets/img/cards/1/5.png', delay: 10 },
    { title: 'Riverfront Views', image: '/assets/img/cards/1/6.png', delay: 12 },
  ];

  return (
    <section className="layout-pt-md layout-pb-md bg-light-1">
      <div data-anim-wrap className="container">
        <div className="row justify-center text-center">
          <div data-split="lines" data-anim-child="split-lines delay-2" className="col-auto">
            <div className="text-15 uppercase mb-30 sm:mb-10">THE VILLA WORLD</div>
            <h2 className="text-64 md:text-40">
              A Stay Designed For <br className="lg:d-none" />
              Complete Ease And Flexibility.
            </h2>
          </div>
        </div>

        <div className="pt-100 sm:pt-50">
          <div
            className="relative js-section-slider"
            data-gap="30"
            data-slider-cols="xl-4 lg-4 md-3 sm-2 base-1"
            data-nav-prev="js-slider4-prev"
            data-nav-next="js-slider4-next"
          >
            <div className="swiper-wrapper">
              {cards.map((card, idx) => (
                <div key={idx} className="swiper-slide">
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    data-anim-child={`img-right cover-light-1 delay-${card.delay}`}
                    className="baseCard -type-1 -hover-image-scale"
                  >
                    <div className="baseCard__image ratio ratio-33:45 rounded-16">
                      <div className="-hover-image-scale__image">
                        <img src={card.image} alt={card.title} className="img-ratio" loading="lazy" />
                      </div>
                    </div>
                    <div className="baseCard__content d-flex flex-column justify-end text-center">
                      <h4 className="text-30 md:text-25 text-white">{card.title}</h4>
                    </div>
                  </a>
                </div>
              ))}
            </div>

            <div className="navAbsolute -type-4">
              <button
                className="size-80 flex-center bg-accent-1-50 blur-1 rounded-full js-slider4-prev"
                aria-label="Previous Slide"
              >
                <i className="icon-arrow-left text-24 text-white"></i>
              </button>

              <button
                className="size-80 flex-center bg-accent-1-50 blur-1 rounded-full js-slider4-next"
                aria-label="Next Slide"
              >
                <i className="icon-arrow-right text-24 text-white"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
