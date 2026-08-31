import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { PageHero } from '../components/common/PageHero';
import { useVillas } from '../context/VillaContext';
import { ImageModal } from '../components/common/ImageModal';
import { LuxuryDatePickerModal } from '../components/common/LuxuryDatePickerModal';
import { InstagramGrid } from '../components/sections/InstagramGrid';
import { BookingCTA } from '../components/common/BookingCTA';
import { siteConfig } from '../data/siteConfig';
import { coreApiService } from '../services/apiService';
import '../styles/villaDetailCalculator.css';

const formatAmenityName = (name: string): string => {
  const map: Record<string, string> = {
    'wi-fi': 'Free High-Speed Wi-Fi',
    'swimming_pool': 'Private Swimming Pool',
    'air_conditioner': 'Air Conditioned Rooms',
    'caretaker': '24/7 Onsite Caretaker',
    'lawn': 'Manicured Private Lawn',
    'parking': 'Free On-Site Car Parking',
    'power_backup': 'Power Backup Inverter Setup',
    'tv': 'Smart TV with OTT Apps',
    'kitchen': 'Fully Equipped Kitchen',
    'refrigerator': 'Refrigerator & Microwave',
    'geyser': 'Hot Water Geysers',
    'barbecue': 'BBQ Grill Setup',
    'music_system': 'Sound System / Speakers',
    'pet_friendly': 'Pet Friendly Environment',
  };
  if (map[name.toLowerCase()]) return map[name.toLowerCase()];
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const isExtraPersonAddon = (name: string): boolean => {
  const n = (name || '').toLowerCase();
  return n.includes('additional person') || n.includes('extra guest') || n.includes('extra person') || n.includes('additional guest');
};

const getMaxAllowedGuests = (villaObj: any): number => {
  if (!villaObj) return 12;
  
  if (typeof villaObj.maxGuests === 'number' && villaObj.maxGuests > 0) {
    return villaObj.maxGuests;
  }
  
  const str = `${villaObj.guests || ''} ${villaObj.subtitle || ''} ${villaObj.maxGuests || ''}`;
  const match = str.match(/(\d+)\s*(guest|person|adult)/i) || str.match(/(\d+)/);
  if (match && match[1]) {
    const parsed = parseInt(match[1], 10);
    if (parsed > 0 && parsed <= 50) {
      return parsed;
    }
  }
  
  return 12;
};

const getAmenityIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('wi-fi') || n.includes('wifi')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
      </svg>
    );
  }
  if (n.includes('pool') || n.includes('swimming')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1" />
        <path d="M2 16c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1" />
        <path d="M15 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
        <path d="M15 6V2" />
      </svg>
    );
  }
  if (n.includes('air') || n.includes('ac') || n.includes('condition')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="8" rx="2" />
        <line x1="7" y1="16" x2="7" y2="20" />
        <line x1="12" y1="16" x2="12" y2="20" />
        <line x1="17" y1="16" x2="17" y2="20" />
      </svg>
    );
  }
  if (n.includes('caretaker') || n.includes('security') || n.includes('gated')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }
  if (n.includes('lawn') || n.includes('outdoor') || n.includes('garden')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 6-4 11-10 11z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    );
  }
  if (n.includes('park')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M9 16V8h4a3 3 0 0 1 0 6H9" />
      </svg>
    );
  }
  if (n.includes('power') || n.includes('backup') || n.includes('inverter') || n.includes('generator') || n.includes('battery')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
        <line x1="22" y1="11" x2="22" y2="13" />
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
      </svg>
    );
  }
  if (n.includes('tv') || n.includes('television')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="13" rx="2" />
        <polyline points="17 2 12 7 7 2" />
      </svg>
    );
  }
  if (n.includes('kitchen') || n.includes('refrigerator') || n.includes('meal') || n.includes('food')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="2" x2="6" y2="5" />
        <line x1="10" y1="2" x2="10" y2="5" />
        <line x1="14" y1="2" x2="14" y2="5" />
      </svg>
    );
  }
  if (n.includes('pet')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
};

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
  const maxAllowedGuests = getMaxAllowedGuests(villa);
  const [guests, setGuests] = useState<number>(maxAllowedGuests);

  useEffect(() => {
    if (villa) {
      setGuests(getMaxAllowedGuests(villa));
    }
  }, [villa?.id, villa?.maxGuests, villa?.guests]);

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
  const [calendarMode, setCalendarMode] = useState<'checkIn' | 'checkOut' | null>(null);
  const navigate = useNavigate();
  const photoCarouselRef = useRef<HTMLDivElement>(null);

  const getTomorrowString = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const scrollPhotos = (direction: 'left' | 'right') => {
    if (photoCarouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      photoCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
            guests,
            selectedAddons
          }).catch((err) => {
            console.error("Pricing error:", err);
            return null;
          }),
          coreApiService.checkAvailability({
            offeringId: villa.offeringId || villa.id,
            startDate: startDateTime,
            endDate: endDateTime,
            guests
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
  }, [startDate, endDate, guests, selectedAddons, villa]);

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

  const handleGuestsChange = (newGuests: number) => {
    setGuests(newGuests);
    // If guests selected < max capacity, auto-remove any Extra Person add-on
    if (newGuests < maxAllowedGuests) {
      setSelectedAddons(prev => prev.filter(a => {
        const addonObj = villa?.addons?.find((ad: any) => ad.id === a.id);
        return addonObj ? !isExtraPersonAddon(addonObj.name) : true;
      }));
    }
  };

  const handleAddonChange = (addonId: string, quantity: number) => {
    const targetAddon = villa?.addons?.find((a: any) => a.id === addonId);
    const nameLower = targetAddon?.name?.toLowerCase() || '';
    const isVeg = nameLower.includes('veg') && !nameLower.includes('non');
    const isNonVeg = nameLower.includes('non-veg') || nameLower.includes('non veg');
    const isExtraPerson = isExtraPersonAddon(targetAddon?.name || '');

    setSelectedAddons(prev => {
      let next = [...prev];
      const existingIdx = next.findIndex(a => a.id === addonId);

      // Determine extra persons count
      let currentExtraPersons = 0;
      const extraAddonObj = villa?.addons?.find((a: any) => isExtraPersonAddon(a.name));
      if (extraAddonObj) {
        if (isExtraPerson) {
          currentExtraPersons = quantity;
        } else {
          const found = next.find(a => a.id === extraAddonObj.id);
          currentExtraPersons = found ? found.quantity : 0;
        }
      }

      const totalAllowedMeals = guests + currentExtraPersons;

      if (isVeg || isNonVeg) {
        const counterpartAddon = villa?.addons?.find((a: any) => {
          const n = a.name?.toLowerCase() || '';
          if (isVeg) return n.includes('non-veg') || n.includes('non veg');
          return n.includes('veg') && !n.includes('non');
        });

        const counterpartQty = counterpartAddon
          ? (next.find(a => a.id === counterpartAddon.id)?.quantity || 0)
          : 0;

        // Cap requested quantity so (quantity + counterpartQty) <= totalAllowedMeals
        const maxForThis = Math.max(0, totalAllowedMeals - counterpartQty);
        const cappedQty = Math.min(quantity, maxForThis);

        if (cappedQty <= 0) {
          next = next.filter(a => a.id !== addonId);
        } else if (existingIdx >= 0) {
          next[existingIdx] = { ...next[existingIdx], quantity: cappedQty };
        } else {
          next.push({ id: addonId, quantity: cappedQty });
        }
      } else {
        if (quantity <= 0) {
          next = next.filter(a => a.id !== addonId);
        } else if (existingIdx >= 0) {
          next[existingIdx] = { ...next[existingIdx], quantity };
        } else {
          next.push({ id: addonId, quantity });
        }
      }

      return next;
    });
  };

  const handleBookNow = () => {
    if (!startDate || !endDate) {
      alert('Please select both Check-In and Check-Out dates.');
      return;
    }
    navigate(`/checkout/${villa.id}`, { 
      state: { 
        startDate, 
        endDate, 
        guests, 
        villa, 
        selectedAddons 
      } 
    });
  };

  return (
    <>
      <SEO
        title={`${villa.name} | Woodland River Villa Alibaug`}
        description={villa.description}
      />

      {/* STANDARD SITE PAGE HERO BANNER WITH FULL-WIDTH ATTACHED BREADCRUMB BAR */}
      <div className="relative">
        <PageHero
          title={villa.name}
          subtitle={villa.subtitle || 'Private luxury villa estate with pool, lawn, and serene views in Alibaug.'}
          category="WOODLAND RIVER VILLAS"
          bgImage={villa.heroImage || mainPhoto}
        />

        {/* FULL-WIDTH SPACIOUS BREADCRUMB BAR ATTACHED TO BOTTOM OF BANNER IMAGE */}
        <div className="luxury-breadcrumb-bar">
          <div className="container">
            <nav className="luxury-breadcrumb-nav">
              <Link to="/" className="luxury-breadcrumb-link">
                <i className="icon-home text-16 mr-8" style={{ color: '#004d43' }}></i> HOME
              </Link>
              <span className="luxury-breadcrumb-separator">›</span>
              <Link to="/our-villas" className="luxury-breadcrumb-link">
                VILLAS IN ALIBAUG
              </Link>
              <span className="luxury-breadcrumb-separator">›</span>
              <span className="luxury-breadcrumb-active">
                {villa.name}
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* MAIN BODY AREA: VILLA DETAILS ON LEFT & FLOATING PRICING CALCULATOR ON RIGHT */}
      <div className="bg-light-1 text-dark-1 pt-30 pb-80">
        <div className="container">

          {/* 2. MAIN SECTION: VILLA DETAILS ON LEFT & FLOATING PRICING CALCULATOR ON RIGHT */}
          <div className="row y-gap-50 justify-between items-start">
            
            {/* LEFT COLUMN: VILLA OVERVIEW & DETAILS */}
            <div className="col-lg-7">
              <div className="mb-32">
                <div className="luxury-subnav-bar">
                  {[
                    { id: 'overview', label: 'OVERVIEW' },
                    { id: 'highlights', label: 'HIGHLIGHTS' },
                    { id: 'meals', label: 'MEALS' },
                    { id: 'amenities', label: 'AMENITIES' },
                    { id: 'location', label: 'LOCATION' },
                    { id: 'policies', label: 'STAY GUIDELINES' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveNavTab(tab.id)}
                      className={`luxury-subnav-btn ${activeNavTab === tab.id ? 'active' : ''}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* ONLY RENDER THE SELECTED TAB CONTENT */}
              {activeNavTab === 'overview' && (
                <div id="overview" className="luxury-detail-card" style={{ padding: '32px' }}>
                  {/* TOP BADGE */}
                  <div className="d-flex items-center text-12 font-bold uppercase tracking-widest mb-16 flex-wrap" style={{ gap: '10px' }}>
                    <span className="d-flex items-center" style={{ color: '#004d43' }}>
                      <i className="icon-star text-amber-500 mr-6 text-14"></i> VIP LUXURY ESTATE
                    </span>
                    <span className="text-sec opacity-40" style={{ margin: '0 6px' }}>•</span>
                    <span className="d-flex items-center" style={{ color: '#0f172a' }}>
                      <i className="icon-location mr-6 text-14" style={{ color: '#004d43' }}></i> ALIBAUG, MAHARASHTRA
                    </span>
                  </div>

                  {/* VILLA TITLE */}
                  <h1 className="text-44 md:text-34 font-serif font-bold text-dark-1 mb-16 leading-tight">
                    {villa.name}
                  </h1>
                  
                  {/* SUBTITLE SPECIFICATIONS */}
                  <div className="text-14 font-bold text-accent-1 uppercase tracking-wider mb-28 d-flex items-center flex-wrap" style={{ gap: '10px' }}>
                    <span className="inline-block size-8 rounded-full bg-accent-1"></span>
                    <span>{villa.bedrooms.toLowerCase().includes('bedroom') ? villa.bedrooms : `${villa.bedrooms} Bedroom${Number(villa.bedrooms) !== 1 ? 's' : ''}`}</span>
                    <span className="text-sec opacity-40">·</span>
                    <span>{villa.guests.toLowerCase().includes('guest') ? villa.guests : `Up to ${villa.guests} Guests`}</span>
                    <span className="text-sec opacity-40">·</span>
                    <span>Alibaug, Maharashtra</span>
                  </div>

                  {/* NARRATIVE DESCRIPTION */}
                  <div className="border-top-light pt-28 pb-4 text-16 text-sec space-y-20 leading-relaxed">
                    <p className="m-0">{villa.description}</p>
                    <p className="m-0">
                      Surrounded by natural greenery and quiet riverfront views, {villa.name} offers a private group getaway just 20 minutes from Mandwa Jetty in Alibaug. With private pool access, spacious open living rooms, and manicured lawns, it is built for celebrations, family reunions, and peaceful weekends.
                    </p>
                  </div>

                  {/* OWL-STYLE PHOTO CAROUSEL SLIDER WITH NAV ARROWS */}
                  <div className="border-top-light pt-32 mt-32">
                    <div className="d-flex justify-between items-center mb-20 flex-wrap y-gap-12" style={{ gap: '16px' }}>
                      <h3 className="text-22 font-serif font-bold text-dark-1 m-0">Estate Photo Gallery</h3>
                      
                      {/* CAROUSEL NAVIGATION CONTROLS */}
                      <div className="d-flex items-center" style={{ gap: '10px' }}>
                        <button
                          onClick={() => scrollPhotos('left')}
                          className="size-38 rounded-full bg-white border-1 border-light-2 text-dark-1 flex-center shadow-sm hover:bg-accent-1 hover:text-white hover:border-accent-1 transition-all"
                          aria-label="Previous photos"
                          type="button"
                        >
                          <i className="icon-arrow-left text-13"></i>
                        </button>
                        <button
                          onClick={() => scrollPhotos('right')}
                          className="size-38 rounded-full bg-white border-1 border-light-2 text-dark-1 flex-center shadow-sm hover:bg-accent-1 hover:text-white hover:border-accent-1 transition-all"
                          aria-label="Next photos"
                          type="button"
                        >
                          <i className="icon-arrow-right text-13"></i>
                        </button>
                        <button
                          onClick={() => setActivePhotoIndex(0)}
                          className="text-11 font-bold text-accent-1 hover:text-dark-1 transition-colors uppercase tracking-wider bg-accent-1/10 px-14 py-7 rounded-100 d-flex items-center ml-4"
                          type="button"
                        >
                          <i className="icon-grid text-12 mr-6"></i> {gallery.length} PHOTOS
                        </button>
                      </div>
                    </div>

                    {/* DEDICATED OWL CAROUSEL TRACK */}
                    <div className="luxury-owl-container">
                      <div 
                        ref={photoCarouselRef}
                        className="luxury-owl-track"
                      >
                        {gallery.map((photoUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActivePhotoIndex(idx)}
                            className="luxury-owl-item group"
                          >
                            <img
                              src={photoUrl}
                              alt={`${villa.name} photo ${idx + 1}`}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-dark-1/20 group-hover:bg-dark-1/0 transition-colors flex-center">
                              <div className="size-32 rounded-full bg-white/95 text-dark-1 flex-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md transform scale-90 group-hover:scale-100">
                                <i className="icon-search text-14 text-accent-1"></i>
                              </div>
                            </div>
                            <span className="absolute bottom-6 left-6 text-9 font-bold uppercase tracking-widest bg-dark-1/75 text-white px-8 py-2 rounded-100 backdrop-blur-xs">
                              {idx + 1} / {gallery.length}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* HORIZONTALLY SCROLLABLE ESTATE HIGHLIGHT CUBES */}
              {activeNavTab === 'highlights' && (
                <div id="highlights" className="luxury-detail-card" style={{ padding: '20px 24px' }}>
                  <div className="d-flex items-center justify-between mb-16">
                    <h2 className="text-22 font-serif font-bold text-dark-1 m-0">Estate Highlights</h2>
                    <span className="text-11 font-bold text-accent-1 uppercase tracking-wider bg-accent-1/10 px-12 py-4 rounded-100 d-flex items-center">
                      <i className="icon-arrow-right-2 text-12 mr-4"></i> Scroll Features
                    </span>
                  </div>
                  <div className="luxury-cube-row no-scrollbar">
                    {[
                      { 
                        renderIcon: () => <i className="icon-bed text-22"></i>, 
                        label: 'BEDROOMS', 
                        value: villa.bedrooms.replace(' BEDROOMS', '').replace(' BEDROOM W/ PRIVATE POOL', '1 Studio') 
                      },
                      { 
                        renderIcon: () => <i className="icon-bath text-22"></i>, 
                        label: 'BATHROOMS', 
                        value: villa.bathrooms.replace(' BATHROOMS', '').replace(' BATHROOM', '1 Bath') 
                      },
                      { 
                        renderIcon: () => <i className="icon-guest text-22"></i>, 
                        label: 'GUESTS', 
                        value: villa.guests.replace(' GUESTS & MORE', ' Guests') 
                      },
                      { 
                        renderIcon: () => (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 20c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1" />
                            <path d="M2 16c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1" />
                            <path d="M15 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                            <path d="M15 6V2" />
                          </svg>
                        ), 
                        label: 'POOL', 
                        value: 'Private Pool' 
                      },
                      { 
                        renderIcon: () => (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 6-4 11-10 11z" />
                            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                          </svg>
                        ), 
                        label: 'OUTDOOR', 
                        value: 'Private Lawn' 
                      },
                      { 
                        renderIcon: () => (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                          </svg>
                        ), 
                        label: 'PETS', 
                        value: 'Pet Friendly' 
                      },
                    ].map((stat, i) => (
                      <div key={i} className="luxury-cube-card">
                        <div className="luxury-cube-icon">
                          {stat.renderIcon()}
                        </div>
                        <div>
                          <div className="luxury-cube-val">{stat.value}</div>
                          <div className="luxury-cube-lbl">{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ELEGANT MEALS & DINING EXPERIENCE SECTION */}
              {activeNavTab === 'meals' && (
                <div id="meals" className="luxury-detail-card">
                  <div className="d-flex justify-between items-center mb-24 flex-wrap y-gap-10">
                    <h3 className="text-28 font-serif font-bold text-dark-1 m-0">Meals & Dining Experience</h3>
                    <span className="text-11 font-bold text-accent-1 uppercase tracking-wider bg-accent-1/10 px-14 py-6 rounded-100 d-flex items-center">
                      🍽️ ON-SITE CARETAKER & COOK
                    </span>
                  </div>

                  {/* CULINARY HERO ADDRESS BANNER */}
                  <div className="luxury-hero-address">
                    <div className="luxury-hero-address-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                        <line x1="6" y1="2" x2="6" y2="5" />
                        <line x1="10" y1="2" x2="10" y2="5" />
                        <line x1="14" y1="2" x2="14" y2="5" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-dark-1 text-17 mb-3" style={{ fontFamily: "'Jost', sans-serif" }}>
                        Authentic Home-Fresh Regional Meals
                      </div>
                      <div className="text-14 font-medium" style={{ color: '#004d43', fontFamily: "'Jost', sans-serif" }}>
                        Freshly prepared Konkani & Maharashtrian delicacies by our dedicated on-site caretakers
                      </div>
                    </div>
                  </div>

                  {/* 3 CULINARY HIGHLIGHT CARDS */}
                  <div className="row x-gap-16 y-gap-16">
                    <div className="col-md-4 col-12">
                      <div className="luxury-info-card">
                        <div className="d-flex items-center mb-12">
                          <div className="luxury-info-icon mr-12">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 6-4 11-10 11z" />
                              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                            </svg>
                          </div>
                          <div className="font-bold text-dark-1 text-15" style={{ fontFamily: "'Jost', sans-serif" }}>
                            Fresh Local Ingredients
                          </div>
                        </div>
                        <div className="text-13 text-sec font-medium leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
                          Standard & customized menus prepared daily using farm-fresh local ingredients.
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 col-12">
                      <div className="luxury-info-card">
                        <div className="d-flex items-center mb-12">
                          <div className="luxury-info-icon mr-12">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
                              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
                              <line x1="6" y1="2" x2="6" y2="4" />
                              <line x1="10" y1="2" x2="10" y2="4" />
                              <line x1="14" y1="2" x2="14" y2="4" />
                            </svg>
                          </div>
                          <div className="font-bold text-dark-1 text-15" style={{ fontFamily: "'Jost', sans-serif" }}>
                            Tea & Purified Water
                          </div>
                        </div>
                        <div className="text-13 text-sec font-medium leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
                          Complimentary filtered drinking water and morning/evening tea/coffee served daily.
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 col-12">
                      <div className="luxury-info-card">
                        <div className="d-flex items-center mb-12">
                          <div className="luxury-info-icon mr-12">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 13.87A8 8 0 0 1 12 4a8 8 0 0 1 6 9.87" />
                              <line x1="4" y1="20" x2="20" y2="20" />
                            </svg>
                          </div>
                          <div className="font-bold text-dark-1 text-15" style={{ fontFamily: "'Jost', sans-serif" }}>
                            Outside Food Allowed
                          </div>
                        </div>
                        <div className="text-13 text-sec font-medium leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
                          Feel free to order in from nearby restaurants (caretakers can assist with menus).
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* HORIZONTALLY SCROLLABLE AMENITIES CUBES */}
              {activeNavTab === 'amenities' && (
                <div id="amenities" className="luxury-detail-card" style={{ padding: '20px 24px' }}>
                  <div className="d-flex items-center justify-between mb-16">
                    <h3 className="text-22 font-serif font-bold text-dark-1 m-0">Amenities & Inclusions</h3>
                    <span className="text-11 font-bold text-accent-1 uppercase tracking-wider bg-accent-1/10 px-12 py-4 rounded-100 d-flex items-center">
                      <i className="icon-arrow-right-2 text-12 mr-4"></i> Scroll Amenities
                    </span>
                  </div>
                  <div className="luxury-cube-row no-scrollbar">
                    {[...villa.features, '24/7 Gated Security & Caretaker', 'Free On-Site Car Parking', 'Power Backup Inverter Setup'].map((feat, idx) => {
                      const formatted = formatAmenityName(feat);
                      return (
                        <div key={idx} className="luxury-cube-card">
                          <div className="luxury-cube-icon">
                            {getAmenityIcon(feat)}
                          </div>
                          <div>
                            <div className="luxury-cube-val" style={{ fontSize: '13px', lineHeight: '1.2' }}>{formatted}</div>
                            <div className="luxury-cube-lbl" style={{ fontSize: '9px' }}>INCLUDED</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ELEGANT LOCATION & HOW TO REACH GUIDE */}
              {activeNavTab === 'location' && (
                <div id="location" className="luxury-detail-card">
                  <div className="d-flex justify-between items-center mb-24 flex-wrap y-gap-10">
                    <h3 className="text-28 font-serif font-bold text-dark-1 m-0">Location & How to Reach</h3>
                    <a
                      href="https://maps.google.com/?q=Zirad+Alibaug"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="luxury-directions-btn"
                    >
                      <span>GET DIRECTIONS</span>
                      <i className="icon-arrow-top-right text-12"></i>
                    </a>
                  </div>

                  {/* ADDRESS HERO BANNER */}
                  <div className="luxury-hero-address">
                    <div className="luxury-hero-address-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-dark-1 text-17 mb-3" style={{ fontFamily: "'Jost', sans-serif" }}>
                        Zirad Pada, Zirad, Alibaug - 402201
                      </div>
                      <div className="text-14 font-medium" style={{ color: '#004d43', fontFamily: "'Jost', sans-serif" }}>
                        Just a 20-minute scenic drive from Mandwa Jetty ferry terminal
                      </div>
                    </div>
                  </div>

                  {/* 2 ROUTE CARDS */}
                  <div className="row x-gap-16 y-gap-16">
                    <div className="col-md-6 col-12">
                      <div className="luxury-info-card">
                        <div className="d-flex items-center mb-14">
                          <div className="luxury-info-icon mr-14">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                              <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.07" />
                              <path d="M12 10V4" />
                              <path d="M8 8l4-4 4 4" />
                            </svg>
                          </div>
                          <div className="font-bold text-dark-1 text-16" style={{ fontFamily: "'Jost', sans-serif" }}>
                            Via Sea (Ferry / Speedboat)
                          </div>
                        </div>
                        <div className="text-14 text-sec font-medium leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
                          Take a 20-min Speedboat from Gateway of India or RoRo Car Ferry from Bhau Cha Dhakka to Mandwa Jetty. Followed by a 20-minute drive to the villa.
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 col-12">
                      <div className="luxury-info-card">
                        <div className="d-flex items-center mb-14">
                          <div className="luxury-info-icon mr-14">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="16" rx="3" />
                              <path d="M9 16V8h4a3 3 0 0 1 0 6H9" />
                            </svg>
                          </div>
                          <div className="font-bold text-dark-1 text-16" style={{ fontFamily: "'Jost', sans-serif" }}>
                            Via Road (Car Drive)
                          </div>
                        </div>
                        <div className="text-14 text-sec font-medium leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
                          Direct drive from Mumbai via Mumbai-Goa Highway (NH66) or Mumbai-Pune Expressway via Pen exit (~3 hours total drive).
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ELEGANT STAY GUIDELINES & POLICIES */}
              {activeNavTab === 'policies' && (
                <div id="policies" className="luxury-detail-card">
                  <h3 className="text-28 font-serif font-bold text-dark-1 mb-24">Stay Guidelines & Policies</h3>
                  <div className="row x-gap-16 y-gap-16">
                    <div className="col-md-6 col-12">
                      <div className="luxury-info-card">
                        <div className="d-flex items-center mb-12">
                          <div className="luxury-info-icon mr-14">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          </div>
                          <div className="font-bold text-dark-1 text-16" style={{ fontFamily: "'Jost', sans-serif" }}>
                            Check-In & Check-Out
                          </div>
                        </div>
                        <div className="text-14 text-sec font-medium leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
                          Check-In: 2:00 PM onwards<br />Check-Out: 11:00 AM sharp
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 col-12">
                      <div className="luxury-info-card">
                        <div className="d-flex items-center mb-12">
                          <div className="luxury-info-icon mr-14">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                          </div>
                          <div className="font-bold text-dark-1 text-16" style={{ fontFamily: "'Jost', sans-serif" }}>
                            ID Formalities
                          </div>
                        </div>
                        <div className="text-14 text-sec font-medium leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
                          Valid Government Photo ID required for all adult guests upon check-in.
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 col-12">
                      <div className="luxury-info-card">
                        <div className="d-flex items-center mb-12">
                          <div className="luxury-info-icon mr-14">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 20c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1" />
                              <path d="M15 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                            </svg>
                          </div>
                          <div className="font-bold text-dark-1 text-16" style={{ fontFamily: "'Jost', sans-serif" }}>
                            Pool & Safety Rules
                          </div>
                        </div>
                        <div className="text-14 text-sec font-medium leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
                          Pool access is open 24/7. Proper swimwear requested. No glass near pool.
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6 col-12">
                      <div className="luxury-info-card">
                        <div className="d-flex items-center mb-12">
                          <div className="luxury-info-icon mr-14">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#004d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 18V5l12-2v13" />
                              <circle cx="6" cy="18" r="3" />
                              <circle cx="18" cy="16" r="3" />
                            </svg>
                          </div>
                          <div className="font-bold text-dark-1 text-16" style={{ fontFamily: "'Jost', sans-serif" }}>
                            Noise & Music
                          </div>
                        </div>
                        <div className="text-14 text-sec font-medium leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
                          Outdoor loud music allowed until 10:00 PM per local norms.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: FLOATING PRICING CALCULATOR */}
            <div className="col-lg-5">
              <div className="luxury-calc-card">
                
                {/* PRICE BANNER HEADER */}
                <div className="luxury-calc-header">
                  <div className="d-flex justify-between items-center mb-8">
                    <span className="text-11 uppercase tracking-widest text-sec font-bold" style={{ fontFamily: "'Jost', sans-serif" }}>
                      STARTING FROM
                    </span>
                    <span className="luxury-rate-badge">
                      BEST RATE
                    </span>
                  </div>
                  <div className="d-flex items-baseline">
                    <span className="text-38 font-serif font-bold text-dark-1 leading-none" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {pricing?.details?.lineItems?.find((i: any) => i.label === 'Base Price')?.unitPrice
                        ? `₹${(pricing.details.lineItems.find((i: any) => i.label === 'Base Price').unitPrice / 100).toLocaleString('en-IN')}`
                        : priceFormatted}
                    </span>
                    <span className="text-14 text-sec font-medium ml-6" style={{ fontFamily: "'Jost', sans-serif" }}>/ night</span>
                    {isPricingCalculating && (
                      <span className="ml-10 inline-block size-6 rounded-full bg-accent-1 animate-ping"></span>
                    )}
                  </div>
                </div>

                {/* INCLUSIONS & BREAKDOWN SUMMARY */}
                <div className="luxury-inclusions-box">
                  <div className="d-flex justify-between items-center text-13 text-dark-1 font-medium pb-8" style={{ fontFamily: "'Jost', sans-serif" }}>
                    <span>Security Deposit (Refundable)</span>
                    <span className="font-bold">{depositFormatted}</span>
                  </div>
                  <div className="d-flex justify-between items-center text-13 text-dark-1 font-medium pb-8" style={{ fontFamily: "'Jost', sans-serif" }}>
                    <span>Cleaning & Maintenance</span>
                    <span className="font-bold text-emerald-700">Included</span>
                  </div>
                  <div className="d-flex justify-between items-center text-13 text-dark-1 font-medium" style={{ fontFamily: "'Jost', sans-serif" }}>
                    <span>In-Villa Housekeeping</span>
                    <span className="font-bold">Daily</span>
                  </div>
                </div>

                {/* DATE & GUEST PICKERS */}
                <div className="space-y-16 mb-24">
                  <div className="row x-gap-10 y-gap-10">
                    
                    {/* CHECK-IN PICKER */}
                    <div className="col-6 relative">
                      <label className="text-11 font-bold text-dark-1 mb-6 d-block uppercase tracking-wider" style={{ fontFamily: "'Jost', sans-serif" }}>
                        CHECK-IN *
                      </label>
                      <div 
                        onClick={() => setCalendarMode(calendarMode === 'checkIn' ? null : 'checkIn')}
                        className="luxury-date-input-box"
                      >
                        <span className="text-13 font-semibold text-dark-1" style={{ fontFamily: "'Jost', sans-serif" }}>
                          {startDate ? new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select Date'}
                        </span>
                        <i className="icon-calendar text-accent-1 text-14"></i>
                      </div>

                      {calendarMode === 'checkIn' && (
                        <LuxuryDatePickerModal
                          mode="checkIn"
                          startDate={startDate}
                          endDate={endDate}
                          onSelectDate={(m, selectedDate) => {
                            setStartDate(selectedDate);
                            let newEnd = endDate;
                            if (!endDate || endDate <= selectedDate) {
                              newEnd = getTomorrowString(selectedDate);
                              setEndDate(newEnd);
                            }
                          }}
                          onClose={() => setCalendarMode(null)}
                        />
                      )}
                    </div>

                    {/* CHECK-OUT PICKER */}
                    <div className="col-6 relative">
                      <label className="text-11 font-bold text-dark-1 mb-6 d-block uppercase tracking-wider" style={{ fontFamily: "'Jost', sans-serif" }}>
                        CHECK-OUT *
                      </label>
                      <div 
                        onClick={() => setCalendarMode(calendarMode === 'checkOut' ? null : 'checkOut')}
                        className="luxury-date-input-box"
                      >
                        <span className="text-13 font-semibold text-dark-1" style={{ fontFamily: "'Jost', sans-serif" }}>
                          {endDate ? new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select Date'}
                        </span>
                        <i className="icon-calendar text-accent-1 text-14"></i>
                      </div>

                      {calendarMode === 'checkOut' && (
                        <LuxuryDatePickerModal
                          mode="checkOut"
                          startDate={startDate}
                          endDate={endDate}
                          onSelectDate={(m, selectedDate) => {
                            setEndDate(selectedDate);
                          }}
                          onClose={() => setCalendarMode(null)}
                        />
                      )}
                    </div>
                  </div>

                  {/* GUESTS DROPDOWN */}
                  <div>
                    <label className="text-11 font-bold text-dark-1 mb-6 d-block uppercase tracking-wider" style={{ fontFamily: "'Jost', sans-serif" }}>
                      GUESTS
                    </label>
                    <div className="relative">
                      <select 
                        className="w-1/1 bg-light-1 border-1 border-light-2 focus:border-accent-1 text-dark-1 outline-none transition-all cursor-pointer"
                        style={{ 
                          height: '52px', 
                          borderRadius: '14px',
                          padding: '0 16px',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#0f172a',
                          fontFamily: "'Jost', sans-serif"
                        }}
                        value={guests > maxAllowedGuests ? maxAllowedGuests : guests}
                        onChange={(e) => handleGuestsChange(Number(e.target.value))}
                      >
                        {[...Array(maxAllowedGuests)].map((_, i) => (
                          <option key={i+1} value={i+1}>{i+1} Guest{i > 0 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* OPTIONAL ADD-ONS */}
                  {villa.addons && villa.addons.length > 0 && (
                    <div className="mt-20 pt-20 border-top-light">
                      <label className="text-11 font-bold text-dark-1 mb-12 d-block uppercase tracking-wider" style={{ fontFamily: "'Jost', sans-serif" }}>
                        OPTIONAL ADD-ONS
                      </label>
                      <div className="space-y-10">
                        {villa.addons
                          .filter((addon: any) => {
                            if (isExtraPersonAddon(addon.name) && guests < maxAllowedGuests) {
                              return false;
                            }
                            return true;
                          })
                          .map((addon, idx) => {
                          const selected = selectedAddons.find(a => a.id === addon.id);
                          const quantity = selected ? selected.quantity : 0;
                          return (
                            <div key={idx} className="luxury-addon-item">
                              <div>
                                <div className="text-14 font-bold text-dark-1 mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>
                                  {addon.name}
                                </div>
                                <div className="text-12 font-bold text-accent-1" style={{ fontFamily: "'Jost', sans-serif" }}>
                                  ₹{(addon.priceCents / 100).toLocaleString('en-IN')} {addon.priceType === 'PER_DURATION' ? '/ day' : (addon.priceType === 'PER_UNIT' ? '/ unit' : '')}
                                </div>
                              </div>

                              <div>
                                {addon.multiSelect ? (
                                  <div className="d-flex items-center space-x-8">
                                    <button 
                                      className="luxury-counter-btn"
                                      onClick={() => handleAddonChange(addon.id, Math.max(0, quantity - 1))}
                                      disabled={quantity <= 0}
                                      type="button"
                                    >
                                      -
                                    </button>
                                    <span className="text-14 font-bold text-dark-1 min-w-20 text-center" style={{ fontFamily: "'Jost', sans-serif" }}>
                                      {quantity}
                                    </span>
                                    <button 
                                      className="luxury-counter-btn"
                                      onClick={() => handleAddonChange(addon.id, addon.maxQuantity ? Math.min(addon.maxQuantity, quantity + 1) : quantity + 1)}
                                      disabled={addon.maxQuantity ? quantity >= addon.maxQuantity : false}
                                      type="button"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className={`px-16 py-6 rounded-100 text-11 font-bold uppercase tracking-wider transition-all shadow-xs ${quantity > 0 ? 'bg-accent-1 text-white' : 'bg-white text-dark-1 border-1 border-light-2 hover:border-accent-1'}`}
                                    onClick={() => handleAddonChange(addon.id, quantity > 0 ? 0 : 1)}
                                    type="button"
                                  >
                                    {quantity > 0 ? 'ADDED ✓' : 'ADD +'}
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

                {/* PRICING BREAKDOWN (HIGH CONTRAST & LEGIBILITY) */}
                {pricing && isAvailable && (
                  <div className="mb-24 pt-20 border-top-light">
                    {pricing.details?.lineItems?.length > 0 ? (
                      pricing.details.lineItems.map((item: any, idx: number) => (
                        <div key={idx} className="d-flex justify-between items-start text-14 text-dark-1 font-semibold pb-10" style={{ fontFamily: "'Jost', sans-serif", color: '#0f172a' }}>
                          <div>
                            <span>{item.label}</span>
                            {item.detail && <div className="text-12 text-sec font-medium mt-2">{item.detail}</div>}
                          </div>
                          <span className="font-bold">₹{(item.total / 100).toLocaleString('en-IN')}</span>
                        </div>
                      ))
                    ) : (
                      <div className="d-flex justify-between items-start text-14 text-dark-1 font-semibold pb-10" style={{ fontFamily: "'Jost', sans-serif", color: '#0f172a' }}>
                        <span>Base Villa Rental</span>
                        <span className="font-bold">₹{((pricing.price?.total || 0) / 100).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    
                    <div className="d-flex justify-between items-center text-14 text-dark-1 font-semibold pb-10" style={{ fontFamily: "'Jost', sans-serif", color: '#0f172a' }}>
                      <span>Refundable Security Deposit</span>
                      <span className="font-bold">₹{((pricing.price?.deposit || 0) / 100).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="d-flex justify-between items-center pt-14 border-top-light mt-12">
                      <span className="text-13 font-bold text-dark-1 uppercase tracking-wider" style={{ fontFamily: "'Jost', sans-serif", color: '#0f172a' }}>
                        TOTAL AMOUNT
                      </span>
                      <span className="text-30 font-serif font-bold text-dark-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#0f172a' }}>
                        ₹{((pricing.price.total + pricing.price.deposit) / 100).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}

                {/* AVAILABILITY MESSAGE */}
                {!isAvailable && (
                  <div className="mb-24 p-14 bg-red-50 border-1 border-red-200 rounded-14 text-red-700 text-13 font-bold text-center" style={{ fontFamily: "'Jost', sans-serif" }}>
                    <i className="icon-close mr-6"></i>
                    {availabilityMessage || "These dates are not available. Please select different dates."}
                  </div>
                )}

                {/* PRIMARY BOOKING BUTTON */}
                <button
                  onClick={handleBookNow}
                  disabled={!isAvailable}
                  className="luxury-reserve-btn mb-18"
                  type="button"
                >
                  {!isAvailable ? (
                    'BOOKED'
                  ) : (
                    <>
                      <span>RESERVE YOUR STAY</span>
                      <i className="icon-arrow-right-2 text-16 ml-10"></i>
                    </>
                  )}
                </button>

                {/* WHATSAPP INSTANT INQUIRY BUTTON WITH OFFICIAL WHATSAPP SVG */}
                <a
                  href={`https://wa.me/${siteConfig.phoneNumbers[0].replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20am%20interested%20in%20booking%20${encodeURIComponent(villa.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="luxury-whatsapp-btn mb-18"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366" className="mr-10 flex-shrink-0">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.157 4.228 4.227-1.111z"/>
                  </svg>
                  <span>WHATSAPP INQUIRY</span>
                </a>

                <div className="text-center pt-4">
                  <a
                    href={`tel:${siteConfig.phoneNumbers[0].replace(/\s+/g, '')}`}
                    className="luxury-concierge-link"
                  >
                    <i className="icon-phone text-14 mr-6 text-accent-1"></i> VIP Concierge: {siteConfig.phoneNumbers[0]}
                  </a>
                </div>
              </div>
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
