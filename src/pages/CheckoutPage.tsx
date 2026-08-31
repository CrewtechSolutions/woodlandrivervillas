import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { useAuth } from '../context/AuthContext';
import { coreApiService } from '../services/apiService';
import { Villa } from '../types';
import { openRazorpayCheckout } from '../utils/razorpay';

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

  const [selectedAddons, setSelectedAddons] = useState<{ id: string; quantity: number }[]>(state?.selectedAddons || []);
  const [paymentMode, setPaymentMode] = useState<'FULL' | 'ADVANCE'>('FULL');

  useEffect(() => {
    if (!state || !state.startDate || !state.endDate || !state.villa) {
      setLoading(false);
      return;
    }

    const fetchPricingAndAvailability = async () => {
      try {
        setLoading(true);
        const checkInTimeStr = state.villa.checkInTime || '14:00';
        const checkOutTimeStr = state.villa.checkOutTime || '11:00';
        const startDateTime = new Date(`${state.startDate}T${checkInTimeStr}:00.000Z`);
        const endDateTime = new Date(`${state.endDate}T${checkOutTimeStr}:00.000Z`);

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
  }, [state, selectedAddons]);

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

  const { startDate, endDate, villa, guests = 1 } = state;

  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    
    try {
      const checkInTimeStr = state.villa.checkInTime || '14:00';
      const checkOutTimeStr = state.villa.checkOutTime || '11:00';
      const startDateTime = new Date(`${state.startDate}T${checkInTimeStr}:00.000Z`);
      const endDateTime = new Date(`${state.endDate}T${checkOutTimeStr}:00.000Z`);

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
            navigate('/success', { state: { bookingId: booking.id, villa, startDate, endDate, guests } });
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
      const startDateTime = new Date(`${state.startDate}T${checkInTimeStr}:00.000Z`);
      const endDateTime = new Date(`${state.endDate}T${checkOutTimeStr}:00.000Z`);

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
      navigate('/success', { state: { bookingId: booking.id, villa, startDate, endDate, guests } });
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
  const lineItems = pricing?.details?.lineItems || [];

  return (
    <>
      <SEO title={`Checkout - ${villa.name} | Woodland River Villa`} description="Secure luxury checkout and payment." />
      
      {/* HERO BANNER WITH GUARANTEED HEADER CLEARANCE */}
      <section className="relative pt-220 pb-90 md:pt-180 md:pb-60 bg-dark-1 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={villa.heroImage}
            alt={villa.name}
            className="w-1/1 h-1/1 object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-dark-1/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-dark-1/80 via-transparent to-dark-1/95"></div>
        </div>

        <div className="container relative z-2 text-center text-white">
          <div className="d-inline-flex items-center x-gap-8 bg-amber-500/10 border-1 border-amber-500/30 px-16 py-6 rounded-200 mb-15 backdrop-blur-md">
            <i className="icon-lock text-14 text-amber-400"></i>
            <span className="text-11 uppercase fw-700 tracking-widest text-amber-300">256-BIT ENCRYPTED CHECKOUT</span>
          </div>
          <h1 className="text-42 md:text-32 font-serif fw-700 mb-12 text-white">Complete Your Reservation</h1>
          <p className="text-16 fw-400 text-white/80 max-w-600 mx-auto leading-relaxed">
            Review your stay details, customize in-house experiences, and proceed with instant confirmation.
          </p>
        </div>
      </section>

      {/* CHECKOUT 2-COLUMN SPLIT CONTAINER */}
      <section className="layout-pt-md layout-pb-lg bg-light-1">
        <div className="container">
          <div className="row justify-center">
            <div className="col-xl-11 col-lg-12">
              
              {error && (
                <div className="bg-red-50 p-20 rounded-20 mb-40 text-red-800 border-1 border-red-200 d-flex items-center shadow-sm">
                  <i className="icon-close text-20 mr-15 text-red-600"></i>
                  <span className="fw-600">{error}</span>
                </div>
              )}

              <div className="row y-gap-40 justify-between">
                
                {/* LEFT COLUMN: STAY SUMMARY, ADDONS, & GUEST DETAILS */}
                <div className="col-lg-7 pr-xl-30">
                  
                  {/* STEP 1: STAY OVERVIEW */}
                  <div className="mb-35">
                    <div className="text-11 uppercase text-accent-1 fw-700 tracking-widest mb-6">STEP 1 OF 3</div>
                    <h2 className="text-30 font-serif fw-700 text-dark-1 border-bottom-light pb-15">Review Reservation Details</h2>
                  </div>

                  <div className="p-35 md:p-24 bg-white rounded-24 border-1 border-light-2 shadow-sm mb-40">
                    <div className="d-flex items-center mb-25 border-bottom-light pb-25">
                      <img src={villa.heroImage} alt={villa.name} className="size-90 rounded-16 object-cover shadow-sm mr-20" />
                      <div>
                        <div className="text-11 uppercase tracking-widest text-accent-1 fw-700 mb-4">
                          <i className="icon-star text-10 mr-4 text-amber-500"></i> LUXURY ESTATE
                        </div>
                        <h3 className="text-24 font-serif fw-700 text-dark-1 mb-6">{villa.name}</h3>
                        <p className="text-13 text-sec">{villa.subtitle || 'Zirad, Alibaug • Private Pool Estate'}</p>
                      </div>
                    </div>
                    
                    <div className="row y-gap-16">
                      <div className="col-sm-6">
                        <div className="p-20 bg-light-1 rounded-16 border-1 border-light-2 h-full">
                          <div className="text-11 uppercase tracking-widest text-sec fw-700 mb-6 d-flex items-center">
                            <i className="icon-calendar-2 mr-8 text-accent-1 text-14"></i> Check-In Date
                          </div>
                          <div className="text-16 fw-700 text-dark-1">
                            {new Date(startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-12 text-sec mt-4 fw-500">Check-in time: From 2:00 PM</div>
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div className="p-20 bg-light-1 rounded-16 border-1 border-light-2 h-full">
                          <div className="text-11 uppercase tracking-widest text-sec fw-700 mb-6 d-flex items-center">
                            <i className="icon-calendar-2 mr-8 text-accent-1 text-14"></i> Check-Out Date
                          </div>
                          <div className="text-16 fw-700 text-dark-1">
                            {new Date(endDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-12 text-sec mt-4 fw-500">Check-out time: By 11:00 AM</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-25 pt-20 border-top-light d-flex justify-between items-center flex-wrap y-gap-10">
                      <div>
                        <div className="text-11 uppercase tracking-widest text-sec fw-700 mb-4 d-flex items-center">
                          <i className="icon-guest mr-6 text-accent-1"></i> Guest Count
                        </div>
                        <div className="text-16 fw-700 text-dark-1">{guests} Guest{guests > 1 ? 's' : ''}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-11 uppercase tracking-widest text-sec fw-700 mb-4">Bedrooms & Baths</div>
                        <div className="text-16 fw-700 text-dark-1">{villa.bedrooms} • {villa.bathrooms}</div>
                      </div>
                    </div>
                  </div>

                  {/* STEP 2: EXPERIENCE ADD-ONS */}
                  {villa.addons && villa.addons.length > 0 && (
                    <div className="mb-40">
                      <div className="text-11 uppercase text-accent-1 fw-700 tracking-widest mb-6">STEP 2 OF 3</div>
                      <h2 className="text-30 font-serif fw-700 text-dark-1 border-bottom-light pb-15 mb-25">Customize In-House Experiences</h2>
                      
                      <div className="space-y-16">
                        {villa.addons.map(addon => {
                          const selected = selectedAddons.find(a => a.id === addon.id);
                          const quantity = selected ? selected.quantity : 0;
                          return (
                            <div key={addon.id} className="p-25 bg-white rounded-20 border-1 border-light-2 shadow-sm d-flex justify-between items-center flex-wrap y-gap-15 hover:border-accent-1/40 transition-all">
                              <div className="pr-15 max-w-400">
                                <div className="text-16 fw-700 text-dark-1 mb-4">{addon.name}</div>
                                {addon.description && <div className="text-13 text-sec mb-8 leading-relaxed">{addon.description}</div>}
                                <div className="text-14 fw-700 text-accent-1">
                                  ₹{(addon.priceCents / 100).toLocaleString('en-IN')} {addon.priceType === 'PER_DURATION' ? '/ day' : (addon.priceType === 'PER_UNIT' ? '/ unit' : '')}
                                </div>
                              </div>
                              
                              <div className="d-flex items-center">
                                {addon.multiSelect ? (
                                  <div className="d-flex items-center border-1 border-light-2 rounded-200 overflow-hidden bg-light-1">
                                    <button 
                                      className="px-16 py-10 hover:bg-light-2 text-dark-1 transition-colors fw-700 text-16"
                                      onClick={() => handleAddonChange(addon.id, Math.max(0, quantity - 1))}
                                    >
                                      -
                                    </button>
                                    <div className="px-16 text-14 fw-700 text-dark-1">{quantity}</div>
                                    <button 
                                      className="px-16 py-10 hover:bg-light-2 text-dark-1 transition-colors fw-700 text-16"
                                      onClick={() => handleAddonChange(addon.id, addon.maxQuantity ? Math.min(addon.maxQuantity, quantity + 1) : quantity + 1)}
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className={`px-25 py-10 rounded-200 text-12 fw-700 uppercase tracking-wider transition-all ${
                                      quantity > 0 
                                        ? 'bg-accent-1 text-white shadow-md' 
                                        : 'bg-light-1 text-dark-1 border-1 border-light-2 hover:bg-light-2'
                                    }`}
                                    onClick={() => handleAddonChange(addon.id, quantity > 0 ? 0 : 1)}
                                  >
                                    {quantity > 0 ? 'ADDED' : 'ADD TO STAY'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: PRIMARY GUEST INFORMATION & SPECIAL REQUESTS */}
                  <div className="mb-35">
                    <div className="text-11 uppercase text-accent-1 fw-700 tracking-widest mb-6">STEP 3 OF 3</div>
                    <h2 className="text-30 font-serif fw-700 text-dark-1 border-bottom-light pb-15">Primary Guest Details</h2>
                  </div>
                  
                  <div className="p-35 md:p-24 bg-white rounded-24 border-1 border-light-2 shadow-sm mb-40">
                    <div className="row y-gap-24 mb-25">
                      <div className="col-sm-6">
                        <div className="text-11 uppercase tracking-widest text-sec fw-700 mb-8">Full Name</div>
                        <div className="text-15 fw-700 text-dark-1 p-16 bg-light-1 rounded-14 border-1 border-light-2">
                          {user.name || user.email.split('@')[0]}
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div className="text-11 uppercase tracking-widest text-sec fw-700 mb-8">Email Address</div>
                        <div className="text-15 fw-700 text-dark-1 p-16 bg-light-1 rounded-14 border-1 border-light-2">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-11 uppercase tracking-widest text-sec fw-700 mb-8 d-block">
                        Special Requests & Preferences (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Mention any dietary requirements, arrival time updates, or celebration setups (anniversary, birthday)..."
                        value={specialNotes}
                        onChange={(e) => setSpecialNotes(e.target.value)}
                        className="w-1/1 bg-light-1 text-dark-1 border-1 border-light-2 focus:border-accent-1 p-16 rounded-14 text-14 leading-relaxed outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: STICKY PRICE BREAKDOWN & PAYMENT CARD */}
                <div className="col-lg-5">
                  <div 
                    className="bg-white border-1 border-light-2 rounded-24 shadow-2xl p-35 md:p-24 sticky-top" 
                    style={{ 
                      top: '140px',
                      boxShadow: '0 30px 60px -15px rgba(15, 23, 42, 0.15)'
                    }}
                  >
                    <div className="text-11 uppercase text-amber-500 fw-700 tracking-widest mb-6 text-center">FINAL PAYMENT</div>
                    <h3 className="text-26 font-serif fw-700 mb-25 text-center border-bottom-light pb-18 text-dark-1">
                      Price Summary
                    </h3>
                    
                    {loading ? (
                      <div className="py-60 text-center">
                        <div className="size-40 rounded-full border-3 border-accent-1 border-t-transparent animate-spin mx-auto mb-15"></div>
                        <div className="text-13 fw-700 text-sec uppercase tracking-wider">Calculating Total Stay Package...</div>
                      </div>
                    ) : pricing ? (
                      <>
                        {/* ITEMIZATION LIST */}
                        <div className="space-y-16 mb-25 p-20 bg-light-1/80 rounded-18 border-1 border-light-2">
                          {lineItems.length > 0 ? (
                            lineItems.map((item: any, idx: number) => (
                              <div key={idx} className="d-flex justify-between items-start text-14 text-dark-1 fw-500 pb-12 border-bottom-light">
                                <div>
                                  <span className="fw-600">{item.label}</span>
                                  {item.detail && <div className="text-12 text-sec mt-2">{item.detail}</div>}
                                </div>
                                <span className="fw-700 ml-10">₹{(item.total / 100).toLocaleString('en-IN')}</span>
                              </div>
                            ))
                          ) : (
                            <div className="d-flex justify-between items-center text-14 text-dark-1 fw-500 pb-12 border-bottom-light">
                              <span className="fw-600">Base Villa Rental</span>
                              <span className="fw-700">₹{(basePrice / 100).toLocaleString('en-IN')}</span>
                            </div>
                          )}

                          {addonsPrice > 0 && lineItems.filter((li: any) => li.label.toLowerCase().includes('addon') || li.label.toLowerCase().includes('food')).length === 0 && (
                            <div className="d-flex justify-between items-center text-14 text-dark-1 fw-500 pb-12 border-bottom-light">
                              <span className="fw-600">Selected Add-Ons</span>
                              <span className="fw-700">₹{(addonsPrice / 100).toLocaleString('en-IN')}</span>
                            </div>
                          )}

                          <div className="d-flex justify-between items-center text-14 text-dark-1 fw-500 pt-4">
                            <span className="fw-600 d-flex items-center">
                              Refundable Deposit <i className="icon-info text-12 ml-6 text-sec" title="Fully refunded upon checkout inspection"></i>
                            </span>
                            <span className="fw-700">₹{(depositPrice / 100).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                        
                        {/* PAYMENT SCHEDULE SELECTOR */}
                        <div className="mb-25">
                          <h4 className="text-13 uppercase tracking-wider fw-700 text-dark-1 mb-12">Payment Plan</h4>
                          <div className="d-flex gap-12">
                            <label 
                              className={`flex-1 border-1 rounded-14 p-14 cursor-pointer transition-all ${
                                paymentMode === 'FULL' 
                                  ? 'border-accent-1 bg-accent-1/5 shadow-sm' 
                                  : 'border-light-2 bg-white hover:border-accent-1/50'
                              }`}
                            >
                              <div className="d-flex items-center gap-10">
                                <input 
                                  type="radio" 
                                  name="paymentMode" 
                                  checked={paymentMode === 'FULL'} 
                                  onChange={() => setPaymentMode('FULL')} 
                                  className="size-16 accent-accent-1" 
                                />
                                <span className="text-13 fw-700 text-dark-1">Full Payment (100%)</span>
                              </div>
                            </label>

                            <label 
                              className={`flex-1 border-1 rounded-14 p-14 cursor-pointer transition-all ${
                                paymentMode === 'ADVANCE' 
                                  ? 'border-accent-1 bg-accent-1/5 shadow-sm' 
                                  : 'border-light-2 bg-white hover:border-accent-1/50'
                              }`}
                            >
                              <div className="d-flex items-center gap-10">
                                <input 
                                  type="radio" 
                                  name="paymentMode" 
                                  checked={paymentMode === 'ADVANCE'} 
                                  onChange={() => setPaymentMode('ADVANCE')} 
                                  className="size-16 accent-accent-1" 
                                />
                                <span className="text-13 fw-700 text-dark-1">Advance (50%)</span>
                              </div>
                            </label>
                          </div>
                        </div>
                        
                        {/* TOTAL PAYABLE AMOUNT */}
                        <div className="d-flex justify-between items-end mb-30 px-6 pt-10 border-top-light">
                          <span className="text-13 uppercase tracking-widest font-bold text-sec">Payable Now</span>
                          <span className="text-36 font-serif fw-700 text-dark-1 leading-none">
                            ₹{(paymentMode === 'ADVANCE' ? Math.floor((totalPrice - depositPrice) / 2) / 100 : totalPrice / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        {/* PAYMENT CTAS */}
                        <button
                          onClick={handlePayment}
                          disabled={processing || loading}
                          className="button bg-accent-1 text-white rounded-200 w-1/1 py-18 text-14 uppercase tracking-widest fw-700 shadow-md hover:shadow-xl hover:bg-dark-1 transition-all duration-300 d-flex justify-center items-center mb-14"
                        >
                          {processing ? (
                            <>
                              <span className="size-18 rounded-full border-3 border-white border-t-transparent animate-spin mr-10"></span>
                              PROCESSING SECURE PAYMENT...
                            </>
                          ) : (
                            <>
                              <i className="icon-lock text-16 mr-10"></i> PAY VIA RAZORPAY
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleMockPayment}
                          disabled={processing || loading}
                          className="button bg-dark-1 text-white rounded-200 w-1/1 py-14 text-12 uppercase tracking-widest fw-700 shadow-sm hover:bg-accent-1 transition-all d-flex justify-center items-center"
                        >
                          {processing ? 'PROCESSING...' : 'EXPRESS TEST PAYMENT (SKIP GATEWAY)'}
                        </button>

                        <div className="text-12 text-sec text-center mt-20 fw-500 d-flex items-center justify-center">
                          <i className="icon-shield text-14 mr-6 text-emerald-600"></i> Free cancellation up to 48h prior to check-in.
                        </div>
                      </>
                    ) : (
                      <div className="p-24 bg-red-50 text-red-800 rounded-16 text-14 font-medium border-1 border-red-200 text-center">
                        Could not calculate pricing. Please try again.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};
