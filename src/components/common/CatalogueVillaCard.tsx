import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Villa } from '../../types';
import { LazyImage } from './LazyImage';

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
        boxShadow: '0 12px 35px rgba(15, 23, 42, 0.08)'
      }}
    >
      {/* 1. FULL WIDTH IMAGE SECTION */}
      <div className="relative overflow-hidden bg-light-1" style={{ height: '240px', width: '100%' }}>
        <Link to={`/our-villas/${villa.slug}`} className="w-1/1 h-1/1 d-block relative overflow-hidden" style={{ width: '100%', height: '100%', display: 'block' }}>
          <LazyImage
            src={currentDisplayImage}
            alt={villa.name}
            className="w-1/1 h-1/1 object-cover transition-all duration-700 group-hover:scale-105"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </Link>

        {/* FLOATING AVAILABILITY BADGE ABOVE IMAGE */}
        <div 
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 2,
            padding: '6px 14px',
            borderRadius: '200px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            backgroundColor: isAvailable ? 'rgba(5, 150, 105, 0.95)' : 'rgba(225, 29, 72, 0.95)',
            border: isAvailable ? '1px solid rgba(110, 231, 183, 0.5)' : '1px solid rgba(253, 164, 175, 0.5)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {checkingAvailability ? (
            <span>CHECKING...</span>
          ) : isAvailable ? (
            <>
              <span 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#6EE7B7',
                  marginRight: '6px',
                  display: 'inline-block'
                }}
              ></span> 
              AVAILABLE
            </>
          ) : (
            <>
              <span 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#FECDD3',
                  marginRight: '6px',
                  display: 'inline-block'
                }}
              ></span> 
              BOOKED
            </>
          )}
        </div>

        {/* PHOTO PREVIEW DOTS */}
        {photos.length > 1 && (
          <div className="absolute bottom-12 left-16 z-3 d-flex items-center p-4 rounded-200 bg-dark-1/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ gap: '6px' }}>
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

      {/* CARD BODY CONTENT WITH EXPLICIT LUXURY PADDING */}
      <div className="flex-grow-1 d-flex flex-column bg-white" style={{ padding: '28px 30px' }}>
        
        {/* 2. CARD HEADER (NAME) */}
        <div style={{ marginBottom: '16px' }}>
          <h3 className="text-22 font-serif font-bold text-dark-1 leading-snug">
            <Link to={`/our-villas/${villa.slug}`} className="hover:text-accent-1 transition-colors">
              {villa.name}
            </Link>
          </h3>
        </div>

        {/* 3. ATTRIBUTES & AMENITIES SECTION (SVG ICONS & FONTS) */}
        <div 
          className="bg-light-1/90 border-1 border-light-2"
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            marginBottom: '18px'
          }}
        >
          <div className="row y-gap-12 x-gap-12">
            <div className="col-6 d-flex items-center text-13 text-dark-1 font-semibold">
              <div className="size-30 rounded-8 bg-white flex-center mr-10 text-accent-1 shadow-sm border-1 border-light-2">
                <i className="icon-bed text-14"></i>
              </div>
              {bedroomsText}
            </div>

            <div className="col-6 d-flex items-center text-13 text-dark-1 font-semibold">
              <div className="size-30 rounded-8 bg-white flex-center mr-10 text-accent-1 shadow-sm border-1 border-light-2">
                <i className="icon-bath text-14"></i>
              </div>
              {bathroomsText}
            </div>

            <div className="col-6 d-flex items-center text-13 text-dark-1 font-semibold">
              <div className="size-30 rounded-8 bg-white flex-center mr-10 text-accent-1 shadow-sm border-1 border-light-2">
                <i className="icon-guest text-14"></i>
              </div>
              {guestsText}
            </div>

            <div className="col-6 d-flex items-center text-13 text-dark-1 font-semibold">
              <div className="size-30 rounded-8 bg-white flex-center mr-10 text-amber-500 shadow-sm border-1 border-light-2">
                <i className="icon-star text-14"></i>
              </div>
              Private Pool
            </div>
          </div>
        </div>

        {/* 4. SECONDARY TEXT (DESCRIPTION) */}
        <p className="text-14 text-sec line-clamp-2 leading-relaxed flex-grow-1" style={{ marginBottom: '18px' }}>
          {villa.description}
        </p>

        {/* FORMATTED FEATURE CHIPS WITH EXPLICIT PADDING & SPACING */}
        {villa.features && villa.features.length > 0 && (
          <div className="d-flex flex-wrap" style={{ gap: '10px 12px', marginBottom: '22px' }}>
            {villa.features.slice(0, 4).map((feat, fIdx) => (
              <span 
                key={fIdx} 
                className="bg-light-1 text-dark-1 uppercase border-1 border-light-2"
                style={{
                  padding: '6px 16px',
                  borderRadius: '200px',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#F8FAFC'
                }}
              >
                {formatFeature(feat)}
              </span>
            ))}
          </div>
        )}

        {/* 5. FOOTER (RATES AND TEMPLATE ACTION BUTTONS) */}
        <div 
          className="d-flex justify-between items-center mt-auto"
          style={{
            paddingTop: '20px',
            borderTop: '1px solid #F1F5F9'
          }}
        >
          <div>
            <div className="text-11 uppercase tracking-wider text-sec font-bold mb-2">
              Nightly Rate
            </div>
            <div className="text-22 font-serif font-bold text-dark-1">
              ₹{villa.pricePerNight?.toLocaleString('en-IN')}
              <span className="text-12 font-normal text-sec ml-4">/night</span>
            </div>
            {isDateSelected && (
              <div className="text-12 font-bold text-accent-1 mt-2">
                Total: ₹{totalStayPrice.toLocaleString('en-IN')} ({nightsCount} {nightsCount === 1 ? 'night' : 'nights'})
              </div>
            )}
          </div>

          <div>
            <button
              onClick={onBookNow}
              className={`button -sm ${
                isDateSelected && !isAvailable
                  ? 'bg-light-2 text-sec cursor-not-allowed border-1 border-light-2 shadow-none'
                  : 'bg-accent-1 text-white hover:bg-dark-1 hover:shadow-xl'
              } rounded-200 transition-all duration-300 d-flex items-center justify-center`}
              style={{
                height: '46px',
                padding: '0 26px',
                borderRadius: '200px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                boxShadow: isAvailable ? '0 8px 20px -4px rgba(0, 77, 67, 0.35)' : 'none'
              }}
              disabled={isDateSelected && !isAvailable}
            >
              <span>{isDateSelected && isAvailable ? 'Reserve Villa' : 'Book Stay'}</span>
              <i className="icon-arrow-top-right text-12 ml-8 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
