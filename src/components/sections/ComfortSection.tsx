import React from 'react';
import { siteConfig } from '../../data/siteConfig';

export const ComfortSection: React.FC = () => {
  return (
    <section id="secondSection" data-anim-wrap className="layout-pt-md layout-pb-md">
      <div className="container">
        <div className="row justify-center text-center">
          <div className="col-auto">
            <div data-anim-child="slide-up delay-1" className="text-15 uppercase mb-30 sm:mb-10">
              All-in-One Comfort
            </div>
            <h2 data-anim-child="slide-up delay-2" className="text-64 md:text-40">
              Everything You Need,<br className="lg:d-none" />In One Place
            </h2>
          </div>
        </div>

        <div className="row y-gap-30 pt-100 sm:pt-50">
          <div className="col-lg-6">
            <div data-anim-child="slide-up delay-3" className="col-lg-8 px-0">
              <p>
                Woodland river villa offers a private swimming pool, indoor
                and outdoor games, and comfortable in-villa essentials. Spaces
                include a garden, kids play area, along with access to a gym
                and sauna. With parking, housekeeping, and laundry, your stay
                stays easy and well-managed.
              </p>
            </div>

            <div data-anim-child="slide-up delay-4">
              <a
                className="button d-inline-flex -type-1 mt-60 md:mt-30"
                href={siteConfig.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="-icon">
                  <svg width="50" height="30" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M35.8 28.0924C43.3451 28.0924 49.4616 21.9759 49.4616 14.4308C49.4616 6.88577 43.3451 0.769287 35.8 0.769287C28.255 0.769287 22.1385 6.88577 22.1385 14.4308C22.1385 21.9759 28.255 28.0924 35.8 28.0924Z"
                      stroke="#122223"
                    />
                    <path
                      d="M33.4808 10.2039L32.9985 10.8031L37.2931 14.2623H0.341553V15.0315H37.28L33.0008 18.4262L33.4785 19.0285L39 14.6492L33.4808 10.2039Z"
                      fill="#122223"
                    />
                  </svg>
                </i>
                Book now
              </a>
            </div>

            <div className="lg:d-none mt-60 md:mt-30" data-anim-child="slide-up delay-6">
              <img src="/assets/img/about/1/1.png" alt="Woodland River Villa" loading="lazy" />
            </div>
          </div>

          <div className="col-lg-6 lg:d-none">
            <div data-anim-child="slide-up delay-7">
              <img src="/assets/img/about/1/2.png" alt="Woodland River Villa" loading="lazy" />
            </div>
            <div className="mt-30" data-anim-child="slide-up delay-8">
              <img src="/assets/img/about/1/3.png" alt="Woodland River Villa" loading="lazy" />
            </div>
          </div>
        </div>

        <div data-anim-child="slide-up delay-4" className="d-none lg:d-flex mt-40">
          <img src="/assets/img/about/1/mobile.png" alt="Woodland River Villa" className="w-1/1" loading="lazy" />
        </div>
      </div>
    </section>
  );
};
