import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { villasData } from '../data/villasData';
import { PageHero } from '../components/common/PageHero';
import { ImageModal } from '../components/common/ImageModal';
import { InstagramGrid } from '../components/sections/InstagramGrid';
import { BookingCTA } from '../components/common/BookingCTA';
import { siteConfig } from '../data/siteConfig';

export const VillaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const villa = villasData.find((v) => v.slug === id || v.id === id);
  const [modalImg, setModalImg] = useState<string | null>(null);

  if (!villa) {
    return <Navigate to="/our-villas" replace />;
  }

  return (
    <>
      <SEO title={`${villa.name} | Woodland River Villa Alibaug`} description={villa.description} />
      <PageHero title={villa.name} subtitle={villa.subtitle} bgImage={villa.heroImage} />

      <section className="layout-pt-md layout-pb-md">
        <div className="container">
          <div className="row y-gap-40 justify-between">
            <div className="col-lg-7">
              <h2 className="text-40 fw-500 mb-20">{villa.name} Overview</h2>
              <p className="text-18 text-sec lh-17">{villa.description}</p>

              <div className="d-flex x-gap-30 y-gap-20 mt-40 p-30 bg-light-1 rounded-16 flex-wrap">
                <div>
                  <div className="text-14 uppercase text-sec opacity-60">BEDROOMS</div>
                  <div className="text-20 fw-500 mt-5">{villa.bedrooms}</div>
                </div>
                <div>
                  <div className="text-14 uppercase text-sec opacity-60">BATHROOMS</div>
                  <div className="text-20 fw-500 mt-5">{villa.bathrooms}</div>
                </div>
                <div>
                  <div className="text-14 uppercase text-sec opacity-60">GUEST CAPACITY</div>
                  <div className="text-20 fw-500 mt-5">{villa.guests}</div>
                </div>
              </div>

              <div className="mt-50">
                <h3 className="text-30 fw-500 mb-20">Villa Amenities & Features</h3>
                <div className="row y-gap-15">
                  {villa.features.map((feat, idx) => (
                    <div key={idx} className="col-md-6 d-flex items-center text-18">
                      <i className="icon-check text-16 text-accent-1 mr-15"></i>
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="bg-dark-2 text-white p-40 rounded-16 sticky-top">
                <h3 className="text-30 text-white fw-500 mb-20">Book {villa.name}</h3>
                <p className="text-16 text-white opacity-80 mb-30">
                  Enjoy complete privacy, private pool access, and peaceful surroundings in Alibaug.
                </p>

                <a
                  href={villa.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button d-inline-flex -md bg-accent-1 text-white rounded-200 w-1/1 justify-center"
                >
                  BOOK THIS VILLA NOW
                </a>

                <a
                  href={`tel:${siteConfig.phoneNumbers[0].replace(/\s+/g, '')}`}
                  className="button d-inline-flex -md -blur-1 text-white rounded-200 w-1/1 justify-center mt-15"
                >
                  CALL FOR INQUIRIES
                </a>
              </div>
            </div>
          </div>

          <div className="mt-80">
            <h3 className="text-30 fw-500 mb-30">Villa Gallery</h3>
            <div className="row y-gap-20">
              {villa.galleryImages.map((img, idx) => (
                <div key={idx} className="col-lg-3 col-md-6 cursor-pointer" onClick={() => setModalImg(img)}>
                  <div className="ratio ratio-4:3 rounded-12 overflow-hidden hover-scale">
                    <img src={img} alt={`${villa.name} photo ${idx + 1}`} className="img-ratio" loading="lazy" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <InstagramGrid />
      <BookingCTA />

      <ImageModal isOpen={!!modalImg} imageSrc={modalImg || ''} onClose={() => setModalImg(null)} />
    </>
  );
};
