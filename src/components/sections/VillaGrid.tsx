import React, { useEffect } from 'react';
import { villasData } from '../../data/villasData';

export const VillaGrid: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof (window as any).initApp === 'function') {
        (window as any).initApp();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section data-anim-wrap className="layout-pt-md">
      <div className="container">
        <div className="row y-gap-30 justify-center text-center">
          <div data-split="lines" data-anim-child="split-lines delay-2" className="col-auto">
            <div className="text-15 uppercase mb-30 sm:mb-10">Curated Villa Collection</div>
            <h2 className="text-64 md:text-40 lh-065">Find the One That Fits Your Stay</h2>
          </div>
        </div>
      </div>

      <div className="relative ml-60 mr-60 md:ml-10 md:mr-10">
        <div className="container">
          <div data-anim-child="slide-up delay-5" className="row justify-center pt-100 sm:pt-50">
            <div className="col-xl-8 col-lg-10">
              <div
                className="sectionSlider -type-1 js-section-slider"
                data-gap="60"
                data-loop
                data-slider-cols="xl-1 lg-1 md-1 sm-1 base-1"
                data-nav-prev="js-sliderRoom-prev"
                data-nav-next="js-sliderRoom-next"
              >
                <div className="sectionSlider__bgContainer">
                  <div className="sectionSlider__bg bg-light-1"></div>
                </div>

                <div className="swiper-wrapper">
                  {villasData.map((villa) => (
                    <div key={villa.id} className="swiper-slide">
                      <div className="roomCard -type-1">
                        <div className="roomCard__image ratio ratio-92:60">
                          <img src={villa.heroImage} alt={villa.name} className="img-ratio" loading="lazy" />
                        </div>

                        <div className="sectionSlider__content roomCard__content mt-50 md:mt-30">
                          <div className="d-flex justify-between items-start">
                            <div>
                              <h3 className="roomCard__title lh-065 text-40 md:text-30 mb-4">
                                <a href={villa.bookingUrl} target="_blank" rel="noopener noreferrer">
                                  {villa.name}
                                </a>
                              </h3>
                              <p className="roomCard__description text-20 md:text-12">{villa.description}</p>
                            </div>
                          </div>

                          <div className="d-flex x-gap-15 md:text-15 pt-30 md:pt-20">
                            <div>{villa.bedrooms},</div>
                            <div>{villa.bathrooms},</div>
                            <div>{villa.guests}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="navAbsolute md:d-none">
                  <button
                    className="button -blur-1 text-white size-80 flex-center rounded-full js-sliderRoom-prev"
                    aria-label="Previous Villa"
                  >
                    <i className="icon-arrow-left text-24"></i>
                  </button>

                  <button
                    className="button -blur-1 text-white size-80 flex-center rounded-full js-sliderRoom-next"
                    aria-label="Next Villa"
                  >
                    <i className="icon-arrow-right text-24"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
