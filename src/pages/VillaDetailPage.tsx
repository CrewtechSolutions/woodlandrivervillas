import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { useVillas } from '../context/VillaContext';
import { ImageModal } from '../components/common/ImageModal';
import { InstagramGrid } from '../components/sections/InstagramGrid';
import { BookingCTA } from '../components/common/BookingCTA';
import { siteConfig } from '../data/siteConfig';
import { coreApiService } from '../services/apiService';

export const VillaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getVillaBySlug, loading } = useVillas();
  const villa = id ? getVillaBySlug(id) : undefined;

  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [activeNavTab, setActiveNavTab] = useState<string>('overview');
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 1);
  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 2);

  const [startDate, setStartDate] = useState<string>(defaultStart.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(defaultEnd.toISOString().split('T')[0]);
  const [guests, setGuests] = useState<number>(villa?.maxGuests || 12);
  
  useEffect(() => {
    if (villa?.maxGuests) {
      setGuests(villa.maxGuests);
    }
  }, [villa?.id, villa?.maxGuests]);

  useEffect(() => {
    if (!villa) return;
    const initDates = async () => {
      try {
        const occupied = await coreApiService.getOccupiedDates(villa.offeringId || villa.id);
        if (!occupied || occupied.length === 0) return; // Default tomorrow is fine!
        
        let attemptDate = new Date();
        attemptDate.setDate(attemptDate.getDate() + 1); // Start from tomorrow
        
        for (let i = 0; i < 365; i++) {
            const attemptStartStr = attemptDate.toISOString().split('T')[0];
            const checkDate = new Date(attemptStartStr);
            checkDate.setHours(14, 0, 0, 0); // Check-in time
            
            const attemptEnd = new Date(attemptDate);
            attemptEnd.setDate(attemptEnd.getDate() + 1);
            const attemptEndStr = attemptEnd.toISOString().split('T')[0];
            const checkoutDate = new Date(attemptEndStr);
            checkoutDate.setHours(11, 0, 0, 0); // Check-out time
            
            let hasOverlap = false;
            for (const block of occupied) {
                const bStart = new Date(block.start);
                const bEnd = new Date(block.end);
                if (checkDate < bEnd && checkoutDate > bStart) {
                    hasOverlap = true;
                    break;
                }
            }
            
            if (!hasOverlap) {
                setStartDate(attemptStartStr);
                setEndDate(attemptEndStr);
                break;
            }
            
            attemptDate.setDate(attemptDate.getDate() + 1);
        }
      } catch (err) {
        console.warn("Failed to fetch occupied dates for auto-selection", err);
      }
    };
    initDates();
  }, [villa?.id, villa?.offeringId]);
  const [selectedAddons, setSelectedAddons] = useState<{ id: string; quantity: number }[]>([]);
  const [pricing, setPricing] = useState<any>(null);
  const [isPricingCalculating, setIsPricingCalculating] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!startDate || !endDate || !villa) {
      setPricing(null);
      setIsAvailable(true);
      return;
    }
    const fetchPricingAndAvailability = async () => {
      setIsPricingCalculating(true);
      try {
        const checkInTimeStr = villa.checkInTime || '14:00';
        const checkOutTimeStr = villa.checkOutTime || '11:00';
        const startDateTime = new Date(`${startDate}T${checkInTimeStr}:00.000Z`);
        const endDateTime = new Date(`${endDate}T${checkOutTimeStr}:00.000Z`);

        // Run both calculate pricing and availability check in parallel
        const [pricingResult, availabilityResult] = await Promise.all([
          coreApiService.calculatePricing({
            offeringId: villa.offeringId || villa.id,
            startDate: startDateTime,
            endDate: endDateTime,
            selectedAddons
          }).catch((err) => {
            console.error("Pricing error:", err);
            return null;
          }),
          coreApiService.checkAvailability({
            offeringId: villa.offeringId || villa.id,
            startDate: startDateTime,
            endDate: endDateTime
          }).catch((err) => {
            console.error("Availability error:", err);
            return { available: true }; // Default to true if err
          })
        ]);

        setPricing(pricingResult);
        
        const avail: any = availabilityResult;
        if (avail && avail.data && !avail.data.available) {
          setIsAvailable(false);
          setAvailabilityMessage(avail.data.message || 'Selected dates are not available.');
        } else if (avail && typeof avail.available === 'boolean' && !avail.available) {
          setIsAvailable(false);
          setAvailabilityMessage(avail.message || 'Selected dates are not available.');
        } else {
          setIsAvailable(true);
          setAvailabilityMessage('');
        }
      } finally {
        setIsPricingCalculating(false);
      }
    };
    const timer = setTimeout(() => {
      fetchPricingAndAvailability();
    }, 300);
    return () => clearTimeout(timer);
  }, [startDate, endDate, selectedAddons, villa]);

  if (!villa && !loading) {
    return <Navigate to="/our-villas" replace />;
  }

  if (!villa) {
    return (
      <div className="layout-pt-lg layout-pb-lg text-center bg-white text-dark-1">
        <div className="size-50 rounded-full border-4 border-accent-1 border-t-transparent animate-spin mx-auto mb-20"></div>
        <div className="text-24 fw-600 font-serif">Loading luxury estate...</div>
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

  const handleAddonChange = (addonId: string, quantity: number) => {
    setSelectedAddons(prev => {
      const existing = prev.find(a => a.id === addonId);
      if (quantity <= 0) return prev.filter(a => a.id !== addonId);
      if (existing) return prev.map(a => a.id === addonId ? { ...a, quantity } : a);
      return [...prev, { id: addonId, quantity }];
    });
  };

  const handleBookNow = () => {
    if (!startDate || !endDate) {
      alert('Please select both Check-In and Check-Out dates.');
      return;
    }
    navigate(`/checkout/${villa.id}`, { state: { startDate, endDate, guests, villa, selectedAddons } });
  };

  return (
    <>
      <SEO
        title={`${villa.name} | Woodland River Villa Alibaug`}
        description={villa.description}
      />

      {/* VIP LUXURY VILLA DETAILS PAGE */}
      <div className="bg-light-1 text-dark-1 layout-pt-header pb-80">
        <div className="container">
          
          {/* BREADCRUMB HEADER */}
          <div className="d-flex justify-between items-center py-20 mb-25 flex-wrap y-gap-10">
            <div className="d-flex items-center text-13 text-sec fw-500 uppercase tracking-wider">
              <Link to="/" className="hover-accent transition-colors">Home</Link>
              <span className="mx-12 opacity-50">/</span>
              <Link to="/our-villas" className="hover-accent transition-colors">Villas in Alibaug</Link>
              <span className="mx-12 opacity-50">/</span>
              <span className="text-dark-1 fw-700">{villa.name}</span>
            </div>

            <div className="d-flex items-center x-gap-15">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="d-flex items-center text-13 fw-600 uppercase tracking-wider text-sec hover:text-accent-1 bg-white px-20 py-10 rounded-200 border-1 border-light-2 shadow-sm transition-all hover:shadow-md"
              >
                <i className={`icon-heart mr-8 text-16 ${isWishlisted ? 'text-accent-1 fill-accent-1' : ''}`}></i>
                {isWishlisted ? 'SAVED' : 'SAVE TO WISHLIST'}
              </button>
            </div>
          </div>

          {/* LUXURY ARCHITECTURAL PHOTO GRID SHOWCASE */}
          <div className="relative mb-40">
            <div className="row x-gap-10 y-gap-10">
              {/* Left 66%: Main Large Hero Photo */}
              <div className="col-lg-8">
                <div
                  className="ratio ratio-16:10 rounded-16 overflow-hidden cursor-pointer hover-image-scale relative shadow-md group border-1 border-white"
                  onClick={() => setActivePhotoIndex(0)}
                >
                  <img
                    src={mainPhoto}
                    alt={`${villa.name} Main`}
                    className="img-ratio transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-dark-1/10 group-hover:bg-transparent transition-colors"></div>
                  
                  <div className="absolute bottom-20 right-20 bg-white/95 text-dark-1 px-20 py-12 rounded-200 text-13 fw-700 tracking-wider uppercase shadow-lg border-1 border-white/50 backdrop-blur-md d-flex items-center hover:bg-dark-1 hover:text-white transition-all">
                    <i className="icon-grid text-16 mr-8 text-accent-1"></i> VIEW {gallery.length} PHOTOS
                  </div>
                </div>
              </div>

              {/* Right 33%: 2 Stacked Grid Photos */}
              <div className="col-lg-4">
                <div className="row y-gap-10 h-full">
                  <div className="col-12 h-1/2">
                    <div
                      className="ratio ratio-16:10 h-full rounded-16 overflow-hidden cursor-pointer hover-image-scale relative shadow-sm group border-1 border-white"
                      onClick={() => setActivePhotoIndex(1)}
                    >
                      <img
                        src={photo2}
                        alt={`${villa.name} photo 2`}
                        className="img-ratio transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-dark-1/10 group-hover:bg-transparent transition-colors"></div>
                    </div>
                  </div>

                  <div className="col-12 h-1/2">
                    <div
                      className="ratio ratio-16:10 h-full rounded-16 overflow-hidden cursor-pointer hover-image-scale relative shadow-sm group border-1 border-white"
                      onClick={() => setActivePhotoIndex(2)}
                    >
                      <img
                        src={photo3}
                        alt={`${villa.name} photo 3`}
                        className="img-ratio transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-dark-1/20 group-hover:bg-dark-1/40 transition-colors"></div>
                      
                      {remainingCount > 0 && (
                        <div className="absolute inset-0 flex-center text-white backdrop-blur-[2px]">
                          <div className="text-center transform transition-transform group-hover:scale-110">
                            <div className="text-32 font-serif fw-700 text-white mb-4">+{remainingCount}</div>
                            <div className="text-12 uppercase tracking-wider fw-700 text-white/90">MORE PHOTOS</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STICKY SUB-HEADER NAVIGATION TABS */}
          <div className="sticky-top bg-light-1/95 backdrop-blur-md z-5 py-20 border-bottom-light mb-40 shadow-xs" style={{ top: '70px' }}>
            <div className="d-flex x-gap-40 y-gap-10 items-center overflow-x-auto no-scrollbar">
              {['overview', 'highlights', 'meals', 'amenities', 'location', 'policies'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => scrollToSection(tab)}
                  className={`text-13 uppercase tracking-wider fw-700 transition-all pb-8 whitespace-nowrap ${
                    activeNavTab === tab
                      ? 'text-accent-1 border-bottom-accent-2'
                      : 'text-sec hover:text-dark-1'
                  }`}
                >
                  {tab === 'policies' ? 'STAY GUIDELINES' : tab.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN 2-COLUMN LAYOUT */}
          <div className="row y-gap-50 justify-between items-start">
            
            {/* LEFT COLUMN: VILLA DETAILS & CONTENT */}
            <div className="col-lg-7 pr-xl-50">
              
              {/* VILLA TITLE & OVERVIEW */}
              <div id="overview" className="mb-50 bg-white p-40 rounded-24 shadow-sm border-1 border-light-2">
                <div className="d-flex items-center x-gap-10 mb-20 flex-wrap">
                  <span className="bg-dark-1 text-accent-1 text-11 uppercase tracking-wider fw-700 px-14 py-6 rounded-200">
                    VIP LUXURY ESTATE
                  </span>
                  <span className="text-13 fw-600 text-sec uppercase tracking-wider d-flex items-center">
                    <i className="icon-location mr-5 text-accent-1"></i> ALIBAUG, MAHARASHTRA
                  </span>
                </div>

                <h1 className="text-45 md:text-35 font-serif fw-700 text-dark-1 mb-20 leading-tight">
                  {villa.name}
                </h1>
                <p className="text-18 text-sec fw-500 leading-relaxed mb-30">
                  {villa.subtitle}
                </p>
                
                <div className="border-top-light pt-30 lh-18 text-16 text-sec space-y-20">
                  <p>{villa.description}</p>
                  <p>
                    Surrounded by natural greenery and quiet riverfront views, {villa.name} offers a private group getaway just 20 minutes from Mandwa Jetty in Alibaug. With private pool access, spacious open living rooms, and manicured lawns, it is built for celebrations, family reunions, and peaceful weekends.
                  </p>
                </div>
              </div>

              {/* QUICK HIGHLIGHTS GRID */}
              <div id="highlights" className="mb-50 bg-white p-40 rounded-24 shadow-sm border-1 border-light-2">
                <h2 className="text-24 font-serif fw-700 text-dark-1 mb-30">Estate Highlights</h2>
                <div className="row y-gap-30">
                  {[
                    { icon: 'icon-bed', label: 'BEDROOMS', value: villa.bedrooms.replace(' BEDROOMS', '').replace(' BEDROOM W/ PRIVATE POOL', ' 1 Studio') },
                    { icon: 'icon-bath', label: 'BATHROOMS', value: villa.bathrooms.replace(' BATHROOMS', '').replace(' BATHROOM', ' 1 Bath') },
                    { icon: 'icon-guest', label: 'MAX GUESTS', value: villa.guests.replace(' GUESTS & MORE', ' Guests') },
                    { icon: 'icon-pool', label: 'POOL', value: 'Private Pool' },
                    { icon: 'icon-leaf', label: 'OUTDOORS', value: 'Private Lawn' },
                    { icon: 'icon-dog', label: 'PET POLICY', value: 'Pet Friendly' },
                  ].map((stat, i) => (
                    <div key={i} className="col-sm-4 col-6">
                      <div className="d-flex items-start">
                        <div className="size-40 rounded-full bg-light-1 flex-center mr-15 text-accent-1 shadow-inner">
                          <i className={`${stat.icon} text-18`}></i>
                        </div>
                        <div>
                          <div className="text-11 uppercase tracking-wider text-sec fw-700 mb-2">{stat.label}</div>
                          <div className="text-16 font-serif fw-700 text-dark-1">{stat.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MEALS & DINING SECTION */}
              <div id="meals" className="mb-50 bg-white p-40 rounded-24 shadow-sm border-1 border-light-2">
                <h3 className="text-28 font-serif fw-700 text-dark-1 mb-30">Meals & Dining Experience</h3>
                <div className="p-30 bg-light-1 rounded-16 border-1 border-white shadow-inner mb-20">
                  <div className="d-flex items-center mb-20">
                    <div className="size-50 rounded-full bg-white flex-center shadow-sm mr-15 text-accent-1">
                      <i className="icon-coffee text-24"></i>
                    </div>
                    <div>
                      <div className="text-18 font-serif fw-700 text-dark-1">Authentic Home-Fresh Meals</div>
                      <div className="text-14 text-sec mt-2">Freshly prepared regional delicacies by on-site caretakers</div>
                    </div>
                  </div>
                  <ul className="space-y-15 text-15 text-dark-1 pl-10 border-top-light pt-20">
                    <li className="d-flex items-start"><i className="icon-check text-14 text-emerald-600 mr-12 mt-4"></i> <span>Standard menu crafted with fresh local ingredients.</span></li>
                    <li className="d-flex items-start"><i className="icon-check text-14 text-emerald-600 mr-12 mt-4"></i> <span>Filtered drinking water & tea/coffee served daily.</span></li>
                    <li className="d-flex items-start"><i className="icon-check text-14 text-emerald-600 mr-12 mt-4"></i> <span>Outside food allowed (caretaker can assist with nearby menus).</span></li>
                  </ul>
                </div>
              </div>



              {/* AMENITIES SECTION */}
              <div id="amenities" className="mb-50 bg-white p-40 rounded-24 shadow-sm border-1 border-light-2">
                <h3 className="text-28 font-serif fw-700 text-dark-1 mb-30">Amenities & Inclusions</h3>
                <div className="row y-gap-20">
                  {[...villa.features, '24/7 Gated Security & Caretaker', 'Free On-Site Car Parking', 'Power Backup Inverter Setup'].map((feat, idx) => (
                    <div key={idx} className="col-md-6">
                      <div className="d-flex items-center py-10 border-bottom-light">
                        <i className="icon-check text-16 text-accent-1 mr-15"></i>
                        <span className="text-15 text-dark-1 fw-500">{feat}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LOCATION & HOW TO REACH */}
              <div id="location" className="mb-50 bg-white p-40 rounded-24 shadow-sm border-1 border-light-2">
                <h3 className="text-28 font-serif fw-700 text-dark-1 mb-30">Location & How to Reach</h3>
                <div className="d-flex items-start mb-20">
                  <div className="size-45 rounded-full bg-light-1 flex-center shadow-inner mr-15 text-accent-1 flex-shrink-0">
                    <i className="icon-pin text-20"></i>
                  </div>
                  <div>
                    <div className="fw-700 text-dark-1 text-16 mb-4">Zirad Pada, Zirad, Alibaug - 402201</div>
                    <div className="text-14 text-sec">Just a short 20-minute drive from Mandwa Jetty ferry terminal.</div>
                  </div>
                </div>
                <div className="text-15 text-dark-1 p-20 bg-light-1 rounded-12 space-y-10 border-1 border-white shadow-inner">
                  <div>• <strong>From Mandwa Jetty:</strong> Speedboat from Gateway of India or RoRo Ferry from Bhau Cha Dhakka to Mandwa Jetty (20 mins drive to villa).</div>
                  <div>• <strong>From Mumbai:</strong> Direct drive via Mumbai-Goa Highway (~3 hours).</div>
                </div>
              </div>

              {/* STAY GUIDELINES & POLICIES */}
              <div id="policies" className="mb-50 bg-white p-40 rounded-24 shadow-sm border-1 border-light-2">
                <h3 className="text-28 font-serif fw-700 text-dark-1 mb-30">Stay Guidelines & Policies</h3>
                <div className="row y-gap-30">
                  <div className="col-md-6">
                    <div className="fw-700 text-dark-1 text-15 mb-8 d-flex items-center"><i className="icon-time text-accent-1 mr-8"></i> Check-In & Check-Out</div>
                    <div className="text-14 text-sec lh-16 pl-24">Check-In: 2:00 PM onwards<br />Check-Out: 11:00 AM sharp</div>
                  </div>
                  <div className="col-md-6">
                    <div className="fw-700 text-dark-1 text-15 mb-8 d-flex items-center"><i className="icon-shield text-accent-1 mr-8"></i> ID Formalities</div>
                    <div className="text-14 text-sec lh-16 pl-24">Valid Government Photo ID required for all adult guests upon check-in.</div>
                  </div>
                  <div className="col-md-6">
                    <div className="fw-700 text-dark-1 text-15 mb-8 d-flex items-center"><i className="icon-pool text-accent-1 mr-8"></i> Pool & Safety Rules</div>
                    <div className="text-14 text-sec lh-16 pl-24">Pool access is open 24/7. Proper swimwear requested. No glass near pool.</div>
                  </div>
                  <div className="col-md-6">
                    <div className="fw-700 text-dark-1 text-15 mb-8 d-flex items-center"><i className="icon-music text-accent-1 mr-8"></i> Noise & Music</div>
                    <div className="text-14 text-sec lh-16 pl-24">Outdoor loud music allowed until 10:00 PM per local norms.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: PREMIUM STICKY BOOKING CARD */}
            <div className="col-lg-5">
              <div 
                className="sticky-top rounded-24 p-35 shadow-xl border-1 border-white" 
                style={{ 
                  top: '130px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.08)'
                }}
              >
                {/* PRICE BANNER */}
                <div className="mb-30 pb-25 border-bottom-light">
                  <div className="text-12 uppercase tracking-wider text-sec fw-700 mb-8">Starting from</div>
                  <div className="d-flex justify-between items-end">
                    <div>
                      {isPricingCalculating ? (
                        <div className="d-flex items-center mb-10 mt-10">
                          <div className="size-20 rounded-full border-2 border-accent-1 border-t-transparent animate-spin mr-10"></div>
                          <span className="text-14 fw-600 text-sec uppercase tracking-wider">Calculating...</span>
                        </div>
                      ) : (
                        <>
                          <span className="text-40 font-serif fw-700 text-dark-1">
                            {pricing?.details?.lineItems?.find((i: any) => i.label === 'Base Price')?.unitPrice
                              ? `₹${(pricing.details.lineItems.find((i: any) => i.label === 'Base Price').unitPrice / 100).toLocaleString('en-IN')}`
                              : priceFormatted}
                          </span>
                          <span className="text-15 text-sec ml-6 font-sans">/ night</span>
                        </>
                      )}
                    </div>
                    <div className="text-10 text-white bg-dark-1 px-12 py-6 rounded-200 fw-700 tracking-widest uppercase shadow-sm">
                      Best Rate
                    </div>
                  </div>
                </div>

                {/* INCLUSIONS & BREAKDOWN */}
                <div className="space-y-16 mb-35 p-20 bg-light-1 rounded-12 border-1 border-white shadow-inner">
                  <div className="d-flex justify-between text-14 text-dark-1 fw-500">
                    <span>Security Deposit (Refundable)</span>
                    <span className="fw-700">{depositFormatted}</span>
                  </div>
                  <div className="d-flex justify-between text-14 text-dark-1 fw-500">
                    <span>Cleaning & Maintenance</span>
                    <span className="fw-700 text-emerald-600">Included</span>
                  </div>
                  <div className="d-flex justify-between text-14 text-dark-1 fw-500">
                    <span>In-Villa Housekeeping</span>
                    <span className="fw-700">Daily</span>
                  </div>
                </div>

                <div className="space-y-20 mb-35">
                  <div className="row x-gap-10 y-gap-10">
                    <div className="col-6">
                      <label className="text-11 font-bold text-dark-1 mb-8 d-block uppercase tracking-wider">Check-In *</label>
                      <input 
                        type="date" 
                        className="form-control-luxury w-1/1 bg-white text-14"
                        value={startDate}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setStartDate(newStart);
                          if (newStart >= endDate) {
                            const nextDate = new Date(newStart);
                            nextDate.setDate(nextDate.getDate() + 1);
                            setEndDate(nextDate.toISOString().split('T')[0]);
                          }
                        }}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="col-6">
                      <label className="text-11 font-bold text-dark-1 mb-8 d-block uppercase tracking-wider">Check-Out *</label>
                      <input 
                        type="date" 
                        className="form-control-luxury w-1/1 bg-white text-14"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-11 font-bold text-dark-1 mb-8 d-block uppercase tracking-wider">Guests</label>
                    <select 
                      className="form-control-luxury w-1/1 bg-white text-14 appearance-none"
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                    >
                      {[...Array(villa.maxGuests || 12)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1} Guest{i > 0 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* OPTIONAL ADD-ONS (COMPACT) */}
                  {villa.addons && villa.addons.length > 0 && (
                    <div className="mt-20 pt-20 border-top-light">
                      <label className="text-11 font-bold text-dark-1 mb-12 d-block uppercase tracking-wider">Optional Add-ons</label>
                      <div className="space-y-12">
                        {villa.addons.map((addon, idx) => {
                          const selected = selectedAddons.find(a => a.id === addon.id);
                          const quantity = selected ? selected.quantity : 0;
                          return (
                            <div key={idx} className="d-flex justify-between items-center bg-light-1 p-12 rounded-12 border-1 border-white shadow-inner">
                              <div>
                                <div className="text-13 fw-600 text-dark-1 mb-2">{addon.name}</div>
                                <div className="text-11 fw-700 text-accent-1">
                                  ₹{(addon.priceCents / 100).toLocaleString('en-IN')} {addon.priceType === 'PER_DURATION' ? '/ day' : (addon.priceType === 'PER_UNIT' ? '/ unit' : '')}
                                </div>
                              </div>
                              <div className="d-flex items-center">
                                {addon.multiSelect ? (
                                  <div className="d-flex items-center border-1 border-light-2 rounded-100 overflow-hidden bg-white shadow-sm">
                                    <button 
                                      className={`px-10 py-5 bg-white text-14 fw-600 transition-colors ${quantity <= 0 ? 'text-light-4 cursor-not-allowed' : 'hover:bg-light-2 text-dark-1'}`}
                                      onClick={() => handleAddonChange(addon.id, Math.max(0, quantity - 1))}
                                      disabled={quantity <= 0}
                                    >
                                      -
                                    </button>
                                    <div className="px-10 text-13 fw-700 bg-white">{quantity}</div>
                                    <button 
                                      className={`px-10 py-5 bg-white text-14 fw-600 transition-colors ${addon.maxQuantity && quantity >= addon.maxQuantity ? 'text-light-4 cursor-not-allowed' : 'hover:bg-light-2 text-dark-1'}`}
                                      onClick={() => handleAddonChange(addon.id, addon.maxQuantity ? Math.min(addon.maxQuantity, quantity + 1) : quantity + 1)}
                                      disabled={addon.maxQuantity ? quantity >= addon.maxQuantity : false}
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className={`px-15 py-6 rounded-100 text-10 fw-700 uppercase tracking-wider transition-all shadow-sm ${quantity > 0 ? 'bg-accent-1 text-white' : 'bg-white text-sec border-1 border-light-2 hover:bg-light-2'}`}
                                    onClick={() => handleAddonChange(addon.id, quantity > 0 ? 0 : 1)}
                                  >
                                    {quantity > 0 ? 'ADDED' : 'ADD'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {pricing && isAvailable && (
                  <div className="mb-20 pt-20 border-top-light">
                    {pricing.details?.lineItems?.length > 0 ? (
                      pricing.details.lineItems.map((item: any, idx: number) => (
                        <div key={idx} className="d-flex justify-between items-start text-13 text-dark-1 fw-500 pb-10">
                          <div>
                            <span>{item.label}</span>
                            {item.detail && <div className="text-11 text-sec mt-2">{item.detail}</div>}
                          </div>
                          <span className="fw-600">₹{(item.total / 100).toLocaleString('en-IN')}</span>
                        </div>
                      ))
                    ) : (
                      <div className="d-flex justify-between items-start text-13 text-dark-1 fw-500 pb-10">
                        <span>Base Villa Rental</span>
                        <span className="fw-600">₹{((pricing.price?.total || 0) / 100).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    
                    <div className="d-flex justify-between items-center text-13 text-dark-1 fw-500 pb-10">
                      <span>Refundable Security Deposit</span>
                      <span className="fw-600">₹{((pricing.price?.deposit || 0) / 100).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="d-flex justify-between items-center pt-10 border-top-light mt-10">
                      <span className="text-14 fw-700 text-dark-1 uppercase tracking-wider">Total Amount</span>
                      <span className="text-24 font-serif fw-700 text-dark-1">
                        {isPricingCalculating ? (
                          <div className="size-20 rounded-full border-2 border-accent-1 border-t-transparent animate-spin"></div>
                        ) : (
                          `₹${((pricing.price.total + pricing.price.deposit) / 100).toLocaleString('en-IN')}`
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* AVAILABILITY MESSAGE */}
                {!isAvailable && (
                  <div className="mb-20 p-12 bg-red-100 border-1 border-red-200 rounded-8 text-red-700 text-13 fw-600 text-center">
                    <i className="icon-close mr-6"></i>
                    {availabilityMessage || "These dates are not available. Please select different dates."}
                  </div>
                )}

                {/* PRIMARY BOOKING BUTTON */}
                <button
                  onClick={handleBookNow}
                  disabled={!isAvailable || isPricingCalculating}
                  className={`button rounded-200 w-1/1 py-18 text-14 uppercase tracking-wider fw-700 shadow-md transition-all d-flex justify-center items-center mb-20 ${
                    !isAvailable || isPricingCalculating 
                      ? 'bg-light-2 text-sec cursor-not-allowed' 
                      : 'bg-accent-1 text-white hover:shadow-xl hover:bg-dark-1'
                  }`}
                >
                  {!isAvailable 
                    ? 'UNAVAILABLE' 
                    : isPricingCalculating 
                      ? 'CHECKING...' 
                      : <><span className="mr-10">RESERVE YOUR STAY</span> <i className="icon-arrow-right-2 text-16"></i></>}
                </button>

                {/* WHATSAPP INSTANT INQUIRY BUTTON */}
                <a
                  href={`https://wa.me/${siteConfig.phoneNumbers[0].replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20am%20interested%20in%20booking%20${encodeURIComponent(villa.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button d-flex -md bg-white text-dark-1 border-1 border-light-2 rounded-200 w-1/1 justify-center py-14 text-13 uppercase tracking-wider fw-700 mb-16 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all shadow-sm"
                >
                  <i className="icon-chat text-18 mr-8"></i> WHATSAPP INQUIRY
                </a>

                <div className="text-center">
                  <a
                    href={`tel:${siteConfig.phoneNumbers[0].replace(/\s+/g, '')}`}
                    className="d-inline-flex justify-center items-center text-13 fw-600 text-sec hover:text-accent-1 transition-colors"
                  >
                    <i className="icon-phone text-14 mr-6 text-accent-1"></i> VIP Concierge: {siteConfig.phoneNumbers[0]}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* FULL PHOTO GALLERY LIGHTBOX GRID SECTION */}
          <div id="gallery" className="my-80 pt-60 border-top-light">
            <div className="d-flex justify-between items-end mb-40 flex-wrap y-gap-15">
              <div>
                <div className="text-12 uppercase tracking-widest text-accent-1 fw-700 mb-10">FULL PHOTO GALLERY</div>
                <h3 className="text-35 md:text-28 font-serif fw-700 text-dark-1">Explore {villa.name}</h3>
              </div>
              <button
                onClick={() => setActivePhotoIndex(0)}
                className="button -sm bg-white hover:bg-dark-1 text-dark-1 hover:text-white rounded-200 px-25 py-12 border-1 border-light-2 fw-700 uppercase tracking-wider shadow-sm transition-all"
              >
                <i className="icon-grid text-16 mr-8"></i> VIEW ALL {gallery.length} PHOTOS
              </button>
            </div>

            <div className="row x-gap-20 y-gap-20">
              {gallery.map((img, idx) => (
                <div key={idx} className="col-lg-3 col-md-4 col-sm-6">
                  <div
                    className="ratio ratio-4:3 rounded-16 overflow-hidden cursor-pointer hover-image-scale shadow-sm relative group border-1 border-white"
                    onClick={() => setActivePhotoIndex(idx)}
                  >
                    <img
                      src={img}
                      alt={`${villa.name} photo ${idx + 1}`}
                      className="img-ratio transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-dark-1/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-center">
                      <div className="size-45 rounded-full bg-white/95 text-dark-1 flex-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <i className="icon-search text-18 text-accent-1"></i>
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
