import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { PageHero } from '../components/common/PageHero';
import { useVillas } from '../context/VillaContext';
import { siteConfig } from '../data/siteConfig';
import { InstagramGrid } from '../components/sections/InstagramGrid';
import { BookingCTA } from '../components/common/BookingCTA';
import { LazyImage } from '../components/common/LazyImage';

export const VillasPage: React.FC = () => {
  const { villas } = useVillas();

  return (
    <>
      <SEO
        title="Woodland River Villa Options | Villas in Alibaug"
        description="Explore Oakwood, Pinewood, Maplewood 4BHK villas and Rosewood Cabana at woodland river villa in Alibaug. Private stays for groups and couples."
        canonical="https://www.woodlandriver.com/our-villas/"
      />
      <PageHero
        title="Villas Designed Around the Way You Unwind"
        subtitle="Each stay is built for a different kind of escape. Private spaces, unique styles, and a setting that slows everything down."
        bgImage="/assets/img/pageHero/4.png"
      />

      <section className="layout-pt-md layout-pb-md">
        <div className="container">
          <div className="row justify-center text-center">
            <div className="col-xl-6 col-lg-8 col-md-10" data-split="lines" data-anim="split-lines delay-1">
              <div className="text-15 uppercase mb-30 sm:mb-10">CURATED STAYS</div>
              <h2 className="text-64 md:text-40 lh-11">
                Find a Villa That Matches Your State of Mind
              </h2>
              <p className="mt-40">
                From artistic expression to earthy calm and timeless elegance,
                each villa carries its own personality. Designed for different
                moods, but always rooted in comfort, privacy, and space to
                breathe.
              </p>
            </div>
          </div>
        </div>

        <div className="px-60 md:px-15">
          {villas.map((villa, idx) => {
            const isReverse = idx % 2 !== 0;
            return (
              <div key={villa.id} className="roomCard -type-2 pt-100 sm:pt-50">
                <div data-anim-wrap className={`roomCardGrid ${isReverse ? '-reverse' : ''}`}>
                  <div>
                    <div data-anim-child="slide-up delay-3" className="roomCard__content">
                      <div className="d-flex justify-between items-end">
                        <h3 className="roomCard__title lh-065 text-64 md:text-40">
                          <Link to={`/our-villas/${villa.slug}`}>{villa.name.toUpperCase()}</Link>
                        </h3>
                      </div>

                      <div className="d-flex x-gap-20 pt-40 md:pt-30 flex-wrap">
                        <div className="d-flex items-center text-accent-1">
                          <div className="d-inline-flex p-3 align-items-center justify-content-center bg-light-1 mr-10 rounded-12 border-1 border-light-1">
                            <i className="icon-bed text-20"></i>
                          </div>
                          {villa.bedrooms.toUpperCase()}
                        </div>

                        <div className="d-flex items-center text-accent-1">
                          <div className="d-inline-flex p-3 align-items-center justify-content-center bg-light-1 mr-10 rounded-12 border-1 border-light-1">
                            <i className="icon-bath text-20"></i>
                          </div>
                          {villa.bathrooms.toUpperCase()}
                        </div>

                        <div className="d-flex items-center text-accent-1">
                          <div className="d-inline-flex p-3 align-items-center justify-content-center bg-light-1 mr-10 rounded-12 border-1 border-light-1">
                            <i className="icon-guest text-20"></i>
                          </div>
                          {villa.guests.toUpperCase()}
                        </div>
                      </div>

                      <p className="mt-40 md:mt-30">{villa.description}</p>

                      <div className="d-flex x-gap-20 items-center mt-50 md:mt-20 flex-wrap">
                        <Link
                          to={`/our-villas/${villa.slug}`}
                          className="button d-inline-flex -md -type-2 bg-accent-2 -accent-1 rounded-200"
                        >
                          EXPLORE VILLA
                        </Link>
                        <Link
                          to={`/checkout/${villa.id}`}
                          state={{ villa, startDate: '', endDate: '' }}
                          className="button d-inline-flex -md bg-accent-1 text-white rounded-200"
                        >
                          BOOK NOW
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div data-anim-child="img-right cover-white delay-1">
                      <div className="roomCard__image -no-rounded ratio ratio-10:9">
                        <Link to={`/our-villas/${villa.slug}`}>
                          <img src={villa.heroImage} alt={villa.name} className="img-ratio" loading="lazy" />
                        </Link>
                        <div className="roomCard__price text-15 fw-500 bg-white text-accent-1 rounded-0">
                          {villa.bedrooms.includes('4') ? '4BHK' : '1BHK'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <InstagramGrid />
      <BookingCTA />
    </>
  );
};
