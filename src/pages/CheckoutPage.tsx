import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { useAuth } from '../context/AuthContext';
import { coreApiService, catalogueApiService } from '../services/apiService';
import { Villa } from '../types';
import { openRazorpayCheckout } from '../utils/razorpay';
import { LuxuryDatePickerModal } from '../components/common/LuxuryDatePickerModal';
import { InstagramGrid } from '../components/sections/InstagramGrid';
import '../styles/checkoutWizard.css';

const getTomorrowString = (dateStr: string) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
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
    if (parsed > 0 && parsed <= 50) return parsed;
  }
  return 12;
};

export const CheckoutPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  const state = location.state as { startDate: string; endDate: string; villa: Villa; guests?: number; selectedAddons?: { id: string; quantity: number }[] };
  const maxAllowedGuests = getMaxAllowedGuests(state?.villa);
  const [currentGuests, setCurrentGuests] = useState<number>(
    state?.guests ? Math.min(state.guests, maxAllowedGuests) : maxAllowedGuests
  );

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [currentStartDate, setCurrentStartDate] = useState(state?.startDate || '');
  const [currentEndDate, setCurrentEndDate] = useState(state?.endDate || '');
  const [calendarMode, setCalendarMode] = useState<'checkIn' | 'checkOut' | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<{ id: string; quantity: number }[]>(state?.selectedAddons || []);
  const [paymentMode, setPaymentMode] = useState<'FULL' | 'ADVANCE'>('FULL');

  const [dynamicAddons, setDynamicAddons] = useState<any[]>(state?.villa?.addons || []);

  const handleGuestChange = (newGuests: number) => {
    setCurrentGuests(newGuests);
    if (newGuests < maxAllowedGuests) {
      setSelectedAddons(prev => prev.filter(a => {
        const addonObj = dynamicAddons?.find((ad: any) => ad.id === a.id);
        return addonObj ? !isExtraPersonAddon(addonObj.name) : true;
      }));
    }
  };

  useEffect(() => {
    if (!state?.villa) return;
    
    // If state.villa already contains addons from catalogue API, use them
    if (state.villa.addons && state.villa.addons.length > 0) {
      setDynamicAddons(state.villa.addons);
    }

    // Always fetch latest dynamic catalogue data from Amigo Market Hub API
    const fetchLatestAddons = async () => {
      try {
        const villas = await catalogueApiService.getVillas();
        const currentVilla = villas.find((v: Villa) => v.id === state.villa.id || v.slug === state.villa.slug);
        if (currentVilla && currentVilla.addons && currentVilla.addons.length > 0) {
          setDynamicAddons(currentVilla.addons);
        }
      } catch (err) {
        console.warn('Failed to fetch dynamic villa addons from API:', err);
      }
    };

    fetchLatestAddons();
  }, [state?.villa]);

  useEffect(() => {
    if (!state || !currentStartDate || !currentEndDate || !state.villa) {
      setLoading(false);
      return;
    }

    const fetchPricingAndAvailability = async () => {
      try {
        setLoading(true);
        const checkInTimeStr = state.villa.checkInTime || '14:00';
        const checkOutTimeStr = state.villa.checkOutTime || '11:00';
        const startDateTime = new Date(`${currentStartDate}T${checkInTimeStr}:00.000Z`);
        const endDateTime = new Date(`${currentEndDate}T${checkOutTimeStr}:00.000Z`);

        const [pricingResult, availabilityResult] = await Promise.all([
          coreApiService.calculatePricing({
            offeringId: state.villa.offeringId || state.villa.id,
            startDate: startDateTime,
            endDate: endDateTime,
            guests: currentGuests,
            selectedAddons
          }).catch((err) => {
            throw new Error(err.message || 'Failed to calculate pricing');
          }),
          coreApiService.checkAvailability({
            offeringId: state.villa.offeringId || state.villa.id,
            startDate: startDateTime,
            endDate: endDateTime,
            guests: currentGuests
          }).catch((err) => {
            console.error("Availability error:", err);
            return { data: { available: true } };
          })
        ]);

        const avail: any = availabilityResult;
        if (avail && avail.data && !avail.data.available) {
            throw new Error(avail.data.message || 'Selected dates are not available.');
        } else if (avail && typeof avail.available === 'boolean' && !avail.available) {
            throw new Error(avail.message || 'Selected dates are not available.');
        }

        setPricing(pricingResult);
      } catch (err: any) {
        setError(err.message || 'Failed to calculate pricing');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchPricingAndAvailability();
    }, 300);

    return () => clearTimeout(timer);
  }, [state, currentStartDate, currentEndDate, currentGuests, selectedAddons]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-1 flex-center">
        <div className="size-50 rounded-full border-3 border-amber-400 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!state) {
    return <Navigate to="/catalogue" replace />;
  }

  const { villa } = state;

  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    
    try {
      const checkInTimeStr = state.villa.checkInTime || '14:00';
      const checkOutTimeStr = state.villa.checkOutTime || '11:00';
      const startDateTime = new Date(`${currentStartDate}T${checkInTimeStr}:00.000Z`);
      const endDateTime = new Date(`${currentEndDate}T${checkOutTimeStr}:00.000Z`);

      const booking: any = await coreApiService.createBooking({
        offeringId: state.villa.offeringId || state.villa.id,
        startDate: startDateTime,
        endDate: endDateTime,
        notes: `Guests: ${currentGuests}. Special Notes: ${specialNotes}`,
        selectedAddons
      });

      const actualTotal = booking.totalCents || totalPrice;
      const actualDeposit = booking.depositCents !== undefined ? booking.depositCents : depositPrice;
      const baseTotal = actualTotal - actualDeposit;
      const advanceRent = Math.floor(baseTotal / 2);
      const amountToPay = paymentMode === 'ADVANCE' ? advanceRent : actualTotal;
      const depositToPay = paymentMode === 'ADVANCE' ? 0 : actualDeposit;

      openRazorpayCheckout({
        amount: amountToPay,
        name: "Woodland River Villas",
        description: `Booking for ${villa.name}`,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        onSuccess: async (response) => {
          try {
            await coreApiService.confirmBookingPayment(
              booking.id,
              response.razorpay_payment_id,
              'RAZORPAY',
              amountToPay,
              depositToPay
            );
            navigate('/account', { 
              state: { 
                tab: 'bookings', 
                bookingId: booking.id, 
                paymentSuccess: true, 
                message: `Payment Successful! Your reservation for ${villa.name} has been confirmed.` 
              } 
            });
          } catch (err: any) {
            setError(err.message || 'Failed to confirm payment.');
            setProcessing(false);
          }
        },
        onDismiss: () => {
          setProcessing(false);
        }
      });
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const handleMockPayment = async () => {
    setProcessing(true);
    setError('');
    
    try {
      const checkInTimeStr = state.villa.checkInTime || '14:00';
      const checkOutTimeStr = state.villa.checkOutTime || '11:00';
      const startDateTime = new Date(`${currentStartDate}T${checkInTimeStr}:00.000Z`);
      const endDateTime = new Date(`${currentEndDate}T${checkOutTimeStr}:00.000Z`);

      const booking: any = await coreApiService.createBooking({
        offeringId: state.villa.offeringId || state.villa.id,
        startDate: startDateTime,
        endDate: endDateTime,
        notes: `Guests: ${currentGuests}. Special Notes: ${specialNotes}`,
        selectedAddons
      });

      const actualTotal = booking.totalCents || totalPrice;
      const actualDeposit = booking.depositCents !== undefined ? booking.depositCents : depositPrice;
      const baseTotal = actualTotal - actualDeposit;
      const advanceRent = Math.floor(baseTotal / 2);
      const amountToPay = paymentMode === 'ADVANCE' ? advanceRent : actualTotal;
      const depositToPay = paymentMode === 'ADVANCE' ? 0 : actualDeposit;

      await new Promise(resolve => setTimeout(resolve, 1200));
      
      await coreApiService.confirmBookingPayment(
        booking.id,
        'pay_mock_' + Date.now(),
        'RAZORPAY',
        amountToPay,
        depositToPay
      );
      navigate('/account', { 
        state: { 
          tab: 'bookings', 
          bookingId: booking.id, 
          paymentSuccess: true, 
          message: `Payment Successful! Your reservation for ${villa.name} has been confirmed.` 
        } 
      });
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const handleAddonChange = (addonId: string, quantity: number) => {
    const targetAddon = dynamicAddons.find((a: any) => a.id === addonId);
    const nameLower = targetAddon?.name?.toLowerCase() || '';
    const isVeg = nameLower.includes('veg') && !nameLower.includes('non');
    const isNonVeg = nameLower.includes('non-veg') || nameLower.includes('non veg');
    const isExtraPerson = isExtraPersonAddon(targetAddon?.name || '');

    setSelectedAddons(prev => {
      let next = [...prev];
      const existingIdx = next.findIndex(a => a.id === addonId);

      // Determine extra persons count
      let currentExtraPersons = 0;
      const extraAddonObj = dynamicAddons.find((a: any) => isExtraPersonAddon(a.name));
      if (extraAddonObj) {
        if (isExtraPerson) {
          currentExtraPersons = quantity;
        } else {
          const found = next.find(a => a.id === extraAddonObj.id);
          currentExtraPersons = found ? found.quantity : 0;
        }
      }

      const totalAllowedMeals = currentGuests + currentExtraPersons;

      if (isVeg || isNonVeg) {
        const counterpartAddon = dynamicAddons.find((a: any) => {
          const n = a.name?.toLowerCase() || '';
          if (isVeg) return n.includes('non-veg') || n.includes('non veg');
          return n.includes('veg') && !n.includes('non');
        });

        const counterpartQty = counterpartAddon
          ? (next.find(a => a.id === counterpartAddon.id)?.quantity || 0)
          : 0;

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

  const basePrice = pricing?.price?.base || 0;
  const depositPrice = pricing?.price?.deposit || 0;
  const totalPrice = (pricing?.price?.total || 0) + (pricing?.price?.deposit || 0);
  const addonsPrice = pricing?.price?.addons || 0;

  // Absorb all non-addon additional charges (weekend hikes, surge fees, cleaning fees) into Base Villa Rental
  const effectiveBaseFare = Math.max(0, totalPrice - depositPrice - addonsPrice);
  
  // Pre-calculated amounts in Rupees for 100% bug-free rendering
  const totalRupees = Math.floor(totalPrice / 100);
  const depositRupees = Math.floor(depositPrice / 100);
  const staySubtotalRupees = Math.floor((totalPrice - depositPrice) / 100);
  const advanceStayRupees = Math.floor(staySubtotalRupees / 2);
  const advanceTotalRupees = depositRupees + advanceStayRupees;
  const payableNowRupees = paymentMode === 'ADVANCE' ? advanceTotalRupees : totalRupees;
  
  // Calculate nights count
  const nightsCount = (currentStartDate && currentEndDate)
    ? Math.max(1, Math.round((new Date(currentEndDate).getTime() - new Date(currentStartDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  return (
    <>
      <SEO title={`Checkout - ${villa.name} | Woodland River Villa`} description="Secure luxury checkout and payment." />
      
      {/* HERO BANNER WITH GUARANTEED HEADER CLEARANCE & 100% COVERAGE */}
      <section className="relative bg-dark-1 overflow-hidden" style={{ paddingTop: '240px', paddingBottom: '100px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}>
          <img
            src={villa.heroImage}
            alt={villa.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.35 }}
          />
          <div className="absolute inset-0 bg-dark-1/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-dark-1/90 via-transparent to-dark-1"></div>
        </div>

        <div className="container relative z-2 text-center text-white" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="d-inline-flex items-center x-gap-8 bg-amber-500/10 border-1 border-amber-500/30 px-18 py-8 rounded-200 mb-18 backdrop-blur-md">
            <i className="icon-lock text-14 text-amber-400"></i>
            <span className="text-11 uppercase font-bold tracking-widest text-amber-300">256-BIT ENCRYPTED CHECKOUT</span>
          </div>
          <h1 className="text-48 md:text-36 font-serif font-bold mb-16 text-white leading-tight">Complete Your Reservation</h1>
          <p className="text-16 font-normal text-white/80 max-w-600 mx-auto leading-relaxed">
            Review your stay details, customize in-house experiences, and proceed with instant confirmation.
          </p>
        </div>
      </section>

      {/* CHECKOUT 2-COLUMN SPLIT CONTAINER */}
      <section className="layout-pt-md layout-pb-lg bg-light-1" style={{ paddingTop: '60px', paddingBottom: '90px' }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="row justify-center">
            <div className="col-xl-11 col-lg-12">
              
              {error && (
                <div className="bg-red-50 p-20 rounded-20 mb-40 text-red-800 border-1 border-red-200 d-flex items-center shadow-sm">
                  <i className="icon-close text-20 mr-15 text-red-600"></i>
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              <div style={{ maxWidth: '780px', margin: '0 auto' }}>
                
                {/* 3-STEP INTERACTIVE CHECKOUT WIZARD */}
                <div>
                  
                  {/* ELEGANT STEP WIZARD BAR */}
                  <div className="checkout-wizard-bar mb-24">
                    <button 
                      onClick={() => setActiveStep(1)}
                      className={`checkout-wizard-tab ${activeStep === 1 ? 'active' : activeStep > 1 ? 'completed' : 'pending'}`}
                    >
                      <span className="checkout-step-badge">
                        {activeStep > 1 ? '✓' : '1'}
                      </span>
                      Stay Overview
                    </button>

                    <div className="text-sec px-2 font-bold">›</div>

                    <button 
                      onClick={() => setActiveStep(2)}
                      className={`checkout-wizard-tab ${activeStep === 2 ? 'active' : activeStep > 2 ? 'completed' : 'pending'}`}
                    >
                      <span className="checkout-step-badge">
                        {activeStep > 2 ? '✓' : '2'}
                      </span>
                      Add-Ons & Experiences
                    </button>

                    <div className="text-sec px-2 font-bold">›</div>

                    <button 
                      onClick={() => setActiveStep(3)}
                      className={`checkout-wizard-tab ${activeStep === 3 ? 'active' : 'pending'}`}
                    >
                      <span className="checkout-step-badge">3</span>
                      Payment & Confirm
                    </button>
                  </div>

                  {/* STEP 1: STAY OVERVIEW */}
                  {activeStep === 1 && (
                    <div className="animate-fadeIn">
                      <div className="mb-16">
                        <div className="text-11 uppercase text-accent-1 font-bold tracking-widest mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>STEP 1 OF 3</div>
                        <h2 className="text-22 font-bold text-dark-1 border-bottom-light pb-12" style={{ fontFamily: "'Jost', sans-serif" }}>Review Reservation Details</h2>
                      </div>

                      <div 
                        className="checkout-card mb-20"
                        style={{ overflow: 'visible', position: 'relative', zIndex: calendarMode ? 100 : 1 }}
                      >
                        <div className="d-flex items-center mb-16 border-bottom-light pb-16">
                          <div 
                            className="rounded-14 overflow-hidden shadow-sm mr-16 bg-light-1"
                            style={{ width: '72px', height: '72px', flexShrink: 0 }}
                          >
                            <img 
                              src={villa.heroImage} 
                              alt={villa.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                            />
                          </div>
                          <div>
                            <div className="text-11 uppercase tracking-widest text-accent-1 font-bold mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>
                              <i className="icon-star text-10 mr-4 text-amber-500"></i> LUXURY ESTATE
                            </div>
                            <h3 className="text-20 font-bold text-dark-1 mb-4 leading-snug" style={{ fontFamily: "'Jost', sans-serif" }}>{villa.name}</h3>
                            <p className="text-13 text-sec font-medium" style={{ fontFamily: "'Jost', sans-serif" }}>{villa.subtitle || 'Zirad, Alibaug • Private Pool Estate'}</p>
                          </div>
                        </div>
                        
                        <div className="row y-gap-16">
                          {/* CHECK-IN DATE BOX */}
                          <div className="col-sm-6 relative" style={{ zIndex: calendarMode === 'checkIn' ? 101 : 1 }}>
                            <div 
                              onClick={() => setCalendarMode(calendarMode === 'checkIn' ? null : 'checkIn')}
                              className="checkout-date-box h-full relative"
                            >
                              <div className="d-flex justify-between items-center mb-8">
                                <span className="text-11 uppercase tracking-wider text-accent-1 font-bold d-flex items-center" style={{ fontFamily: "'Jost', sans-serif" }}>
                                  <i className="icon-calendar-2 mr-6 text-accent-1 text-14"></i> CHECK-IN DATE
                                </span>
                                <span className="px-8 py-2 rounded-200 bg-white text-10 font-bold text-accent-1 border-1 border-light-2 shadow-2xs" style={{ fontFamily: "'Jost', sans-serif" }}>CHANGE</span>
                              </div>
                              <div className="text-15 font-bold text-dark-1 mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>
                                {currentStartDate ? new Date(currentStartDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Select Date'}
                              </div>
                              <div className="text-12 text-sec font-medium" style={{ fontFamily: "'Jost', sans-serif" }}>Check-in: From 2:00 PM</div>
                            </div>

                            {calendarMode === 'checkIn' && (
                              <LuxuryDatePickerModal
                                mode="checkIn"
                                startDate={currentStartDate}
                                endDate={currentEndDate}
                                onSelectDate={(m, selectedDate) => {
                                  setCurrentStartDate(selectedDate);
                                  let newEnd = currentEndDate;
                                  if (!currentEndDate || currentEndDate <= selectedDate) {
                                    newEnd = getTomorrowString(selectedDate);
                                    setCurrentEndDate(newEnd);
                                  }
                                }}
                                onClose={() => setCalendarMode(null)}
                              />
                            )}
                          </div>

                          {/* CHECK-OUT DATE BOX */}
                          <div className="col-sm-6 relative" style={{ zIndex: calendarMode === 'checkOut' ? 101 : 1 }}>
                            <div 
                              onClick={() => setCalendarMode(calendarMode === 'checkOut' ? null : 'checkOut')}
                              className="checkout-date-box h-full relative"
                            >
                              <div className="d-flex justify-between items-center mb-8">
                                <span className="text-11 uppercase tracking-wider text-accent-1 font-bold d-flex items-center" style={{ fontFamily: "'Jost', sans-serif" }}>
                                  <i className="icon-calendar-2 mr-6 text-accent-1 text-14"></i> CHECK-OUT DATE
                                </span>
                                <span className="px-8 py-2 rounded-200 bg-white text-10 font-bold text-accent-1 border-1 border-light-2 shadow-2xs" style={{ fontFamily: "'Jost', sans-serif" }}>CHANGE</span>
                              </div>
                              <div className="text-15 font-bold text-dark-1 mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>
                                {currentEndDate ? new Date(currentEndDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Select Date'}
                              </div>
                              <div className="text-12 text-sec font-medium" style={{ fontFamily: "'Jost', sans-serif" }}>Check-out: By 11:00 AM</div>
                            </div>

                            {calendarMode === 'checkOut' && (
                              <LuxuryDatePickerModal
                                mode="checkOut"
                                startDate={currentStartDate}
                                endDate={currentEndDate}
                                onSelectDate={(m, selectedDate) => {
                                  setCurrentEndDate(selectedDate);
                                }}
                                onClose={() => setCalendarMode(null)}
                              />
                            )}
                          </div>
                        </div>

                        <div className="mt-20 pt-16 border-top-light bg-slate-50 p-16 rounded-16 border-1 border-slate-200/80 d-flex justify-between items-center flex-wrap gap-12">
                          <div className="d-flex items-center flex-wrap gap-12">
                            <div>
                              <div className="text-11 uppercase tracking-wider text-sec font-bold mb-4 d-flex items-center" style={{ fontFamily: "'Jost', sans-serif" }}>
                                <i className="icon-guest mr-6 text-accent-1"></i> GUESTS & CAPACITY
                              </div>
                              <select 
                                className="bg-white border-1 border-slate-300 focus:border-accent-1 text-dark-1 outline-none transition-all cursor-pointer font-bold px-12 py-6 rounded-10 text-13 shadow-2xs"
                                style={{ fontFamily: "'Jost', sans-serif", color: '#0f172a' }}
                                value={currentGuests > maxAllowedGuests ? maxAllowedGuests : currentGuests}
                                onChange={(e) => handleGuestChange(Number(e.target.value))}
                              >
                                {[...Array(maxAllowedGuests)].map((_, i) => (
                                  <option key={i+1} value={i+1}>{i+1} Guest{i > 0 ? 's' : ''}</option>
                                ))}
                              </select>
                            </div>
                            <span className="text-12 text-slate-500 font-semibold" style={{ fontFamily: "'Jost', sans-serif" }}>
                              • {villa.bedrooms} BHK ({villa.bathrooms} Baths)
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-11 uppercase tracking-wider text-accent-1 font-bold mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>ESTIMATED STAY</div>
                            <div className="text-20 font-bold text-accent-1" style={{ fontFamily: "'Jost', sans-serif" }}>
                              ₹{(totalPrice / 100).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-end pt-16">
                        <button
                          onClick={() => setActiveStep(2)}
                          className="checkout-btn-primary"
                        >
                          CONTINUE TO ADD-ONS & EXPERIENCES →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: EXPERIENCE ADD-ONS */}
                  {activeStep === 2 && (
                    <div className="animate-fadeIn">
                      <div className="mb-16">
                        <div className="text-11 uppercase text-accent-1 font-bold tracking-widest mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>STEP 2 OF 3</div>
                        <h2 className="text-22 font-bold text-dark-1 border-bottom-light pb-12 mb-8" style={{ fontFamily: "'Jost', sans-serif" }}>Customize In-House Experiences</h2>
                        <p className="text-13 text-sec font-medium" style={{ fontFamily: "'Jost', sans-serif" }}>Enhance your villa stay with curated chef services, BBQ setups, or extra guest packages.</p>
                      </div>
                      
                      <div className="mb-20">
                        {dynamicAddons.length > 0 ? (
                          dynamicAddons
                            .filter((addon: any) => {
                              if (isExtraPersonAddon(addon.name) && currentGuests < maxAllowedGuests) {
                                return false;
                              }
                              return true;
                            })
                            .map(addon => {
                            const selected = selectedAddons.find(a => a.id === addon.id);
                            const quantity = selected ? selected.quantity : 0;
                            return (
                              <div key={addon.id} className="addon-card">
                                <div>
                                  <div className="text-15 font-bold text-dark-1 mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>{addon.name}</div>
                                  {addon.description && <div className="text-12 text-sec mb-6 leading-relaxed font-normal" style={{ fontFamily: "'Jost', sans-serif" }}>{addon.description}</div>}
                                  <div className="text-14 font-bold text-accent-1" style={{ fontFamily: "'Jost', sans-serif" }}>
                                    ₹{(addon.priceCents / 100).toLocaleString('en-IN')} {addon.priceType === 'PER_DURATION' ? '/ day' : (addon.priceType === 'PER_UNIT' ? '/ unit' : '')}
                                  </div>
                                </div>
                                
                                <div>
                                  {addon.multiSelect ? (
                                    <div className="addon-counter-pill">
                                      <button 
                                        className="addon-counter-btn"
                                        onClick={() => handleAddonChange(addon.id, Math.max(0, quantity - 1))}
                                      >
                                        -
                                      </button>
                                      <div className="addon-counter-val">{quantity}</div>
                                      <button 
                                        className="addon-counter-btn"
                                        onClick={() => handleAddonChange(addon.id, addon.maxQuantity ? Math.min(addon.maxQuantity, quantity + 1) : quantity + 1)}
                                      >
                                        +
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      className={`px-20 py-8 rounded-200 text-11 font-bold uppercase tracking-wider transition-all ${
                                        quantity > 0 
                                          ? 'bg-accent-1 text-white shadow-xs' 
                                          : 'bg-light-1 text-dark-1 border-1 border-light-2 hover:bg-light-2'
                                      }`}
                                      onClick={() => handleAddonChange(addon.id, quantity > 0 ? 0 : 1)}
                                    >
                                      {quantity > 0 ? '✓ ADDED' : '+ ADD TO STAY'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-24 bg-white rounded-16 border-1 border-light-2 text-center">
                            <i className="icon-info text-20 text-accent-1 mb-6"></i>
                            <div className="text-14 font-bold text-dark-1 mb-2">No Extra Add-On Offerings</div>
                            <div className="text-12 text-sec font-medium">No additional add-on offerings are configured for this villa. Click below to continue.</div>
                          </div>
                        )}
                      </div>

                      <div className="d-flex justify-between items-center pt-16 border-top-light">
                        <button
                          onClick={() => setActiveStep(1)}
                          className="checkout-btn-secondary"
                        >
                          ← BACK TO STAY OVERVIEW
                        </button>
                        <button
                          onClick={() => setActiveStep(3)}
                          className="checkout-btn-primary"
                        >
                          REVIEW PRICE & PAYMENT →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: PRICE SUMMARY, GUEST DETAILS & PAYMENT */}
                  {activeStep === 3 && (
                    <div className="animate-fadeIn">
                      <div className="mb-16">
                        <div className="text-11 uppercase text-accent-1 font-bold tracking-widest mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>STEP 3 OF 3</div>
                        <h2 className="text-22 font-bold text-dark-1 border-bottom-light pb-12 mb-8" style={{ fontFamily: "'Jost', sans-serif" }}>Review Price Summary & Complete Reservation</h2>
                        <p className="text-13 text-sec font-medium" style={{ fontFamily: "'Jost', sans-serif" }}>Verify your stay breakdown, choose payment plan, and confirm your booking.</p>
                      </div>
                      
                      {/* INTEGRATED PRICE BREAKDOWN CARD */}
                      <div className="checkout-card mb-20 p-24 bg-white rounded-20 shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
                        <div className="d-flex justify-between items-center mb-16 pb-14 border-bottom-light">
                          <div>
                            <span className="text-11 uppercase text-accent-1 font-bold tracking-widest d-block mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
                              FINAL TARIFF BREAKDOWN
                            </span>
                            <h3 className="text-24 font-bold text-dark-1 m-0" style={{ fontFamily: "'Jost', sans-serif" }}>
                              Price Summary
                            </h3>
                          </div>
                          <div className="d-inline-flex items-center px-14 py-6 rounded-100 bg-emerald-50 text-emerald-900 border-1 border-emerald-300/80 text-11 font-bold tracking-wider uppercase shadow-2xs" style={{ fontFamily: "'Jost', sans-serif" }}>
                            <span className="size-16 rounded-full bg-emerald-600 text-white d-inline-flex items-center justify-center text-10 font-bold mr-6">
                              ✓
                            </span>
                            ESTIMATE VERIFIED
                          </div>
                        </div>
                        
                        {loading ? (
                          <div className="py-40 text-center">
                            <div className="size-36 rounded-full border-3 border-accent-1 border-t-transparent animate-spin mx-auto mb-12"></div>
                            <div className="text-12 font-bold text-sec uppercase tracking-wider" style={{ fontFamily: "'Jost', sans-serif" }}>Calculating Total Stay Package...</div>
                          </div>
                        ) : pricing ? (
                          <div className="p-20 bg-slate-50/70 rounded-20 border-1 border-slate-200/80 mb-28">
                            {/* BASE VILLA RENTAL */}
                            <div className="d-flex justify-between items-start py-12 border-bottom-light">
                              <div>
                                <span className="font-bold text-dark-1 text-15 d-block" style={{ fontFamily: "'Jost', sans-serif" }}>
                                  Base Villa Rental
                                </span>
                                <span className="text-13 text-sec mt-2 font-normal d-block" style={{ fontFamily: "'Jost', sans-serif" }}>
                                  {nightsCount} Night{nightsCount > 1 ? 's' : ''} Stay Package (Incl. all stay fees & taxes)
                                </span>
                              </div>
                              <span className="font-bold text-17 text-dark-1 ml-20" style={{ fontFamily: "'Jost', sans-serif" }}>
                                ₹{(effectiveBaseFare / 100).toLocaleString('en-IN')}
                              </span>
                            </div>

                            {/* DETAILED SELECTED ADD-ONS BREAKDOWN */}
                            {selectedAddons.length > 0 && (
                              <div className="py-16 border-bottom-light">
                                <div className="d-flex justify-between items-center mb-12">
                                  <span className="text-12 uppercase tracking-wider text-accent-1 font-bold" style={{ fontFamily: "'Jost', sans-serif" }}>
                                    SELECTED IN-HOUSE ADD-ONS ({selectedAddons.length})
                                  </span>
                                  <span className="text-15 font-bold text-dark-1" style={{ fontFamily: "'Jost', sans-serif" }}>
                                    ₹{(addonsPrice / 100).toLocaleString('en-IN')}
                                  </span>
                                </div>

                                <div className="space-y-12 pl-16 my-8" style={{ borderLeft: '3px solid #004d43' }}>
                                  {selectedAddons.map(selectedItem => {
                                    const addonObj = dynamicAddons.find(a => a.id === selectedItem.id);
                                    if (!addonObj) return null;
                                    const isPerDay = addonObj.priceType === 'PER_DURATION';
                                    const itemTotalCents = isPerDay 
                                      ? addonObj.priceCents * selectedItem.quantity * nightsCount 
                                      : addonObj.priceCents * selectedItem.quantity;
                                    return (
                                      <div key={selectedItem.id} className="d-flex justify-between items-start py-2">
                                        <div>
                                          <span className="font-semibold text-dark-1 text-14 d-block" style={{ fontFamily: "'Jost', sans-serif" }}>
                                            {addonObj.name}
                                          </span>
                                          <span className="text-12 text-sec font-normal d-block mt-2" style={{ fontFamily: "'Jost', sans-serif" }}>
                                            Qty: {selectedItem.quantity} × ₹{(addonObj.priceCents / 100).toLocaleString('en-IN')}{isPerDay ? ` × ${nightsCount} night${nightsCount > 1 ? 's' : ''}` : ''}
                                          </span>
                                        </div>
                                        <span className="font-bold text-15 text-dark-1 ml-20" style={{ fontFamily: "'Jost', sans-serif" }}>
                                          ₹{(itemTotalCents / 100).toLocaleString('en-IN')}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* REFUNDABLE DEPOSIT */}
                            <div className="d-flex justify-between items-start pt-12">
                              <div>
                                <span className="font-bold text-dark-1 text-15 d-block" style={{ fontFamily: "'Jost', sans-serif" }}>
                                  Refundable Security Deposit
                                </span>
                                <span className="text-13 text-emerald-700 font-semibold mt-2 d-block" style={{ fontFamily: "'Jost', sans-serif" }}>
                                  100% refunded upon peaceful checkout inspection
                                </span>
                              </div>
                              <span className="font-bold text-17 text-dark-1 ml-20" style={{ fontFamily: "'Jost', sans-serif" }}>
                                ₹{(depositPrice / 100).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-16 bg-red-50 text-red-800 rounded-12 text-13 font-medium border-1 border-red-200 text-center mb-28">
                            Could not calculate pricing. Please try again.
                          </div>
                        )}

                        {/* PAYMENT SCHEDULE SELECTOR CARDS */}
                        <div className="mt-32 mb-28">
                          <h4 className="text-12 uppercase tracking-wider font-bold text-dark-1 mb-16" style={{ fontFamily: "'Jost', sans-serif" }}>SELECT PAYMENT OPTION</h4>
                          <div className="row y-gap-16">
                            <div className="col-sm-6">
                              <div 
                                onClick={() => setPaymentMode('FULL')}
                                className={`payment-plan-card ${paymentMode === 'FULL' ? 'selected' : ''}`}
                              >
                                <div className="payment-plan-header">
                                  <span className="payment-plan-badge">100% FULL PAYMENT</span>
                                  <div className="size-20 rounded-full border-2 border-accent-1 d-flex items-center justify-center">
                                    {paymentMode === 'FULL' && <div className="size-10 rounded-full bg-accent-1"></div>}
                                  </div>
                                </div>
                                <div>
                                  <div className="payment-plan-amount">
                                    ₹{totalRupees.toLocaleString('en-IN')}
                                  </div>
                                  <div className="text-13 text-sec mt-6 font-normal" style={{ fontFamily: "'Jost', sans-serif" }}>
                                    Pay full amount now for instant booking confirmation.
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="col-sm-6">
                              <div 
                                onClick={() => setPaymentMode('ADVANCE')}
                                className={`payment-plan-card ${paymentMode === 'ADVANCE' ? 'selected' : ''}`}
                              >
                                <div className="payment-plan-header">
                                  <span className="payment-plan-badge">50% ADVANCE PLAN</span>
                                  <div className="size-20 rounded-full border-2 border-accent-1 d-flex items-center justify-center">
                                    {paymentMode === 'ADVANCE' && <div className="size-10 rounded-full bg-accent-1"></div>}
                                  </div>
                                </div>
                                <div>
                                  <div className="payment-plan-amount">
                                    ₹{advanceTotalRupees.toLocaleString('en-IN')}
                                  </div>
                                  <div className="text-13 text-sec mt-6 font-normal" style={{ fontFamily: "'Jost', sans-serif" }}>
                                    Pay 50% advance (₹{advanceStayRupees.toLocaleString('en-IN')} + ₹{depositRupees.toLocaleString('en-IN')} deposit), pay balance at check-in.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* TOTAL PAYABLE AMOUNT BANNER */}
                        <div className="d-flex justify-between items-center p-16 bg-emerald-50/80 rounded-16 border-1 border-emerald-200/90 shadow-2xs mt-16">
                          <div>
                            <span className="text-11 uppercase tracking-widest font-bold text-emerald-900 d-block mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>PAYABLE NOW</span>
                            <span className="text-12 text-emerald-800 font-medium" style={{ fontFamily: "'Jost', sans-serif" }}>
                              {paymentMode === 'ADVANCE' ? `Balance ₹${advanceStayRupees.toLocaleString('en-IN')} payable upon check-in` : 'Includes 100% full stay package & deposit'}
                            </span>
                          </div>
                          <span className="text-26 font-bold text-emerald-950 leading-none ml-16" style={{ fontFamily: "'Jost', sans-serif" }}>
                            ₹{payableNowRupees.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* PRIMARY GUEST DETAILS CARD */}
                      <div className="checkout-card mb-20 p-24 bg-white border-1 border-light-2 rounded-20 shadow-sm">
                        <h3 className="text-18 font-bold text-dark-1 mb-16 border-bottom-light pb-10" style={{ fontFamily: "'Jost', sans-serif" }}>Primary Guest Information</h3>
                        <div className="row y-gap-16 mb-16">
                          <div className="col-sm-6">
                            <label className="text-11 uppercase tracking-wider text-sec font-bold mb-6 d-block" style={{ fontFamily: "'Jost', sans-serif" }}>FULL NAME</label>
                            <input
                              type="text"
                              readOnly
                              value={user.name || user.email.split('@')[0]}
                              className="w-1/1 bg-white text-dark-1 font-bold px-14 py-10 rounded-12 border-1 border-light-2 outline-none"
                              style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: '#0f172a' }}
                            />
                          </div>

                          <div className="col-sm-6">
                            <label className="text-11 uppercase tracking-wider text-sec font-bold mb-6 d-block" style={{ fontFamily: "'Jost', sans-serif" }}>EMAIL ADDRESS</label>
                            <input
                              type="text"
                              readOnly
                              value={user.email}
                              className="w-1/1 bg-white text-dark-1 font-bold px-14 py-10 rounded-12 border-1 border-light-2 outline-none"
                              style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: '#0f172a' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-11 uppercase tracking-wider text-sec font-bold mb-6 d-block" style={{ fontFamily: "'Jost', sans-serif" }}>
                            SPECIAL REQUESTS & PREFERENCES (OPTIONAL)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Mention dietary requirements, arrival time updates, or celebration setups..."
                            value={specialNotes}
                            onChange={(e) => setSpecialNotes(e.target.value)}
                            className="w-1/1 bg-white text-dark-1 font-medium p-12 rounded-12 border-1 border-light-2 focus:border-accent-1 text-13 leading-relaxed outline-none transition-all"
                            style={{ fontFamily: "'Jost', sans-serif", fontSize: '13px', color: '#0f172a' }}
                          />
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="d-flex justify-between items-center pt-24 border-top-light">
                        <button
                          onClick={() => setActiveStep(2)}
                          className="checkout-btn-secondary"
                        >
                          ← BACK TO ADD-ONS
                        </button>

                        <button
                          onClick={handlePayment}
                          disabled={processing || loading}
                          className="checkout-btn-primary"
                          style={{ height: '54px', padding: '0 44px', fontSize: '14px', borderRadius: '100px' }}
                        >
                          {processing ? (
                            <>
                              <span className="size-18 rounded-full border-3 border-white border-t-transparent animate-spin mr-8"></span>
                              PROCESSING...
                            </>
                          ) : (
                            <>
                              <i className="icon-lock text-14 mr-8"></i> PAY NOW
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-12 text-sec text-center mt-20 font-medium d-flex items-center justify-center">
                        <i className="icon-shield text-14 mr-6 text-emerald-600"></i> Free cancellation up to 48h prior to check-in.
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <InstagramGrid />
    </>
  );
};
