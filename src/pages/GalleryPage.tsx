import React, { useState } from 'react';
import { SEO } from '../components/common/SEO';
import { PageHero } from '../components/common/PageHero';
import { galleryData } from '../data/galleryData';
import { ImageModal } from '../components/common/ImageModal';
import { InstagramGrid } from '../components/sections/InstagramGrid';
import { BookingCTA } from '../components/common/BookingCTA';
import { LazyImage } from '../components/common/LazyImage';

export const GalleryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [modalImg, setModalImg] = useState<string | null>(null);

  const categories = [
    { label: 'ALL', value: 'all' },
    { label: 'VILLAS', value: 'villas' },
    { label: 'EXTERIOR', value: 'exterior' },
    { label: 'POOL', value: 'pool' },
    { label: 'DINING', value: 'dining' },
    { label: 'GROUNDS', value: 'grounds' },
  ];

  const filteredItems =
    activeCategory === 'all'
      ? galleryData
      : galleryData.filter((item) => item.category === activeCategory);

  return (
    <>
      <SEO
        title="Gallery | Woodland River Villa"
        description="Browse our gallery of villa spaces, lush surroundings and curated interiors. Every image is an invitation to experience Woodland River Villa."
        canonical="https://www.woodlandriver.com/gallery/"
      />
      <PageHero
        title="Every Corner Tells a Story"
        subtitle="Spaces designed for stillness. Moments made to be remembered."
        bgImage="/assets/img/pageHero/4.png"
      />

      <section className="gallery-section layout-pt-md layout-pb-md" aria-label="Villa photo gallery">
        <div className="container">
          <div className="d-flex justify-center x-gap-20 y-gap-10 flex-wrap mb-50">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`button -sm rounded-200 border-1 px-20 py-10 transition ${
                  activeCategory === cat.value ? 'bg-dark-2 text-white' : 'bg-white text-dark-2'
                }`}
                onClick={() => setActiveCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="gallery-masonry">
            {filteredItems.map((item) => (
              <figure
                key={item.id}
                className="gallery-item cursor-pointer"
                onClick={() => setModalImg(item.image)}
                role="button"
                tabIndex={0}
                aria-label={`Open ${item.title}`}
              >
                <LazyImage src={item.image} alt={item.alt} />
                <span className="gallery-item__zoom" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.5" y1="16.5" x2="22" y2="22" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </span>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <InstagramGrid />
      <BookingCTA />

      <ImageModal isOpen={!!modalImg} imageSrc={modalImg || ''} onClose={() => setModalImg(null)} />
    </>
  );
};
