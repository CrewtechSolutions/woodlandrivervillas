import React from 'react';
import { Link } from 'react-router-dom';
import { Villa } from '../../types';
import { LazyImage } from './LazyImage';

interface VillaCardProps {
  villa: Villa;
}

export const VillaCard: React.FC<VillaCardProps> = ({ villa }) => {
  return (
    <div className="roomCard -type-1 villaCard">
      <div className="roomCard__image ratio ratio-92:60">
        <Link to={`/our-villas/${villa.slug}`}>
          <img src={villa.heroImage} alt={villa.name} className="img-ratio" loading="lazy" />
        </Link>
      </div>

      <div className="sectionSlider__content roomCard__content mt-50 md:mt-30">
        <div className="d-flex justify-between items-start">
          <div>
            <h3 className="roomCard__title lh-065 text-40 md:text-30 mb-4">
              <Link to={`/our-villas/${villa.slug}`}>{villa.name}</Link>
            </h3>
            <p className="roomCard__description text-20 md:text-12">{villa.description}</p>
          </div>
        </div>

        <div className="d-flex x-gap-15 md:text-15 pt-30 md:pt-20 text-sec fw-500">
          <div>{villa.bedrooms},</div>
          <div>{villa.bathrooms},</div>
          <div>{villa.guests}</div>
        </div>

        <div className="mt-30 d-flex x-gap-20">
          <Link to={`/our-villas/${villa.slug}`} className="button d-inline-flex -type-1">
            Explore Villa
          </Link>
          <a
            href={villa.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button d-inline-flex -type-1 bg-accent-1 text-white"
          >
            Book Now
          </a>
        </div>
      </div>
    </div>
  );
};
