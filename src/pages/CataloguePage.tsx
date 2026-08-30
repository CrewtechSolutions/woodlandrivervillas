import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { useVillas } from '../context/VillaContext';
import { coreApiService } from '../services/apiService';
import { InstagramGrid } from '../components/sections/InstagramGrid';
import { BookingCTA } from '../components/common/BookingCTA';

export const CataloguePage: React.FC = () => {
  const { villas, loading } = useVillas();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const filteredVillas = useMemo(() => {
    if (startDate && endDate && Object.keys(availabilityMap).length > 0) {
      // Filter out villas that are explicitly marked as not available
      return villas.filter(villa => availabilityMap[villa.id] !== false);
    }
    return villas;
  }, [villas, startDate, endDate, availabilityMap]);

  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) return;

    setCheckingAvailability(true);
    const newAvailMap: Record<string, boolean> = {};

    for (const villa of filteredVillas) {
      try {
        const res = await coreApiService.checkAvailability({
          offeringId: villa.offeringId || villa.id,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        });
        newAvailMap[villa.id] = res.available;
      } catch (e) {
        newAvailMap[villa.id] = true; // Fallback
      }
    }

    setAvailabilityMap(newAvailMap);
    setCheckingAvailability(false);
  };

  useEffect(() => {
    if (startDate && endDate) {
      handleCheckAvailability();
    } else {
      setAvailabilityMap({});
    }
  }, [startDate, endDate]);

  return (
    <>
      <SEO
        title="Woodland River Villa Catalogue | Villas in Alibaug"
        description="Check real-time availability for our luxury villas in Alibaug."
        canonical="https://www.woodlandriver.com/catalogue/"
      />

      {/* HERO & SEARCH SECTION */}
      <section className="relative pt-150 pb-120 bg-dark-1 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/img/pageHero/4.png"
            alt="Hero Background"
            className="w-1/1 h-1/1 object-cover"
          />
          {/* Subtle dark gradient overlays for premium look */}
          <div className="absolute inset-0 bg-dark-1 opacity-60 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-dark-1 to-transparent opacity-80"></div>
        </div>
        <div className="container relative z-2 text-center text-white">
          <div className="d-inline-flex items-center x-gap-8 bg-white/10 px-16 py-6 rounded-200 border-1 border-white/20 mb-24" data-anim-child="slide-up delay-1">
            <span className="text-11 uppercase fw-700 tracking-wider">PREMIUM COLLECTION</span>
          </div>
          <h1 className="text-50 md:text-40 font-serif fw-700 mb-20 text-white" data-anim-child="slide-up delay-2">Find Your Perfect Escape</h1>
          <p className="text-18 fw-500 mb-50 text-white/80" data-anim-child="slide-up delay-3">Select your dates to check real-time availability across our luxury estates.</p>

          {/* LUXURY GLASSMORPHIC SEARCH BAR */}
          <div 
            className="p-30 max-w-800 mx-auto rounded-16 relative" 
            style={{ 
              backdropFilter: 'blur(20px)', 
              WebkitBackdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255,255,255,0.08)', 
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }} 
            data-anim-child="slide-up delay-4"
          >
            <div className="row y-gap-20 items-end justify-center">
              <div className="col-md-5">
                <label className="text-12 fw-700 uppercase tracking-wider text-white mb-8 d-flex items-center">
                  <i className="icon-calendar-2 mr-8 text-accent-1 text-16"></i> Check-In
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="form-control-luxury w-1/1 text-white border-white/20 hover:border-white/40 focus:border-accent-1 transition-colors"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ 
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      colorScheme: 'dark' 
                    }}
                  />
                </div>
              </div>
              <div className="col-md-5">
                <label className="text-12 fw-700 uppercase tracking-wider text-white mb-8 d-flex items-center">
                   <i className="icon-calendar-2 mr-8 text-accent-1 text-16"></i> Check-Out
                </label>
                <div className="relative">
                  <input
                    type="date"
                    className="form-control-luxury w-1/1 text-white border-white/20 hover:border-white/40 focus:border-accent-1 transition-colors"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    style={{ 
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      colorScheme: 'dark' 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOGUE GRID */}
      <section className="layout-pt-lg layout-pb-lg bg-light-1">
        <div className="container">
          {loading ? (
            <div className="row y-gap-40">
              {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="col-lg-4 col-md-6">
                  <div className="bg-white rounded-16 shadow-lg h-full overflow-hidden">
                    <div className="ratio ratio-4:3 bg-light-2 animate-pulse"></div>
                    <div className="p-30">
                      <div className="h-24 bg-light-2 rounded w-3/4 mb-15 animate-pulse"></div>
                      <div className="h-16 bg-light-2 rounded w-1/2 mb-20 animate-pulse"></div>
                      <div className="h-16 bg-light-2 rounded w-full mb-10 animate-pulse"></div>
                      <div className="h-16 bg-light-2 rounded w-5/6 mb-30 animate-pulse"></div>
                      <div className="d-flex justify-between items-end border-top-light pt-20">
                        <div className="h-24 bg-light-2 rounded w-1/3 animate-pulse"></div>
                        <div className="h-40 bg-light-2 rounded w-1/3 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVillas.length === 0 ? (
            <div className="text-center py-80">
              <div className="size-80 mx-auto rounded-full bg-light-2 flex-center mb-20">
                <i className="icon-home text-30 text-sec"></i>
              </div>
              <h2 className="text-30 font-serif fw-700 text-dark-1 mb-10">No Villas Found</h2>
              <p className="text-16 text-sec max-w-400 mx-auto">We couldn't find any villas matching your criteria. Please try clearing your dates or checking back later.</p>
            </div>
          ) : (
            <div className="row y-gap-40">
              {filteredVillas.map((villa) => {
                const isChecked = !!(startDate && endDate);
                const isAvailable = availabilityMap[villa.id] !== false;
                
                return (
                  <div key={villa.id} className="col-lg-4 col-md-6">
                    <div className="bg-white rounded-16 shadow-md hover:shadow-xl transition-all duration-300 h-full d-flex flex-column overflow-hidden group border-1 border-light-2 hover:border-accent-1/20">
                      
                      {/* IMAGE CONTAINER */}
                      <div className="ratio ratio-4:3 relative overflow-hidden">
                        <Link to={`/our-villas/${villa.slug}`}>
                          <img
                            src={villa.heroImage}
                            alt={villa.name}
                            className="img-ratio transition-all duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-1/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>
                        
                        {/* AVAILABILITY BADGE */}
                        {isChecked && (
                          <div className={`absolute top-20 right-20 px-15 py-6 rounded-200 text-11 fw-700 uppercase tracking-wider text-white shadow-md transition-all z-2 ${isAvailable ? 'bg-emerald-600' : 'bg-dark-1'}`}>
                            {checkingAvailability ? (
                               <span className="d-flex items-center"><span className="spinner-border spinner-border-sm mr-5 size-12 border-2"></span> CHECKING...</span>
                            ) : isAvailable ? 'AVAILABLE' : 'SOLD OUT'}
                          </div>
                        )}
                        
                        {/* BEDROOM BADGE */}
                        <div className="absolute bottom-20 left-20 bg-white/95 backdrop-blur-md text-dark-1 px-15 py-6 rounded-200 text-11 fw-700 shadow-sm uppercase tracking-wider z-2 d-flex items-center border-1 border-white/20">
                          <i className="icon-star text-accent-1 text-10 mr-5"></i>
                          {villa.bedrooms.includes('4') ? '4BHK' : '1BHK'} LUXURY
                        </div>
                      </div>

                      {/* CONTENT CONTAINER */}
                      <div className="p-30 flex-grow-1 d-flex flex-column bg-white">
                        <h3 className="text-24 font-serif fw-700 text-dark-1 mb-15">
                          <Link to={`/our-villas/${villa.slug}`} className="hover-accent transition-colors">{villa.name}</Link>
                        </h3>
                        
                        {/* AMENITIES */}
                        <div className="d-flex items-center text-13 text-sec mb-20 flex-wrap y-gap-10 x-gap-20">
                          <div className="d-flex items-center"><i className="icon-bed mr-8 text-accent-1 text-16"></i>{villa.bedrooms}</div>
                          <div className="d-flex items-center"><i className="icon-bath mr-8 text-accent-1 text-16"></i>{villa.bathrooms}</div>
                          <div className="d-flex items-center"><i className="icon-guest mr-8 text-accent-1 text-16"></i>Up to {villa.maxGuests} Guests</div>
                        </div>

                        <p className="text-15 text-sec mb-30 line-clamp-3 flex-grow-1 leading-relaxed">
                          {villa.description}
                        </p>

                        {/* PRICING & ACTION */}
                        <div className="d-flex justify-between items-end border-top-light pt-20">
                          <div>
                            <div className="text-11 uppercase tracking-wider text-sec fw-700 mb-4">Starting from</div>
                            <div className="text-22 font-serif fw-700 text-dark-1">
                              ₹{villa.pricePerNight?.toLocaleString('en-IN')}
                              <span className="text-14 fw-500 text-sec font-sans ml-4">/night</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => {
                              if (startDate && endDate && isAvailable) {
                                navigate(`/checkout/${villa.id}`, { state: { startDate, endDate, guests: 1, villa } });
                              } else {
                                navigate(`/our-villas/${villa.slug}`);
                              }
                            }}
                            className={`button d-inline-flex items-center justify-center -sm rounded-200 px-25 py-12 fw-700 uppercase tracking-wider transition-all duration-300 ${isChecked && !isAvailable ? 'bg-light-2 text-sec cursor-not-allowed border-1 border-light-2' : 'bg-accent-1 text-white hover:bg-dark-1 shadow-sm hover:shadow-md'}`}
                            disabled={isChecked && !isAvailable && !checkingAvailability}
                          >
                            {isChecked && isAvailable ? (
                               <>BOOK NOW <i className="icon-arrow-right-2 ml-8 text-12"></i></>
                            ) : 'VIEW DETAILS'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <InstagramGrid />
      <BookingCTA />
    </>
  );
};
