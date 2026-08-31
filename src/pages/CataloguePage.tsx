import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { CatalogueVillaCard } from '../components/common/CatalogueVillaCard';
import { useVillas } from '../context/VillaContext';
import { coreApiService } from '../services/apiService';
import { InstagramGrid } from '../components/sections/InstagramGrid';
import { BookingCTA } from '../components/common/BookingCTA';
import { LuxuryDatePickerModal } from '../components/common/LuxuryDatePickerModal';

// Helper functions for timezone-safe date string formatting (YYYY-MM-DD)
const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTomorrowString = (fromDateStr?: string) => {
  let base: Date;
  if (fromDateStr) {
    const parts = fromDateStr.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      base = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      base = new Date();
    }
  } else {
    base = new Date();
  }
  base.setDate(base.getDate() + 1);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  const day = String(base.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const CataloguePage: React.FC = () => {
  const { villas, loading } = useVillas();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const todayStr = useMemo(() => getTodayString(), []);

  // Read initial params from URL or apply smart defaults:
  // - Default Check-In: Today's date
  // - Default Check-Out: Tomorrow's date (Check-In + 1 day)
  const rawCheckIn = searchParams.get('checkIn') || '';
  const initialCheckIn = rawCheckIn && rawCheckIn >= todayStr ? rawCheckIn : todayStr;

  const rawCheckOut = searchParams.get('checkOut') || '';
  const initialCheckOut = rawCheckOut && rawCheckOut > initialCheckIn 
    ? rawCheckOut 
    : getTomorrowString(initialCheckIn);

  const initialSearch = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [startDate, setStartDate] = useState(initialCheckIn);
  const [endDate, setEndDate] = useState(initialCheckOut);
  const [calendarMode, setCalendarMode] = useState<'checkIn' | 'checkOut' | null>(null);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'guests'>('default');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Sync state with URL search params
  const updateUrlParams = useCallback((inDate: string, outDate: string, q: string, cat: string) => {
    const params: Record<string, string> = {};
    if (inDate) params.checkIn = inDate;
    if (outDate) params.checkOut = outDate;
    if (q) params.q = q;
    if (cat && cat !== 'all') params.category = cat;
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Calculate stay duration in nights
  const nightsCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [startDate, endDate]);

  // Check availability concurrently across all villas
  const handleCheckAvailability = useCallback(async (inDate: string, outDate: string, guests: number) => {
    if (!inDate || !outDate || villas.length === 0) return;

    setCheckingAvailability(true);
    const newAvailMap: Record<string, boolean> = {};

    try {
      const results = await Promise.all(
        villas.map(async (villa) => {
          try {
            const res = await coreApiService.checkAvailability({
              offeringId: villa.offeringId || villa.id,
              startDate: new Date(inDate),
              endDate: new Date(outDate),
              guests: guests,
            });
            return { id: villa.id, available: res.available !== false };
          } catch (e) {
            return { id: villa.id, available: true };
          }
        })
      );

      results.forEach((item) => {
        newAvailMap[item.id] = item.available;
      });

      setAvailabilityMap(newAvailMap);
    } catch (err) {
      console.error('Availability check failed:', err);
    } finally {
      setCheckingAvailability(false);
    }
  }, [villas]);

  // Handle Check-In date change:
  // Enforce min today date, and automatically select the next day for Check-Out
  const handleStartDateChange = (val: string) => {
    let validStart = val;
    if (!validStart || validStart < todayStr) {
      validStart = todayStr;
    }

    setStartDate(validStart);
    const autoNextDay = getTomorrowString(validStart);
    setEndDate(autoNextDay);

    updateUrlParams(validStart, autoNextDay, searchQuery, activeCategory);
  };

  // Handle Check-Out date change:
  // Enforce min Check-In + 1 day
  const handleEndDateChange = (val: string) => {
    const minAllowedOut = getTomorrowString(startDate || todayStr);
    let validEnd = val;
    if (!validEnd || validEnd < minAllowedOut) {
      validEnd = minAllowedOut;
    }

    setEndDate(validEnd);
    updateUrlParams(startDate, validEnd, searchQuery, activeCategory);
  };

  // Reset filters back to default (Today & Tomorrow)
  const handleClearFilter = () => {
    const defaultIn = todayStr;
    const defaultOut = getTomorrowString(defaultIn);

    setStartDate(defaultIn);
    setEndDate(defaultOut);
    setSearchQuery('');
    setActiveCategory('all');
    setSortBy('default');
    setAvailabilityMap({});
    updateUrlParams(defaultIn, defaultOut, '', 'all');
  };

  // Trigger availability checks when valid date pair changes
  useEffect(() => {
    if (startDate && endDate && nightsCount > 0) {
      handleCheckAvailability(startDate, endDate, guestCount);
    } else {
      setAvailabilityMap({});
    }
  }, [startDate, endDate, nightsCount, guestCount, handleCheckAvailability]);

  // Filter & Sort Villas
  const processedVillas = useMemo(() => {
    let list = [...villas];

    // Search query filter (name, description, features)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q) ||
          v.bedrooms?.toLowerCase().includes(q) ||
          v.features?.some((f) => f.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (activeCategory === '4bhk') {
      list = list.filter((v) => v.bedrooms.includes('4'));
    } else if (activeCategory === '1bhk') {
      list = list.filter((v) => v.bedrooms.includes('1'));
    } else if (activeCategory === 'pool') {
      list = list.filter((v) => v.features?.some((f) => f.toLowerCase().includes('pool')));
    }

    // Availability toggle filter when dates are set
    if (startDate && endDate && Object.keys(availabilityMap).length > 0 && showAvailableOnly) {
      list = list.filter((v) => availabilityMap[v.id] !== false);
    }

    // Sorting logic
    if (sortBy === 'price-low') {
      list.sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.pricePerNight || 0) - (a.pricePerNight || 0));
    } else if (sortBy === 'guests') {
      list.sort((a, b) => (b.maxGuests || 0) - (a.maxGuests || 0));
    }

    return list;
  }, [villas, searchQuery, activeCategory, startDate, endDate, availabilityMap, showAvailableOnly, sortBy]);

  // Animation synchronization protocol post-load and post-filter
  useEffect(() => {
    if (!loading && villas.length > 0) {
      const timer = setTimeout(() => {
        if (typeof (window as any).initApp === 'function') {
          (window as any).initApp();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, villas.length, processedVillas.length]);

  return (
    <>
      <SEO
        title="Luxury Villa Catalogue | Woodland River Villas Alibaug"
        description="Explore 4BHK luxury estates & private pool cabanas in Alibaug. Check real-time availability, stay rates, and book direct with instant confirmation."
        canonical="https://www.woodlandriver.com/catalogue/"
      />

      {/* HERO IMAGE BANNER MATCHING HEADER HEIGHT */}
      <section className="relative bg-dark-1 overflow-hidden" style={{ height: '140px' }}>
        <div className="absolute inset-0">
          <img src="/assets/img/pageHero/4.png" alt="Woodland River Villa Catalogue" className="w-1/1 h-1/1 object-cover opacity-80" loading="eager" />
          <div className="absolute inset-0 bg-dark-1/30"></div>
        </div>
      </section>

      {/* ELEGANT SEARCH & DATE FILTER CARD WITH EXPLICIT PADDINGS & ROUNDED CORNERS */}
      <section className="relative pt-30 mb-50" style={{ position: 'relative', zIndex: calendarMode ? 1000 : 4 }}>
        <div className="container">
          <div 
            className="bg-white border-1 border-light-2"
            style={{
              padding: '36px 40px',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)'
            }}
          >
            <div className="row y-gap-20 x-gap-16 items-end">
              {/* CHECK-IN DATE PICKER */}
              <div className="col-lg col-md-6 relative">
                <label 
                  className="text-accent-1 mb-10 d-flex items-center"
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  <i className="icon-calendar-2 mr-8 text-accent-1 text-16"></i> Check-In Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    className="w-1/1 bg-light-1 border-1 border-light-2 focus:border-accent-1 text-dark-1 outline-none transition-all cursor-pointer"
                    style={{ 
                      height: '52px', 
                      borderRadius: '14px',
                      padding: '0 16px',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                    value={startDate ? new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select Check-In'}
                    onClick={() => setCalendarMode(calendarMode === 'checkIn' ? null : 'checkIn')}
                  />
                  <i className="icon-calendar absolute right-16 top-1/2 -translate-y-1/2 text-accent-1 text-14 pointer-events-none"></i>
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
                      updateUrlParams(selectedDate, newEnd, searchQuery, activeCategory);
                    }}
                    onClose={() => setCalendarMode(null)}
                  />
                )}
              </div>

              {/* CHECK-OUT DATE PICKER */}
              <div className="col-lg col-md-6 relative">
                <label 
                  className="text-accent-1 mb-10 d-flex items-center"
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  <i className="icon-calendar-2 mr-8 text-accent-1 text-16"></i> Check-Out Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    className="w-1/1 bg-light-1 border-1 border-light-2 focus:border-accent-1 text-dark-1 outline-none transition-all cursor-pointer"
                    style={{ 
                      height: '52px', 
                      borderRadius: '14px',
                      padding: '0 16px',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                    value={endDate ? new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select Check-Out'}
                    onClick={() => setCalendarMode(calendarMode === 'checkOut' ? null : 'checkOut')}
                  />
                  <i className="icon-calendar absolute right-16 top-1/2 -translate-y-1/2 text-accent-1 text-14 pointer-events-none"></i>
                </div>

                {calendarMode === 'checkOut' && (
                  <LuxuryDatePickerModal
                    mode="checkOut"
                    startDate={startDate}
                    endDate={endDate}
                    onSelectDate={(m, selectedDate) => {
                      setEndDate(selectedDate);
                      updateUrlParams(startDate, selectedDate, searchQuery, activeCategory);
                    }}
                    onClose={() => setCalendarMode(null)}
                  />
                )}
              </div>

              {/* GUESTS SELECTOR */}
              <div className="col-lg col-md-6">
                <label 
                  className="text-accent-1 mb-10 d-flex items-center"
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  <i className="icon-guest mr-8 text-accent-1 text-16"></i> Total Guests
                </label>
                <div className="relative">
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-1/1 bg-light-1 border-1 border-light-2 focus:border-accent-1 text-dark-1 cursor-pointer outline-none transition-all"
                    style={{ 
                      height: '52px', 
                      borderRadius: '14px',
                      padding: '0 16px',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={4}>4 Guests</option>
                    <option value={8}>8 Guests</option>
                    <option value={12}>12 Guests</option>
                    <option value={16}>16+ Guests</option>
                  </select>
                </div>
              </div>

              {/* SORT BY DROPDOWN */}
              <div className="col-lg col-md-6">
                <label 
                  className="text-accent-1 mb-10 d-flex items-center"
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  <i className="icon-search mr-8 text-accent-1 text-16"></i> Sort By
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-1/1 bg-light-1 border-1 border-light-2 focus:border-accent-1 text-dark-1 cursor-pointer outline-none transition-all"
                    style={{ 
                      height: '52px', 
                      borderRadius: '14px',
                      padding: '0 16px',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    <option value="default">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="guests">Capacity: Most</option>
                  </select>
                </div>
              </div>

              {/* RESET SEARCH BUTTON */}
              <div className="col-lg col-md-6">
                <button
                  onClick={handleClearFilter}
                  className="button w-1/1 bg-dark-1 text-white hover:bg-accent-1 transition-all d-flex items-center justify-center shadow-md group"
                  style={{ 
                    height: '52px', 
                    borderRadius: '14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  <i className="icon-close mr-8 text-14 group-hover:rotate-90 transition-transform duration-300"></i> Reset
                </button>
              </div>
            </div>

            {/* STAY DURATION & AVAILABILITY TOGGLE BAR */}
            {startDate && endDate && (
              <div 
                className="d-flex items-center justify-between flex-wrap" 
                style={{ 
                  marginTop: '28px',
                  paddingTop: '22px',
                  borderTop: '1px solid #F1F5F9',
                  gap: '16px' 
                }}
              >
                <div className="d-flex items-center text-dark-1" style={{ gap: '14px', fontSize: '14px', fontWeight: 600 }}>
                  <span 
                    className="bg-accent-1 text-white shadow-sm"
                    style={{
                      padding: '6px 14px',
                      borderRadius: '200px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {nightsCount} {nightsCount === 1 ? 'NIGHT' : 'NIGHTS'} STAY
                  </span>
                  <span>
                    {new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} — {new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <label className="text-14 text-dark-1 font-medium cursor-pointer d-flex items-center select-none" style={{ fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    className="mr-10 accent-accent-1"
                    style={{ width: '16px', height: '16px' }}
                    checked={showAvailableOnly}
                    onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  />
                  Hide unavailable villas for selected dates
                </label>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CATALOGUE GRID SECTION */}
      <section className="layout-pb-lg bg-light-1 pt-10">
        <div className="container">

          {/* VILLA CARDS GRID */}
          {loading ? (
            <div className="row y-gap-40">
              {[1, 2, 3].map((s) => (
                <div key={s} className="col-lg-4 col-md-6">
                  <div className="bg-white rounded-24 p-30 border-1 border-light-2 shadow-md animate-pulse">
                    <div className="h-200 bg-light-2 rounded-16 mb-20"></div>
                    <div className="h-24 bg-light-2 rounded w-3/4 mb-12"></div>
                    <div className="h-16 bg-light-2 rounded w-1/2 mb-20"></div>
                    <div className="h-40 bg-light-2 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : processedVillas.length === 0 ? (
            <div className="text-center py-90 bg-white rounded-24 p-40 border-1 border-light-2 shadow-sm">
              <h3 className="text-26 font-serif font-bold text-dark-1 mb-10">No Matching Villas Found</h3>
              <p className="text-15 text-sec mb-25 max-w-400 mx-auto">
                We couldn't find any villas matching your filter criteria. Try clearing dates or selecting a different category.
              </p>
              <button
                onClick={handleClearFilter}
                className="button d-inline-flex -md bg-accent-1 text-white rounded-200 px-30 py-12 text-13 font-bold uppercase tracking-wider"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="row y-gap-40">
              {processedVillas.map((villa) => {
                const isAvailable = availabilityMap[villa.id] !== false;

                return (
                  <div key={villa.id} className="col-lg-4 col-md-6">
                    <CatalogueVillaCard
                      villa={villa}
                      startDate={startDate}
                      endDate={endDate}
                      nightsCount={nightsCount}
                      isAvailable={isAvailable}
                      checkingAvailability={checkingAvailability}
                      onBookNow={() => {
                        if (startDate && endDate && isAvailable) {
                          navigate(`/checkout/${villa.id}`, {
                            state: { startDate, endDate, guests: guestCount, villa },
                          });
                        } else {
                          navigate(`/our-villas/${villa.slug}`);
                        }
                      }}
                    />
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
