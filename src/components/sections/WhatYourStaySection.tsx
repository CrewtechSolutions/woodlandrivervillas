import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export const WhatYourStaySection: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof (window as any).initApp === 'function') {
        (window as any).initApp();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const marqueeImages = [
    { src: '/assets/img/hero/4/1.png', ratio: 'ratio-1:1' },
    { src: '/assets/img/hero/4/2.png', ratio: 'ratio-2:3' },
    { src: '/assets/img/hero/4/3.png', ratio: 'ratio-1:1' },
    { src: '/assets/img/hero/4/4.png', ratio: 'ratio-2:3' },
    { src: '/assets/img/hero/4/5.png', ratio: 'ratio-1:1' },
    { src: '/assets/img/hero/4/6.png', ratio: 'ratio-2:3' },
  ];

  return (
    <section data-anim-wrap className="hero -type-4 bg-light-1 layout-pt-md layout-pb-md">
      <div className="container">
        <div data-anim-wrap className="row justify-center">
          <div className="col-auto">
            <div className="hero__content text-center">
              <div data-split="lines" data-anim-child="split-lines delay-3">
                <h2 className="hero__title">
                  What Your Stay <br className="lg:d-none" />
                  Can Look Like
                </h2>

                <p className="pt-40 md:pt-20">
                  Swim, eat, unwind, or do nothing at all in a space designed for your pace.
                </p>
              </div>

              <div data-anim-child="slide-up delay-5" className="d-flex justify-center mt-60 md:mt-30">
                <Link className="button d-inline-flex -type-1" to="/our-villas">
                  <i className="-icon icon-arrow-circle-right text-30"></i>
                  View Villas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="marquee mt-60 md:pt-30">
        <div className="marquee__item">
          {marqueeImages.map((img, idx) => (
            <div key={idx} data-anim-child={`img-right cover-white delay-${(idx + 2) * 2}`} className={`ratio ${img.ratio}`}>
              <img src={img.src} alt="Woodland River Villa Experience" className="img-ratio" loading="lazy" />
            </div>
          ))}
        </div>

        <div className="marquee__item">
          {marqueeImages.map((img, idx) => (
            <div key={`repeat-${idx}`} data-anim-child={`img-right cover-white delay-${(idx + 2) * 2}`} className={`ratio ${img.ratio}`}>
              <img src={img.src} alt="Woodland River Villa Experience" className="img-ratio" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
