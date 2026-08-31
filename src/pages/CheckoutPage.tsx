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

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [currentStartDate, setCurrentStartDate] = useState(state?.startDate || '');
  const [currentEndDate, setCurrentEndDate] = useState(state?.endDate || '');
  const [calendarMode, setCalendarMode] = useState<'checkIn' | 'checkOut' | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<{ id: string; quantity: number }[]>(state?.selectedAddons || []);
  const [paymentMode, setPaymentMode] = useState<'FULL' | 'ADVANCE'>('FULL');

  const [dynamicAddons, setDynamicAddons] = useState<any[]>(state?.villa?.addons || []);

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
            selectedAddons
          }).catch((err) => {
            throw new Error(err.message || 'Failed to calculate pricing');
          }),
          coreApiService.checkAvailability({
            offeringId: state.villa.offeringId || state.villa.id,
            startDate: startDateTime,
            endDate: endDateTime
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
  }, [state, currentStartDate, currentEndDate, selectedAddons]);

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

  const { villa, guests = 1 } = state;

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
        notes: `Guests: ${guests}. Special Notes: ${specialNotes}`,
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
        notes: `Guests: ${guests}. Special Notes: ${specialNotes}`,
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
    setSelectedAddons(prev => {
      const existing = prev.find(a => a.id === addonId);
      if (quantity <= 0) {
        return prev.filter(a => a.id !== addonId);
      }
      if (existing) {
        return prev.map(a => a.id === addonId ? { ...a, quantity } : a);
      }
      return [...prev, { id: addonId, quantity }];
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

              <div className="max-w-800 mx-auto">
                
                {/* 3-STEP INTERACTIVE CHECKOUT WIZARD */}
                <div>
                  
                  {/* ELEGANT STEP WIZARD BAR */}
                  <div className="checkout-wizard-bar mb-32">
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
                      <div className="mb-24">
                        <div className="text-11 uppercase text-accent-1 font-bold tracking-widest mb-6">STEP 1 OF 3</div>
                        <h2 className="text-28 font-serif font-bold text-dark-1 border-bottom-light pb-16">Review Reservation Details</h2>
                      </div>

                      <div 
                        className="checkout-card mb-32"
                        style={{ overflow: 'visible', position: 'relative', zIndex: calendarMode ? 100 : 1 }}
                      >
                        <div className="d-flex items-center mb-25 border-bottom-light pb-25">
                          <div 
                            className="rounded-16 overflow-hidden shadow-sm mr-20 bg-light-1"
                            style={{ width: '90px', height: '90px', flexShrink: 0 }}
                          >
                            <img 
                              src={villa.heroImage} 
                              alt={villa.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                            />
                          </div>
                          <div>
                            <div className="text-11 uppercase tracking-widest text-accent-1 font-bold mb-4">
                              <i className="icon-star text-10 mr-4 text-amber-500"></i> LUXURY ESTATE
                            </div>
                            <h3 className="text-24 font-serif font-bold text-dark-1 mb-6 leading-snug">{villa.name}</h3>
                            <p className="text-13 text-sec font-medium">{villa.subtitle || 'Zirad, Alibaug • Private Pool Estate'}</p>
                          </div>
                        </div>
                        
                        <div className="row y-gap-16">
                          {/* CHECK-IN DATE BOX */}
                          <div className="col-sm-6 relative" style={{ zIndex: calendarMode === 'checkIn' ? 101 : 1 }}>
                            <div 
                              onClick={() => setCalendarMode(calendarMode === 'checkIn' ? null : 'checkIn')}
                              className="checkout-date-box h-full relative"
                            >
                              <div className="d-flex justify-between items-center mb-10">
                                <span className="text-11 uppercase tracking-wider text-accent-1 font-bold d-flex items-center">
                                  <i className="icon-calendar-2 mr-6 text-accent-1 text-14"></i> CHECK-IN DATE
                                </span>
                                <span className="px-10 py-3 rounded-200 bg-white text-10 font-bold text-accent-1 border-1 border-light-2 shadow-sm">CHANGE</span>
                              </div>
                              <div className="text-16 font-bold text-dark-1 mb-4">
                                {currentStartDate ? new Date(currentStartDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Select Date'}
                              </div>
                              <div className="text-12 text-sec font-medium">Check-in: From 2:00 PM</div>
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
                              <div className="d-flex justify-between items-center mb-10">
                                <span className="text-11 uppercase tracking-wider text-accent-1 font-bold d-flex items-center">
                                  <i className="icon-calendar-2 mr-6 text-accent-1 text-14"></i> CHECK-OUT DATE
                                </span>
                                <span className="px-10 py-3 rounded-200 bg-white text-10 font-bold text-accent-1 border-1 border-light-2 shadow-sm">CHANGE</span>
                              </div>
                              <div className="text-16 font-bold text-dark-1 mb-4">
                                {currentEndDate ? new Date(currentEndDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Select Date'}
                              </div>
                              <div className="text-12 text-sec font-medium">Check-out: By 11:00 AM</div>
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

                        <div className="mt-25 pt-20 border-top-light d-flex justify-between items-center flex-wrap y-gap-10">
                          <div>
                            <div className="text-11 uppercase tracking-wider text-sec font-bold mb-4 d-flex items-center">
                              <i className="icon-guest mr-6 text-accent-1"></i> GUESTS & CAPACITY
                            </div>
                            <div className="text-15 font-bold text-dark-1">{guests} Guest{guests > 1 ? 's' : ''} • {villa.bedrooms} BHK ({villa.bathrooms} Baths)</div>
                          </div>
                          <div className="text-right">
                            <div className="text-11 uppercase tracking-wider text-accent-1 font-bold mb-4">ESTIMATED STAY</div>
                            <div className="text-22 font-serif font-bold text-accent-1">
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
                      <div className="mb-24">
                        <div className="text-11 uppercase text-accent-1 font-bold tracking-widest mb-6">STEP 2 OF 3</div>
                        <h2 className="text-28 font-serif font-bold text-dark-1 border-bottom-light pb-16 mb-12">Customize In-House Experiences</h2>
                        <p className="text-14 text-sec font-medium">Enhance your villa stay with curated chef services, BBQ setups, or luxury SUV transfers.</p>
                      </div>
                      
                      <div className="mb-32">
                        {dynamicAddons.length > 0 ? (
                          dynamicAddons.map(addon => {
                            const selected = selectedAddons.find(a => a.id === addon.id);
                            const quantity = selected ? selected.quantity : 0;
                            return (
                              <div key={addon.id} className="addon-card">
                                <div>
                                  <div className="text-17 font-serif font-bold text-dark-1 mb-4">{addon.name}</div>
                                  {addon.description && <div className="text-13 text-sec mb-8 leading-relaxed font-normal">{addon.description}</div>}
                                  <div className="text-15 font-bold text-accent-1">
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
                                      className={`px-24 py-12 rounded-200 text-12 font-bold uppercase tracking-wider transition-all ${
                                        quantity > 0 
                                          ? 'bg-accent-1 text-white shadow-md' 
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
                          <div className="p-30 bg-white rounded-20 border-1 border-light-2 text-center">
                            <i className="icon-info text-24 text-accent-1 mb-8"></i>
                            <div className="text-15 font-bold text-dark-1 mb-4">No Extra Add-On Offerings</div>
                            <div className="text-13 text-sec font-medium">No additional add-on offerings are configured for this villa. Click below to continue.</div>
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
                      <div className="mb-24">
                        <div className="text-11 uppercase text-accent-1 font-bold tracking-widest mb-6">STEP 3 OF 3</div>
                        <h2 className="text-28 font-serif font-bold text-dark-1 border-bottom-light pb-16 mb-12">Review Price Summary & Complete Reservation</h2>
                        <p className="text-14 text-sec font-medium">Verify your stay breakdown, choose payment plan, and confirm your booking.</p>
                      </div>
                      
                      {/* INTEGRATED PRICE BREAKDOWN CARD */}
                      <div className="checkout-card mb-32">
                        <div className="text-11 uppercase text-amber-600 font-bold tracking-widest mb-6">FINAL TARIFF BREAKDOWN</div>
                        <h3 className="text-24 font-serif font-bold mb-20 text-dark-1 border-bottom-light pb-14">Price Summary</h3>
                        
                        {loading ? (
                          <div className="py-40 text-center">
                            <div className="size-36 rounded-full border-3 border-accent-1 border-t-transparent animate-spin mx-auto mb-12"></div>
                            <div className="text-12 font-bold text-sec uppercase tracking-wider">Calculating Total Stay Package...</div>
                          </div>
                        ) : pricing ? (
                          <div className="p-24 bg-light-1 rounded-20 border-1 border-light-2 mb-28" style={{ backgroundColor: '#F8FAFC' }}>
                            {/* BASE VILLA RENTAL */}
                            <div className="d-flex justify-between items-center text-15 text-dark-1 font-medium pb-14 mb-14 border-bottom-light">
                              <div>
                                <span className="font-bold text-dark-1">Base Villa Rental</span>
                                <div className="text-12 text-sec mt-2 font-normal">
                                  {nightsCount} Night{nightsCount > 1 ? 's' : ''} Stay Package (Incl. all stay fees & taxes)
                                </div>
                              </div>
                              <span className="font-serif font-bold text-18 text-dark-1 ml-15">
                                ₹{(effectiveBaseFare / 100).toLocaleString('en-IN')}
                              </span>
                            </div>

                            {/* DETAILED SELECTED ADD-ONS BREAKDOWN */}
                            {selectedAddons.length > 0 && (
                              <div className="pb-14 mb-14 border-bottom-light">
                                <div className="d-flex justify-between items-center mb-10">
                                  <span className="text-12 uppercase tracking-wider text-accent-1 font-bold">
                                    Selected In-House Add-Ons ({selectedAddons.length})
                                  </span>
                                  <span className="text-13 font-bold text-dark-1">
                                    ₹{(addonsPrice / 100).toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <div className="space-y-8 pl-12 border-l-2 border-accent-1/30 my-8">
                                  {selectedAddons.map(selectedItem => {
                                    const addonObj = dynamicAddons.find(a => a.id === selectedItem.id);
                                    if (!addonObj) return null;
                                    const isPerDay = addonObj.priceType === 'PER_DURATION';
                                    const itemTotalCents = isPerDay 
                                      ? addonObj.priceCents * selectedItem.quantity * nightsCount 
                                      : addonObj.priceCents * selectedItem.quantity;
                                    return (
                                      <div key={selectedItem.id} className="d-flex justify-between items-start text-14 text-dark-1 font-medium py-4">
                                        <div>
                                          <span className="font-bold text-dark-1">{addonObj.name}</span>
                                          <div className="text-12 text-sec font-normal mt-1">
                                            Qty: {selectedItem.quantity} × ₹{(addonObj.priceCents / 100).toLocaleString('en-IN')}{isPerDay ? ` × ${nightsCount} night${nightsCount > 1 ? 's' : ''}` : ''}
                                          </div>
                                        </div>
                                        <span className="font-serif font-bold text-16 text-dark-1 ml-15">
                                          ₹{(itemTotalCents / 100).toLocaleString('en-IN')}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* REFUNDABLE DEPOSIT */}
                            <div className="d-flex justify-between items-center text-15 text-dark-1 font-medium pt-2">
                              <div>
                                <span className="font-bold text-dark-1 d-flex items-center">
                                  Refundable Security Deposit <i className="icon-info text-12 ml-6 text-sec" title="Fully refunded upon checkout inspection"></i>
                                </span>
                                <div className="text-12 text-sec mt-2 font-normal">100% refunded upon peaceful checkout inspection</div>
                              </div>
                              <span className="font-serif font-bold text-18 text-dark-1 ml-15">
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
                        <div className="mb-28">
                          <h4 className="text-12 uppercase tracking-wider font-bold text-dark-1 mb-14">Select Payment Option</h4>
                          <div className="row y-gap-16">
                            <div className="col-sm-6">
                              <div 
                                onClick={() => setPaymentMode('FULL')}
                                className={`payment-plan-card ${paymentMode === 'FULL' ? 'selected' : ''}`}
                              >
                                <div className="payment-plan-header">
                                  <span className="payment-plan-badge">100% Full Payment</span>
                                  <div className="size-20 rounded-full border-2 border-accent-1 d-flex items-center justify-center">
                                    {paymentMode === 'FULL' && <div className="size-10 rounded-full bg-accent-1"></div>}
                                  </div>
                                </div>
                                <div>
                                  <div className="payment-plan-amount">
                                    ₹{totalRupees.toLocaleString('en-IN')}
                                  </div>
                                  <div className="text-12 text-sec mt-4 font-medium">
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
                                  <span className="payment-plan-badge">50% Advance Plan</span>
                                  <div className="size-20 rounded-full border-2 border-accent-1 d-flex items-center justify-center">
                                    {paymentMode === 'ADVANCE' && <div className="size-10 rounded-full bg-accent-1"></div>}
                                  </div>
                                </div>
                                <div>
                                  <div className="payment-plan-amount">
                                    ₹{advanceTotalRupees.toLocaleString('en-IN')}
                                  </div>
                                  <div className="text-12 text-sec mt-4 font-medium">
                                    Pay 50% advance (₹{advanceStayRupees.toLocaleString('en-IN')} + ₹{depositRupees.toLocaleString('en-IN')} deposit), pay balance at check-in.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* TOTAL PAYABLE AMOUNT CARD */}
                        <div className="d-flex justify-between items-center p-24 bg-accent-1/5 rounded-20 border-1 border-accent-1/20">
                          <div>
                            <span className="text-11 uppercase tracking-widest font-bold text-accent-1 d-block mb-4">Payable Now</span>
                            <span className="text-13 text-sec font-medium">
                              {paymentMode === 'ADVANCE' ? `Balance ₹${advanceStayRupees.toLocaleString('en-IN')} payable upon check-in` : 'Includes 100% full stay package & deposit'}
                            </span>
                          </div>
                          <span className="text-36 font-serif font-bold text-accent-1 leading-none">
                            ₹{payableNowRupees.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* PRIMARY GUEST DETAILS CARD */}
                      <div className="checkout-card mb-32">
                        <h3 className="text-20 font-serif font-bold text-dark-1 mb-20 border-bottom-light pb-12">Primary Guest Information</h3>
                        <div className="row y-gap-20 mb-20">
                          <div className="col-sm-6">
                            <div className="text-11 uppercase tracking-wider text-sec font-bold mb-8">FULL NAME</div>
                            <div className="text-15 font-bold text-dark-1 p-16 bg-light-1 rounded-14 border-1 border-light-2" style={{ backgroundColor: '#F8FAFC' }}>
                              {user.name || user.email.split('@')[0]}
                            </div>
                          </div>

                          <div className="col-sm-6">
                            <div className="text-11 uppercase tracking-wider text-sec font-bold mb-8">EMAIL ADDRESS</div>
                            <div className="text-15 font-bold text-dark-1 p-16 bg-light-1 rounded-14 border-1 border-light-2" style={{ backgroundColor: '#F8FAFC' }}>
                              {user.email}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-11 uppercase tracking-wider text-sec font-bold mb-8 d-block">
                            SPECIAL REQUESTS & PREFERENCES (OPTIONAL)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Mention any dietary requirements, arrival time updates, or celebration setups..."
                            value={specialNotes}
                            onChange={(e) => setSpecialNotes(e.target.value)}
                            className="w-1/1 bg-light-1 text-dark-1 border-1 border-light-2 focus:border-accent-1 p-16 rounded-14 text-14 leading-relaxed outline-none"
                            style={{ backgroundColor: '#F8FAFC' }}
                          />
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="d-flex justify-between items-center pt-16 border-top-light">
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
                          style={{ minWidth: '220px' }}
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
