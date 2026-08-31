import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Villa } from '../../types';

interface CatalogueVillaCardProps {
  villa: Villa;
  startDate?: string;
  endDate?: string;
  nightsCount?: number;
  isAvailable?: boolean;
  checkingAvailability?: boolean;
  onBookNow: () => void;
}

export const CatalogueVillaCard: React.FC<CatalogueVillaCardProps> = ({
  villa,
  startDate,
  endDate,
  nightsCount = 0,
  isAvailable = true,
  checkingAvailability = false,
  onBookNow,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const photos = villa.galleryImages && villa.galleryImages.length > 0 
    ? villa.galleryImages 
    : [villa.heroImage];

  const currentDisplayImage = photos[activePhotoIdx] || villa.heroImage;
  const isDateSelected = !!(startDate && endDate && nightsCount > 0);
  const totalStayPrice = isDateSelected && villa.pricePerNight ? villa.pricePerNight * nightsCount : 0;

  const bedroomsText = villa.bedrooms.includes('4') ? '4 BHK' : '1 BHK';
  const bathroomsText = villa.bathrooms.includes('5') ? '5 Baths' : '1 Bath';
  const guestsText = `Up to ${villa.maxGuests || 12} Guests`;

  // Format feature tags cleanly (e.g. "WI-FI" -> "Wi-Fi", "SWIMMING_POOL" -> "Swimming Pool")
  const formatFeature = (feat: string) => {
    return feat
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div 
      className="bg-white rounded-24 overflow-hidden border-1 border-light-2 shadow-md hover:shadow-2xl transition-all duration-300 h-full d-flex flex-column group"
      style={{
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
      }}
    >
      {/* CARD IMAGE CONTAINER */}
      <div className="relative overflow-hidden bg-dark-1" style={{ height: '230px' }}>
        <Link to={`/our-villas/${villa.slug}`}>
          <img
            src={currentDisplayImage}
            alt={villa.name}
            className="w-1/1 h-1/1 object-cover transition-all duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-1/70 via-transparent to-transparent opacity-60"></div>
        </Link>

        {/* BHK CATEGORY BADGE */}
        <div 
          className="absolute top-16 left-16 text-11 font-bold bg-dark-1/90 text-amber-300 px-14 py-6 rounded-200 uppercase tracking-widest border-1 border-amber-500/30 backdrop-blur-md z-2 d-flex items-center"
        >
          <i className="icon-star text-10 text-amber-400 mr-6"></i>
          {bedroomsText} LUXURY ESTATE
        </div>

        {/* AVAILABILITY BADGE */}
        {isDateSelected && (
          <div className={`absolute top-16 right-16 px-14 py-6 rounded-200 text-11 font-bold uppercase tracking-widest text-white shadow-md backdrop-blur-md z-2 d-flex items-center ${
            isAvailable ? 'bg-emerald-600/90 border-1 border-emerald-400/30' : 'bg-rose-900/90 border-1 border-rose-400/30'
          }`}>
            {checkingAvailability ? (
              <span>CHECKING...</span>
            ) : isAvailable ? (
              <><span className="size-8 rounded-full bg-emerald-300 mr-6 animate-pulse"></span> AVAILABLE</>
            ) : (
              <><span className="size-8 rounded-full bg-rose-400 mr-6"></span> BOOKED</>
            )}
          </div>
        )}

        {/* PHOTO PREVIEW DOTS */}
        {photos.length > 1 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-3 d-flex items-center p-4 rounded-200 bg-dark-1/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ gap: '6px' }}>
            {photos.slice(0, 5).map((_, pIdx) => (
              <button
                key={pIdx}
                onClick={(e) => {
                  e.preventDefault();
                  setActivePhotoIdx(pIdx);
                }}
                className={`size-8 rounded-full transition-all ${
                  activePhotoIdx === pIdx ? 'bg-amber-400 scale-125' : 'bg-white/60 hover:bg-white'
                }`}
                title={`Photo ${pIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* CARD CONTENT */}
      <div className="p-30 md:p-20 flex-grow-1 d-flex flex-column bg-white">
        <div className="d-flex justify-between items-center mb-10">
          <span className="text-11 uppercase tracking-widest text-accent-1 font-bold d-flex items-center">
            <i className="icon-location text-13 mr-6"></i> ZIRAD, ALIBAUG
          </span>
          <span className="text-11 text-sec font-semibold uppercase tracking-wider">Verified Villa</span>
        </div>

        <h3 className="text-24 font-serif font-bold text-dark-1 mb-16">
          <Link to={`/our-villas/${villa.slug}`} className="hover:text-accent-1 transition-colors">
            {villa.name}
          </Link>
        </h3>

        {/* AMENITIES GRID */}
        <div className="bg-light-1/90 border-1 border-light-2 p-16 rounded-16 mb-20">
          <div className="row y-gap-12 x-gap-12">
            <div className="col-6 d-flex items-center text-13 text-dark-1 font-medium">
              <div className="size-28 rounded-8 bg-white flex-center mr-8 text-accent-1 shadow-sm border-1 border-light-2">
                <i className="icon-bed text-14"></i>
              </div>
              {bedroomsText}
            </div>

            <div className="col-6 d-flex items-center text-13 text-dark-1 font-medium">
              <div className="size-28 rounded-8 bg-white flex-center mr-8 text-accent-1 shadow-sm border-1 border-light-2">
                <i className="icon-bath text-14"></i>
              </div>
              {bathroomsText}
            </div>

            <div className="col-6 d-flex items-center text-13 text-dark-1 font-medium">
              <div className="size-28 rounded-8 bg-white flex-center mr-8 text-accent-1 shadow-sm border-1 border-light-2">
                <i className="icon-guest text-14"></i>
              </div>
              {guestsText}
            </div>

            <div className="col-6 d-flex items-center text-13 text-dark-1 font-medium">
              <div className="size-28 rounded-8 bg-white flex-center mr-8 text-amber-500 shadow-sm border-1 border-light-2">
                <i className="icon-star text-14"></i>
              </div>
              Private Pool
            </div>
          </div>
        </div>

        <p className="text-14 text-sec mb-20 line-clamp-2 leading-relaxed flex-grow-1">
          {villa.description}
        </p>

        {/* PROPERLY FORMATTED FEATURE CHIPS WITH SPACING */}
        {villa.features && villa.features.length > 0 && (
          <div className="d-flex flex-wrap mb-20" style={{ gap: '8px' }}>
            {villa.features.slice(0, 3).map((feat, fIdx) => (
              <span 
                key={fIdx} 
                className="px-12 py-5 rounded-200 bg-light-2 text-11 font-bold text-dark-1 uppercase tracking-wider border-1 border-light-2"
              >
                {formatFeature(feat)}
              </span>
            ))}
          </div>
        )}

        {/* PRICING & ACTION FOOTER */}
        <div className="d-flex justify-between items-end border-top-light pt-20 mt-auto">
          <div>
            <div className="text-11 uppercase tracking-wider text-sec font-bold mb-2">
              {isDateSelected ? `${nightsCount} Night${nightsCount > 1 ? 's' : ''} Stay` : 'Starting from'}
            </div>
            <div className="text-24 font-serif font-bold text-dark-1">
              ₹{(isDateSelected ? totalStayPrice : villa.pricePerNight)?.toLocaleString('en-IN')}
              <span className="text-12 font-medium text-sec ml-4">
                {isDateSelected ? ' total' : '/night'}
              </span>
            </div>
          </div>

          <button
            onClick={onBookNow}
            className={`button -sm ${
              isDateSelected && !isAvailable
                ? 'bg-light-2 text-sec cursor-not-allowed border-1 border-light-2 shadow-none'
                : 'bg-accent-1 text-white hover:bg-dark-1 hover:shadow-lg'
            } rounded-200 px-22 py-12 text-12 font-bold uppercase tracking-wider transition-all duration-300`}
            disabled={isDateSelected && !isAvailable}
          >
            {isDateSelected && isAvailable ? 'RESERVE NOW' : 'EXPLORE VILLA'}
          </button>
        </div>
      </div>
    </div>
  );
};
