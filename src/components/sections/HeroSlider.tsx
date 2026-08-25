import React, { useEffect } from 'react';
import { siteConfig } from '../../data/siteConfig';

export const HeroSlider: React.FC = () => {
  useEffect(() => {
    if (typeof (window as any).initApp === 'function') {
      (window as any).initApp();
    }
  }, []);
  const slides = [
    {
      img: '/assets/img/hero/9/1.jpg',
      subtitle: 'Own Your Weekend at Woodland River Villa',
      title: 'A Private Villa Stay Built for Comfort, Space & Ease.',
    },
    {
      img: '/assets/img/hero/9/2.jpg',
      subtitle: 'Own Your Weekend at Woodland River Villa',
      title: 'Your Private Escape in Alibaug With Swimming Pool & Lawn.',
    },
    {
      img: '/assets/img/hero/9/3.jpg',
      subtitle: 'Own Your Weekend at Woodland River Villa',
      title: 'Gather Your Group for Uninterrupted Moments & Memories.',
    },
    {
      img: '/assets/img/hero/9/4.jpg',
      subtitle: 'Own Your Weekend at Woodland River Villa',
      title: 'Quiet Riverfront Surroundings Away From City Crowds.',
    },
    {
      img: '/assets/img/hero/9/5.jpg',
      subtitle: 'Own Your Weekend at Woodland River Villa',
      title: 'Feel at Home with In-Villa Comforts & Thoughtful Details.',
    },
  ];

  return (
    <section data-anim-wrap className="hero -type-9 relative">
      <div
        className="hero__slider js-section-slider"
        data-gap="0"
        data-slider-cols="xl-1 lg-1 md-1 sm-1 base-1"
        data-nav-prev="js-sliderHero-prev"
        data-nav-next="js-sliderHero-next"
        data-number-pagination="js-number-pag"
      >
        <div className="swiper-wrapper">
          {slides.map((slide, idx) => (
            <div key={idx} className="swiper-slide">
              <div className="hero__slide">
                <div className="hero__bg" data-anim-child="img-right cover-white delay-2">
                  <img src={slide.img} alt={slide.title} className="img-ratio" loading={idx === 0 ? 'eager' : 'lazy'} />
                </div>

                <div className="hero__content">
                  <div className="container">
                    <div data-anim-wrap className="row justify-center">
                      <div className="col-auto">
                        <div className="hero__content text-center">
                          <div data-split="lines" data-anim-child="split-lines delay-3">
                            <div className="hero__subtitle text-white">{slide.subtitle}</div>
                            <h1 className="hero__title text-white">{slide.title}</h1>
                          </div>

                          <div data-anim-child="slide-up delay-5" className="d-flex justify-center mt-60 md:mt-30">
                            <a
                              className="button d-inline-flex -md -type-2 bg-accent-2 -accent-1 rounded-200"
                              href={siteConfig.bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Book Your Stay
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Side navigation arrows */}
        <div data-anim-child="fade delay-5" className="hero__nav navAbsolute -type-9">
          <div className="container d-flex justify-between items-center w-1/1">
            <button className="button -blur-1 text-white size-80 flex-center rounded-full js-sliderHero-prev" aria-label="Previous Slide">
              <i className="icon-arrow-left text-24"></i>
            </button>

            <button className="button -blur-1 text-white size-80 flex-center rounded-full js-sliderHero-next" aria-label="Next Slide">
              <i className="icon-arrow-right text-24"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom page number pagination */}
      <div data-anim-child="fade delay-5" className="hero__pagination">
        <div className="pagination -type-number d-flex items-center justify-center fw-500 text-white js-number-pag"></div>
      </div>
    </section>
  );
};
