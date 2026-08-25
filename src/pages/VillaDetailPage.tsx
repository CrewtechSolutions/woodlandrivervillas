import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { useVillas } from '../context/VillaContext';
import { ImageModal } from '../components/common/ImageModal';
import { InstagramGrid } from '../components/sections/InstagramGrid';
import { BookingCTA } from '../components/common/BookingCTA';
import { siteConfig } from '../data/siteConfig';

export const VillaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getVillaBySlug, loading } = useVillas();
  const villa = id ? getVillaBySlug(id) : undefined;

  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [activeNavTab, setActiveNavTab] = useState<string>('overview');
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);

  if (!villa && !loading) {
    return <Navigate to="/our-villas" replace />;
  }

  if (!villa) {
    return (
      <div className="layout-pt-lg layout-pb-lg text-center bg-white text-dark-1">
        <div className="text-24 fw-500">Loading villa details...</div>
      </div>
    );
  }

  const gallery = villa.galleryImages && villa.galleryImages.length > 0
    ? villa.galleryImages
    : [villa.heroImage];

  const mainPhoto = gallery[0];
  const photo2 = gallery[1] || mainPhoto;
  const photo3 = gallery[2] || mainPhoto;
  const remainingCount = Math.max(0, gallery.length - 3);

  const priceFormatted = villa.pricePerNight
    ? `₹${villa.pricePerNight.toLocaleString('en-IN')}`
    : '₹18,000';

  const depositFormatted = villa.securityDeposit
    ? `₹${villa.securityDeposit.toLocaleString('en-IN')}`
    : '₹10,000';

  const handlePrevPhoto = () => {
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((prev) => (prev === null || prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((prev) => (prev === null || prev === gallery.length - 1 ? 0 : prev + 1));
  };

  const scrollToSection = (sectionId: string) => {
    setActiveNavTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      <SEO
        title={`${villa.name} | Woodland River Villa Alibaug`}
        description={villa.description}
      />

      {/* SAFFRONSTAYS STYLE VILLA DETAILS PAGE */}
      <div className="bg-white text-dark-1 layout-pt-header pb-80">
        <div className="container">
          {/* BREADCRUMB HEADER */}
          <div className="d-flex justify-between items-center py-15 mb-20 border-bottom-light flex-wrap y-gap-10">
            <div className="d-flex items-center text-14 text-sec">
              <Link to="/" className="hover-accent">Home</Link>
              <span className="mx-8">/</span>
              <Link to="/our-villas" className="hover-accent">Villas in Alibaug</Link>
              <span className="mx-8">/</span>
              <span className="text-dark-1 fw-600">{villa.name}</span>
            </div>

            <div className="d-flex items-center x-gap-15">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="d-flex items-center text-14 text-sec hover-accent bg-light-1 px-15 py-6 rounded-200 border-1 border-light-1"
              >
                <i className={`icon-heart mr-6 ${isWishlisted ? 'text-accent-1 fill-accent-1' : ''}`}></i>
                {isWishlisted ? 'Saved to Wishlist' : 'Save Wishlist'}
              </button>
            </div>
          </div>

          {/* SAFFRONSTAYS-STYLE ARCHITECTURAL PHOTO GRID SHOWCASE */}
          <div className="relative mb-35">
            <div className="row x-gap-15 y-gap-15">
              {/* Left 66%: Main Large Hero Photo */}
              <div className="col-lg-8">
                <div
                  className="ratio ratio-16:10 rounded-20 overflow-hidden cursor-pointer hover-image-scale relative shadow-sm"
                  onClick={() => setActivePhotoIndex(0)}
                >
                  <img
                    src={mainPhoto}
                    alt={`${villa.name} Main`}
                    className="img-ratio"
                    loading="eager"
                  />
                  <div className="absolute bottom-20 right-20 bg-dark-1/80 text-white px-18 py-10 rounded-12 text-14 fw-600 backdrop-blur d-flex items-center shadow-md">
                    <i className="icon-grid text-18 mr-8 text-accent-1"></i> All Photos ({gallery.length})
                  </div>
                </div>
              </div>

              {/* Right 33%: 2 Stacked Grid Photos */}
              <div className="col-lg-4">
                <div className="row y-gap-15 h-full">
                  <div className="col-12">
                    <div
                      className="ratio ratio-16:10 rounded-20 overflow-hidden cursor-pointer hover-image-scale relative shadow-sm"
                      onClick={() => setActivePhotoIndex(1)}
                    >
                      <img
                        src={photo2}
                        alt={`${villa.name} photo 2`}
                        className="img-ratio"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <div
                      className="ratio ratio-16:10 rounded-20 overflow-hidden cursor-pointer hover-image-scale relative shadow-sm group"
                      onClick={() => setActivePhotoIndex(2)}
                    >
                      <img
                        src={photo3}
                        alt={`${villa.name} photo 3`}
                        className="img-ratio"
                        loading="lazy"
                      />
                      {remainingCount > 0 && (
                        <div className="absolute inset-0 bg-dark-1/50 flex-center text-white transition-opacity group-hover:bg-dark-1/65">
                          <div className="text-center">
                            <div className="text-28 fw-700 text-white">+{remainingCount}</div>
                            <div className="text-15 fw-500 text-white">More Photos</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SAFFRONSTAYS STICKY SUB-HEADER NAVIGATION TABS */}
          <div className="sticky-top bg-white/95 backdrop-blur z-5 py-15 border-y-light mb-50 shadow-xs" style={{ top: '70px' }}>
            <div className="d-flex x-gap-30 y-gap-10 items-center overflow-x-auto">
              <button
                onClick={() => scrollToSection('overview')}
                className={`text-15 fw-600 transition-all pb-5 ${
                  activeNavTab === 'overview'
                    ? 'text-accent-1 border-bottom-accent-2'
                    : 'text-sec hover-accent'
                }`}
              >
                Overview
              </button>

              <button
                onClick={() => scrollToSection('highlights')}
                className={`text-15 fw-600 transition-all pb-5 ${
                  activeNavTab === 'highlights'
                    ? 'text-accent-1 border-bottom-accent-2'
                    : 'text-sec hover-accent'
                }`}
              >
                Highlights
              </button>

              <button
                onClick={() => scrollToSection('meals')}
                className={`text-15 fw-600 transition-all pb-5 ${
                  activeNavTab === 'meals'
                    ? 'text-accent-1 border-bottom-accent-2'
                    : 'text-sec hover-accent'
                }`}
              >
                Meals & Dining
              </button>

              <button
                onClick={() => scrollToSection('amenities')}
                className={`text-15 fw-600 transition-all pb-5 ${
                  activeNavTab === 'amenities'
                    ? 'text-accent-1 border-bottom-accent-2'
                    : 'text-sec hover-accent'
                }`}
              >
                Amenities
              </button>

              <button
                onClick={() => scrollToSection('location')}
                className={`text-15 fw-600 transition-all pb-5 ${
                  activeNavTab === 'location'
                    ? 'text-accent-1 border-bottom-accent-2'
                    : 'text-sec hover-accent'
                }`}
              >
                Location & Reach
              </button>

              <button
                onClick={() => scrollToSection('policies')}
                className={`text-15 fw-600 transition-all pb-5 ${
                  activeNavTab === 'policies'
                    ? 'text-accent-1 border-bottom-accent-2'
                    : 'text-sec hover-accent'
                }`}
              >
                Stay Guidelines
              </button>
            </div>
          </div>

          {/* MAIN 2-COLUMN LAYOUT */}
          <div className="row y-gap-50 justify-between items-start">
            {/* LEFT COLUMN: VILLA DETAILS & CONTENT */}
            <div className="col-lg-7">
              {/* VILLA TITLE & LOCATION BADGE */}
              <div id="overview" className="mb-40">
                <div className="d-flex items-center x-gap-10 mb-10 flex-wrap">
                  <span className="bg-light-1 text-accent-1 text-13 fw-600 px-14 py-4 rounded-200 border-1 border-light-1">
                    VILLA IN ALIBAUG
                  </span>
                  <span className="text-14 text-sec">
                    • 20 mins from Mandwa Jetty
                  </span>
                </div>

                <h1 className="text-40 md:text-30 fw-700 text-dark-1 mb-15">
                  {villa.name}
                </h1>
                <p className="text-18 text-sec fw-500">
                  {villa.subtitle}
                </p>
              </div>

              {/* SAFFRONSTAYS QUICK HIGHLIGHTS PILL ROW */}
              <div id="highlights" className="mb-50 p-25 bg-light-1 rounded-20 border-1 border-light-1">
                <div className="row y-gap-20">
                  <div className="col-sm-4 col-6">
                    <div className="d-flex items-center">
                      <div className="size-40 rounded-full bg-white text-accent-1 flex-center mr-12 shadow-xs border-1 border-light-1 flex-shrink-0">
                        <i className="icon-bed text-18"></i>
                      </div>
                      <div>
                        <div className="text-12 uppercase text-sec opacity-70">BEDROOMS</div>
                        <div className="text-16 fw-700 text-dark-1">{villa.bedrooms.replace(' BEDROOMS', '').replace(' BEDROOM W/ PRIVATE POOL', ' 1 Studio')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4 col-6">
                    <div className="d-flex items-center">
                      <div className="size-40 rounded-full bg-white text-accent-1 flex-center mr-12 shadow-xs border-1 border-light-1 flex-shrink-0">
                        <i className="icon-bath text-18"></i>
                      </div>
                      <div>
                        <div className="text-12 uppercase text-sec opacity-70">BATHROOMS</div>
                        <div className="text-16 fw-700 text-dark-1">{villa.bathrooms.replace(' BATHROOMS', '').replace(' BATHROOM', ' 1 Bath')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4 col-6">
                    <div className="d-flex items-center">
                      <div className="size-40 rounded-full bg-white text-accent-1 flex-center mr-12 shadow-xs border-1 border-light-1 flex-shrink-0">
                        <i className="icon-guest text-18"></i>
                      </div>
                      <div>
                        <div className="text-12 uppercase text-sec opacity-70">MAX GUESTS</div>
                        <div className="text-16 fw-700 text-dark-1">{villa.guests.replace(' GUESTS & MORE', ' Guests')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4 col-6">
                    <div className="d-flex items-center">
                      <div className="size-40 rounded-full bg-white text-accent-1 flex-center mr-12 shadow-xs border-1 border-light-1 flex-shrink-0">
                        <i className="icon-pool text-18"></i>
                      </div>
                      <div>
                        <div className="text-12 uppercase text-sec opacity-70">SWIMMING POOL</div>
                        <div className="text-16 fw-700 text-dark-1">Private Pool</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4 col-6">
                    <div className="d-flex items-center">
                      <div className="size-40 rounded-full bg-white text-accent-1 flex-center mr-12 shadow-xs border-1 border-light-1 flex-shrink-0">
                        <i className="icon-leaf text-18"></i>
                      </div>
                      <div>
                        <div className="text-12 uppercase text-sec opacity-70">OUTDOORS</div>
                        <div className="text-16 fw-700 text-dark-1">Private Lawn</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-4 col-6">
                    <div className="d-flex items-center">
                      <div className="size-40 rounded-full bg-white text-accent-1 flex-center mr-12 shadow-xs border-1 border-light-1 flex-shrink-0">
                        <i className="icon-dog text-18"></i>
                      </div>
                      <div>
                        <div className="text-12 uppercase text-sec opacity-70">PET POLICY</div>
                        <div className="text-16 fw-700 text-dark-1">Pet Friendly</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ABOUT THE HOME */}
              <div className="mb-50 pb-40 border-bottom-light">
                <h2 className="text-30 fw-600 text-dark-1 mb-20">About the Home</h2>
                <div className="lh-18 text-17 text-sec space-y-20">
                  <p>{villa.description}</p>
                  <p>
                    Surrounded by natural greenery and quiet riverfront views, {villa.name} offers a private group getaway just 20 minutes from Mandwa Jetty in Alibaug. With private pool access, spacious open living rooms, and manicured lawns, it is built for celebrations, family reunions, and peaceful weekends.
                  </p>
                </div>
              </div>

              {/* MEALS & DINING SECTION */}
              <div id="meals" className="mb-50 pb-40 border-bottom-light">
                <h3 className="text-28 fw-600 text-dark-1 mb-20">Meals & Dining Experience</h3>
                <div className="p-30 bg-light-1 rounded-20 border-1 border-light-1 mb-20">
                  <div className="d-flex items-center mb-15">
                    <div className="size-40 rounded-full bg-white text-accent-1 flex-center mr-15 shadow-xs">
                      <i className="icon-coffee text-20"></i>
                    </div>
                    <div>
                      <div className="text-18 fw-700 text-dark-1">Authentic Home-Fresh Meals</div>
                      <div className="text-14 text-sec">Freshly prepared regional Veg & Non-Veg delicacies by on-site caretakers</div>
                    </div>
                  </div>
                  <ul className="space-y-10 text-15 text-sec pl-10">
                    <li className="d-flex items-center"><i className="icon-check text-14 text-accent-1 mr-10"></i> Standard menu crafted with fresh local ingredients.</li>
                    <li className="d-flex items-center"><i className="icon-check text-14 text-accent-1 mr-10"></i> Filtered drinking water & tea/coffee served daily.</li>
                    <li className="d-flex items-center"><i className="icon-check text-14 text-accent-1 mr-10"></i> Outside food allowed (caretaker can assist with menus of nearby restaurants).</li>
                  </ul>
                </div>
              </div>

              {/* AMENITIES SECTION */}
              <div id="amenities" className="mb-50 pb-40 border-bottom-light">
                <h3 className="text-28 fw-600 text-dark-1 mb-25">Amenities & Inclusions</h3>
                <div className="row y-gap-15">
                  {villa.features.map((feat, idx) => (
                    <div key={idx} className="col-md-6">
                      <div className="p-16 bg-light-1 rounded-16 border-1 border-light-1 d-flex items-center">
                        <div className="size-36 rounded-full bg-white text-accent-1 flex-center mr-12 shadow-xs border-1 border-light-1 flex-shrink-0">
                          <i className="icon-check text-14"></i>
                        </div>
                        <span className="text-16 text-dark-1 fw-600">{feat}</span>
                      </div>
                    </div>
                  ))}

                  <div className="col-md-6">
                    <div className="p-16 bg-light-1 rounded-16 border-1 border-light-1 d-flex items-center">
                      <div className="size-36 rounded-full bg-white text-accent-1 flex-center mr-12 shadow-xs border-1 border-light-1 flex-shrink-0">
                        <i className="icon-check text-14"></i>
                      </div>
                      <span className="text-16 text-dark-1 fw-600">24/7 Gated Security & Caretaker</span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-16 bg-light-1 rounded-16 border-1 border-light-1 d-flex items-center">
                      <div className="size-36 rounded-full bg-white text-accent-1 flex-center mr-12 shadow-xs border-1 border-light-1 flex-shrink-0">
                        <i className="icon-check text-14"></i>
                      </div>
                      <span className="text-16 text-dark-1 fw-600">Free On-Site Car Parking</span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-16 bg-light-1 rounded-16 border-1 border-light-1 d-flex items-center">
                      <div className="size-36 rounded-full bg-white text-accent-1 flex-center mr-12 shadow-xs border-1 border-light-1 flex-shrink-0">
                        <i className="icon-check text-14"></i>
                      </div>
                      <span className="text-16 text-dark-1 fw-600">Power Backup Inverter Setup</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LOCATION & HOW TO REACH */}
              <div id="location" className="mb-50 pb-40 border-bottom-light">
                <h3 className="text-28 fw-600 text-dark-1 mb-20">Location & How to Reach</h3>
                <div className="p-30 bg-light-1 rounded-20 border-1 border-light-1 space-y-15">
                  <div className="d-flex items-start">
                    <i className="icon-pin text-20 text-accent-1 mr-12 mt-4"></i>
                    <div>
                      <div className="fw-700 text-dark-1 text-16">Zirad Pada, Zirad, Alibaug - 402201</div>
                      <div className="text-14 text-sec">Just a short 20-minute drive from Mandwa Jetty ferry terminal.</div>
                    </div>
                  </div>
                  <div className="text-15 text-sec pt-10 border-top-light">
                    • <strong>From Mandwa Jetty:</strong> Speedboat from Gateway of India or RoRo Ferry from Bhau Cha Dhakka to Mandwa Jetty (20 mins drive to villa).<br />
                    • <strong>From Mumbai:</strong> Direct drive via Mumbai-Goa Highway (~3 hours).
                  </div>
                </div>
              </div>

              {/* STAY GUIDELINES & POLICIES */}
              <div id="policies" className="mb-50">
                <h3 className="text-28 fw-600 text-dark-1 mb-25">Stay Guidelines & Policies</h3>
                <div className="bg-light-1 rounded-20 p-30 border-1 border-light-1">
                  <div className="row y-gap-25">
                    <div className="col-md-6">
                      <div className="fw-700 text-dark-1 text-16 mb-5">Check-In & Check-Out</div>
                      <div className="text-15 text-sec lh-16">Check-In: 2:00 PM onwards<br />Check-Out: 11:00 AM sharp</div>
                    </div>
                    <div className="col-md-6">
                      <div className="fw-700 text-dark-1 text-16 mb-5">Government ID Formalities</div>
                      <div className="text-15 text-sec lh-16">Valid Government Photo ID required for all adult guests upon check-in.</div>
                    </div>
                    <div className="col-md-6">
                      <div className="fw-700 text-dark-1 text-16 mb-5">Pool & Safety Rules</div>
                      <div className="text-15 text-sec lh-16">Pool access is open 24/7. Proper swimwear is requested. No glass bottles near pool.</div>
                    </div>
                    <div className="col-md-6">
                      <div className="fw-700 text-dark-1 text-16 mb-5">Noise & Music Policy</div>
                      <div className="text-15 text-sec lh-16">Outdoor loud music allowed until 10:00 PM per local norms.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: SAFFRONSTAYS STICKY FLOATING BOOKING CARD */}
            <div className="col-lg-5">
              <div className="bg-white border-1 border-light-1 rounded-24 shadow-xl p-35 sticky-top" style={{ top: '130px' }}>
                {/* PRICE BANNER */}
                <div className="d-flex justify-between items-end mb-25 pb-20 border-bottom-light">
                  <div>
                    <span className="text-40 fw-700 text-dark-1">{priceFormatted}</span>
                    <span className="text-15 text-sec ml-6">/ night + taxes</span>
                  </div>
                  <div className="text-13 text-accent-1 bg-light-1 px-14 py-6 rounded-200 fw-600 border-1 border-light-1">
                    Direct Best Rate
                  </div>
                </div>

                {/* INCLUSIONS & BREAKDOWN */}
                <div className="space-y-16 mb-30">
                  <div className="d-flex justify-between text-15 text-sec">
                    <span>Refundable Security Deposit</span>
                    <span className="fw-700 text-dark-1">{depositFormatted}</span>
                  </div>
                  <div className="d-flex justify-between text-15 text-sec">
                    <span>Cleaning & Maintenance</span>
                    <span className="fw-700 text-accent-1">Included</span>
                  </div>
                  <div className="d-flex justify-between text-15 text-sec">
                    <span>In-Villa Housekeeping</span>
                    <span className="fw-700 text-dark-1">Daily</span>
                  </div>
                </div>

                {/* PRIMARY SAFFRONSTAYS GOLD BOOKING BUTTON */}
                <a
                  href={villa.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button d-flex -md bg-accent-1 text-white rounded-16 w-1/1 justify-center py-18 text-16 fw-700 shadow-md mb-15 hover-accent-dark transition-all"
                >
                  UNLOCK OFFER / BOOK NOW
                </a>

                {/* WHATSAPP INSTANT INQUIRY BUTTON */}
                <a
                  href={`https://wa.me/${siteConfig.phoneNumbers[0].replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20am%20interested%20in%20booking%20${encodeURIComponent(villa.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button d-flex -md bg-emerald-50 text-emerald-800 border-1 border-emerald-200 rounded-16 w-1/1 justify-center py-14 text-15 fw-600 mb-12 hover:bg-emerald-100 transition-all"
                >
                  <i className="icon-chat text-18 mr-8"></i> WhatsApp Concierge Inquiry
                </a>

                <a
                  href={`tel:${siteConfig.phoneNumbers[0].replace(/\s+/g, '')}`}
                  className="d-flex justify-center items-center text-14 text-sec hover-accent transition-all pt-8"
                >
                  <i className="icon-phone text-16 mr-6 text-accent-1"></i> Call SaffronStays Concierge: {siteConfig.phoneNumbers[0]}
                </a>
              </div>
            </div>
          </div>

          {/* FULL PHOTO GALLERY LIGHTBOX GRID SECTION */}
          <div id="gallery" className="my-80 pt-40 border-top-light">
            <div className="d-flex justify-between items-end mb-35 flex-wrap y-gap-15">
              <div>
                <div className="text-15 uppercase text-accent-1 fw-600 mb-8">FULL PHOTO GALLERY</div>
                <h3 className="text-32 md:text-26 fw-600 text-dark-1">Explore {villa.name} ({gallery.length} Photos)</h3>
              </div>
              <button
                onClick={() => setActivePhotoIndex(0)}
                className="button -sm bg-light-1 hover:bg-white text-accent-1 rounded-200 px-25 py-12 border-1 border-light-1 fw-600 shadow-xs transition-all"
              >
                <i className="icon-grid text-16 mr-8"></i> Launch Lightbox Slideshow
              </button>
            </div>

            <div className="row x-gap-15 y-gap-15">
              {gallery.map((img, idx) => (
                <div key={idx} className="col-lg-3 col-md-4 col-sm-6">
                  <div
                    className="ratio ratio-4:3 rounded-16 overflow-hidden cursor-pointer hover-image-scale shadow-sm relative group"
                    onClick={() => setActivePhotoIndex(idx)}
                  >
                    <img
                      src={img}
                      alt={`${villa.name} photo ${idx + 1}`}
                      className="img-ratio"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-dark-1/30 opacity-0 group-hover:opacity-100 transition-opacity flex-center">
                      <div className="size-45 rounded-full bg-white/90 text-dark-1 flex-center shadow-md">
                        <i className="icon-search text-18"></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <InstagramGrid />
      <BookingCTA />

      {/* FULLSCREEN LIGHTBOX MODAL WITH NEXT/PREV CONTROLS */}
      <ImageModal
        isOpen={activePhotoIndex !== null}
        imageSrc={activePhotoIndex !== null ? gallery[activePhotoIndex] : ''}
        imageAlt={`${villa.name} Photo`}
        images={gallery}
        currentIndex={activePhotoIndex !== null ? activePhotoIndex : 0}
        onClose={() => setActivePhotoIndex(null)}
        onPrev={handlePrevPhoto}
        onNext={handleNextPhoto}
      />
    </>
  );
};
