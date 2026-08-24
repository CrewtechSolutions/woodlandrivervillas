import React from 'react';
import { Link } from 'react-router-dom';

export const EmbraceSpaceSection: React.FC = () => {
  return (
    <section data-anim-wrap className="layout-pt-md">
      <div className="imageGrid__wrap -type-6">
        <div className="imageGrid -type-6">
          <div>
            <div data-anim-child="img-right cover-white delay-2">
              <img src="/assets/img/about/14/1.png" alt="Woodland River Villa" loading="lazy" />
            </div>
          </div>

          <div>
            <div data-anim-child="img-right cover-white delay-4">
              <img src="/assets/img/about/14/2.png" alt="Woodland River Villa" loading="lazy" />
            </div>
          </div>

          <div>
            <div data-anim-child="img-right cover-white delay-6">
              <img src="/assets/img/about/14/3.png" alt="Woodland River Villa" loading="lazy" />
            </div>
          </div>

          <div>
            <div data-anim-child="img-right cover-white delay-8">
              <img src="/assets/img/about/14/4.png" alt="Woodland River Villa" loading="lazy" />
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row justify-center text-center">
            <div className="col-xl-10 col-lg-11">
              <div data-split="lines" data-anim-child="split-lines delay-2">
                <h2 className="text-64 md:text-40">
                  A space that gently embraces you with comfort, privacy, and a <br className="lg:d-none" />
                  sense of belonging.
                </h2>
              </div>

              <div data-anim-child="slide-up delay-5" className="d-flex justify-center">
                <Link className="button d-inline-flex -md -type-2 bg-accent-2 -accent-1 rounded-200 mt-50 md:mt-20" to="/contact">
                  REACH OUT TO US
                </Link>
              </div>

              <p data-anim-child="slide-up delay-6" className="text-19 text-sec fw-500 mt-50 md:mt-20">
                Thoughtfully equipped spaces that cover every essential,
                <br className="md:d-none" />
                so you can settle in without needing anything else.
              </p>

              <div data-anim-child="slide-up delay-7" className="row justify-center pt-60 lg:pt-30">
                <div className="col-auto">
                  <img src="/assets/img/awardsIcons/dark/1.svg" alt="icon" loading="lazy" />
                </div>

                <div className="col-auto">
                  <img src="/assets/img/awardsIcons/dark/2.svg" alt="icon" loading="lazy" />
                </div>

                <div className="col-auto">
                  <img src="/assets/img/awardsIcons/dark/3.svg" alt="icon" loading="lazy" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
