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
            return { data: { available: true } }; // Default true to allow fallback to calculatePricing errors
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

    // Debounce the pricing calculation slightly to avoid rapid API calls if user clicks addons fast
    const timer = setTimeout(() => {
      fetchPricingAndAvailability();
    }, 300);

    return () => clearTimeout(timer);
  }, [state, selectedAddons]);

  if (authLoading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!state) {
    return <Navigate to="/our-villas" replace />;
  }

  const { startDate, endDate, villa, guests } = state;

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
        notes: `Guests: ${guests}`,
        selectedAddons
      });

      const actualTotal = booking.totalCents || totalPrice;
      const actualDeposit = booking.depositCents !== undefined ? booking.depositCents : depositPrice;
      const baseTotal = actualTotal - actualDeposit;
      const advanceRent = Math.floor(baseTotal / 2);
      const amountToPay = paymentMode === 'ADVANCE' ? advanceRent : actualTotal;
      const depositToPay = paymentMode === 'ADVANCE' ? 0 : actualDeposit;

      openRazorpayCheckout({
        amount: amountToPay, // Amount in paise
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
            navigate('/success', { state: { bookingId: booking.id } });
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
        notes: `Guests: ${guests}`,
        selectedAddons
      });

      const actualTotal = booking.totalCents || totalPrice;
      const actualDeposit = booking.depositCents !== undefined ? booking.depositCents : depositPrice;
      const baseTotal = actualTotal - actualDeposit;
      const advanceRent = Math.floor(baseTotal / 2);
      const amountToPay = paymentMode === 'ADVANCE' ? advanceRent : actualTotal;
      const depositToPay = paymentMode === 'ADVANCE' ? 0 : actualDeposit;

      // Simulate a network delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await coreApiService.confirmBookingPayment(
        booking.id,
        'pay_mock_' + Date.now(),
        'RAZORPAY',
        amountToPay,
        depositToPay
      );
      navigate('/success', { state: { bookingId: booking.id } });
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
  const adjustmentsPrice = pricing?.price?.adjustments || 0;
  const lineItems = pricing?.details?.lineItems || [];

  return (
    <>
      <SEO title={`Checkout - ${villa.name} | Woodland River Villa`} description="Secure checkout and payment." />
      
      <section className="relative pt-150 pb-120 bg-dark-1 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/img/pageHero/4.png"
            alt="Hero Background"
            className="w-1/1 h-1/1 object-cover"
          />
          <div className="absolute inset-0 bg-dark-1 opacity-70 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-dark-1 to-transparent opacity-90"></div>
        </div>
        <div className="container relative z-2 text-center text-white">
          <div className="d-inline-flex items-center x-gap-8 bg-white/10 px-16 py-6 rounded-200 border-1 border-white/20 mb-20" data-anim-child="slide-up delay-1">
            <i className="icon-lock text-14 text-accent-1"></i>
            <span className="text-11 uppercase fw-700 tracking-wider">SECURE CHECKOUT</span>
          </div>
          <h1 className="text-45 md:text-35 font-serif fw-700 mb-15 text-white" data-anim-child="slide-up delay-2">Complete Your Reservation</h1>
          <p className="text-16 fw-500 text-white/70 max-w-600 mx-auto" data-anim-child="slide-up delay-3">Review your booking details and proceed with our encrypted payment gateway to secure your luxury estate.</p>
        </div>
      </section>
      
      <section className="layout-pt-md layout-pb-lg bg-light-1">
        <div className="container">
          <div className="row justify-center">
            <div className="col-xl-10 col-lg-11">
              
              {error && (
                <div className="bg-red-50 p-20 rounded-16 mb-40 text-red-800 border-1 border-red-200 d-flex items-center shadow-sm">
                  <i className="icon-close text-20 mr-15 text-red-600"></i>
                  <span className="fw-500">{error}</span>
                </div>
              )}

              <div className="row y-gap-40 justify-between">
                
                {/* LEFT COLUMN: BOOKING SUMMARY, ADDONS, & GUEST INFO */}
                <div className="col-lg-7 pr-xl-50">
                  <div className="mb-40">
                    <div className="text-12 uppercase text-accent-1 fw-700 tracking-widest mb-10">STEP 1</div>
                    <h2 className="text-30 font-serif fw-700 text-dark-1 border-bottom-light pb-15">Review Reservation</h2>
                  </div>
                  
                  <div className="p-40 bg-white rounded-24 border-1 border-light-2 shadow-sm mb-50">
                    <div className="d-flex items-center mb-30 border-bottom-light pb-30">
                      <img src={villa.heroImage} alt={villa.name} className="size-100 rounded-12 object-cover shadow-sm mr-20" />
                      <div>
                        <div className="text-11 uppercase tracking-wider text-accent-1 fw-700 mb-5">VIP ESTATE</div>
                        <h3 className="text-24 font-serif fw-700 text-dark-1 mb-8">{villa.name}</h3>
                        <p className="text-14 text-sec">{villa.subtitle}</p>
                      </div>
                    </div>
                    
                    <div className="row y-gap-20">
                      <div className="col-sm-6">
                        <div className="p-20 bg-light-1 rounded-12 border-1 border-white shadow-inner h-full">
                          <div className="text-12 uppercase tracking-wider text-sec fw-700 mb-8 d-flex items-center"><i className="icon-calendar-2 mr-8 text-accent-1"></i> Check-In</div>
                          <div className="text-16 fw-700 text-dark-1">{new Date(startDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                          <div className="text-13 text-sec mt-4">From 2:00 PM</div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="p-20 bg-light-1 rounded-12 border-1 border-white shadow-inner h-full">
                          <div className="text-12 uppercase tracking-wider text-sec fw-700 mb-8 d-flex items-center"><i className="icon-calendar-2 mr-8 text-accent-1"></i> Check-Out</div>
                          <div className="text-16 fw-700 text-dark-1">{new Date(endDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                          <div className="text-13 text-sec mt-4">By 11:00 AM</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-30 pt-30 border-top-light d-flex justify-between items-center">
                      <div>
                        <div className="text-12 uppercase tracking-wider text-sec fw-700 mb-5 d-flex items-center"><i className="icon-guest mr-8 text-accent-1"></i> Guest Count</div>
                        <div className="text-16 fw-700 text-dark-1">{guests || 1} Guest{guests !== 1 ? 's' : ''}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-12 uppercase tracking-wider text-sec fw-700 mb-5">Max Capacity</div>
                        <div className="text-16 fw-700 text-dark-1">Up to {villa.maxGuests} Guests</div>
                      </div>
                    </div>
                  </div>

                  {/* ADDONS SELECTION */}
                  {villa.addons && villa.addons.length > 0 && (
                    <div className="mb-50">
                      <div className="text-12 uppercase text-accent-1 fw-700 tracking-widest mb-10">STEP 2</div>
                      <h2 className="text-30 font-serif fw-700 text-dark-1 border-bottom-light pb-15 mb-20">Customize Your Stay</h2>
                      <div className="space-y-15">
                        {villa.addons.map(addon => {
                          const selected = selectedAddons.find(a => a.id === addon.id);
                          const quantity = selected ? selected.quantity : 0;
                          return (
                            <div key={addon.id} className="p-25 bg-white rounded-16 border-1 border-light-2 shadow-sm d-flex justify-between items-center flex-wrap y-gap-15">
                              <div>
                                <div className="text-16 fw-700 text-dark-1 mb-4">{addon.name}</div>
                                {addon.description && <div className="text-13 text-sec mb-8">{addon.description}</div>}
                                <div className="text-14 fw-600 text-accent-1">₹{(addon.priceCents / 100).toLocaleString('en-IN')} {addon.priceType === 'PER_DURATION' ? '/ day' : (addon.priceType === 'PER_UNIT' ? '/ unit' : '')}</div>
                              </div>
                              
                              <div className="d-flex items-center">
                                {addon.multiSelect ? (
                                  <div className="d-flex items-center border-1 border-light-2 rounded-100 overflow-hidden">
                                    <button 
                                      className="px-15 py-10 bg-light-1 hover:bg-light-2 text-dark-1 transition-colors"
                                      onClick={() => handleAddonChange(addon.id, Math.max(0, quantity - 1))}
                                    >
                                      -
                                    </button>
                                    <div className="px-15 text-14 fw-700">{quantity}</div>
                                    <button 
                                      className="px-15 py-10 bg-light-1 hover:bg-light-2 text-dark-1 transition-colors"
                                      onClick={() => handleAddonChange(addon.id, addon.maxQuantity ? Math.min(addon.maxQuantity, quantity + 1) : quantity + 1)}
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className={`px-25 py-10 rounded-100 text-13 fw-700 uppercase tracking-wider transition-all ${quantity > 0 ? 'bg-accent-1 text-white' : 'bg-light-1 text-sec border-1 border-light-2 hover:bg-light-2'}`}
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

                  {/* GUEST INFO CARD */}
                  <div className="mb-40">
                    <div className="text-12 uppercase text-accent-1 fw-700 tracking-widest mb-10">STEP {villa.addons && villa.addons.length > 0 ? '3' : '2'}</div>
                    <h2 className="text-30 font-serif fw-700 text-dark-1 border-bottom-light pb-15">Primary Guest</h2>
                  </div>
                  
                  <div className="p-40 bg-white rounded-24 border-1 border-light-2 shadow-sm">
                    <div className="row y-gap-30">
                      <div className="col-sm-6">
                        <div className="text-12 uppercase tracking-wider text-sec fw-700 mb-8">Full Name</div>
                        <div className="text-16 fw-700 text-dark-1 p-16 bg-light-1 rounded-12 border-1 border-white shadow-inner">{user.name || user.email.split('@')[0]}</div>
                      </div>
                      <div className="col-sm-6">
                        <div className="text-12 uppercase tracking-wider text-sec fw-700 mb-8">Email Address</div>
                        <div className="text-16 fw-700 text-dark-1 p-16 bg-light-1 rounded-12 border-1 border-white shadow-inner">{user.email}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: PAYMENT SUMMARY */}
                <div className="col-lg-5">
                  <div 
                    className="bg-white border-1 border-light-2 rounded-24 shadow-xl p-40 sticky-top" 
                    style={{ 
                      top: '120px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 30px 60px rgba(0,0,0,0.08)'
                    }}
                  >
                    <div className="text-12 uppercase text-accent-1 fw-700 tracking-widest mb-10 text-center">FINAL STEP</div>
                    <h3 className="text-28 font-serif fw-700 mb-30 text-center border-bottom-light pb-20">Price Breakdown</h3>
                    
                    {loading ? (
                      <div className="py-60 text-center">
                        <div className="size-40 rounded-full border-3 border-accent-1 border-t-transparent animate-spin mx-auto mb-15"></div>
                        <div className="text-14 fw-600 text-sec uppercase tracking-wider">Calculating Pricing...</div>
                      </div>
                    ) : pricing ? (
                      <>
                        <div className="space-y-20 mb-30 p-25 bg-light-1 rounded-16 border-1 border-white shadow-inner">
                          
                          {lineItems.length > 0 ? (
                            lineItems.map((item: any, idx: number) => (
                              <div key={idx} className="d-flex justify-between items-start text-14 text-dark-1 fw-500 pb-15 border-bottom-light">
                                <div>
                                  <span>{item.label}</span>
                                  {item.detail && <div className="text-12 text-sec mt-4">{item.detail}</div>}
                                </div>
                                <span className="fw-700">₹{(item.total / 100).toLocaleString('en-IN')}</span>
                              </div>
                            ))
                          ) : (
                            <div className="d-flex justify-between items-center text-14 text-dark-1 fw-500 pb-15 border-bottom-light">
                              <span>Base Villa Rental</span>
                              <span className="fw-700">₹{(basePrice / 100).toLocaleString('en-IN')}</span>
                            </div>
                          )}

                          {addonsPrice > 0 && lineItems.filter((li: any) => li.label.toLowerCase().includes('addon') || li.label.toLowerCase().includes('food') || li.label.toLowerCase().includes('person')).length === 0 && (
                            <div className="d-flex justify-between items-center text-14 text-dark-1 fw-500 pb-15 border-bottom-light">
                              <span>Selected Add-ons</span>
                              <span className="fw-700">₹{(addonsPrice / 100).toLocaleString('en-IN')}</span>
                            </div>
                          )}

                          <div className="d-flex justify-between items-center text-14 text-dark-1 fw-500 pt-5">
                            <span>Refundable Security Deposit</span>
                            <span className="fw-700">₹{(depositPrice / 100).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                        
                        <div className="mb-30">
                          <h4 className="text-16 fw-600 mb-15">Payment Option</h4>
                          <div className="d-flex gap-20">
                            <label className="flex-1 border-1 border-light-2 rounded-12 p-15 cursor-pointer hover:border-accent-1 transition-all" style={{ borderColor: paymentMode === 'FULL' ? 'var(--color-accent-1)' : '', backgroundColor: paymentMode === 'FULL' ? 'rgba(var(--color-accent-1-rgb), 0.05)' : '' }}>
                              <div className="d-flex items-center gap-10">
                                <input type="radio" name="paymentMode" checked={paymentMode === 'FULL'} onChange={() => setPaymentMode('FULL')} className="size-16" />
                                <span className="text-14 fw-600">Pay Full Amount</span>
                              </div>
                            </label>
                            <label className="flex-1 border-1 border-light-2 rounded-12 p-15 cursor-pointer hover:border-accent-1 transition-all" style={{ borderColor: paymentMode === 'ADVANCE' ? 'var(--color-accent-1)' : '', backgroundColor: paymentMode === 'ADVANCE' ? 'rgba(var(--color-accent-1-rgb), 0.05)' : '' }}>
                              <div className="d-flex items-center gap-10">
                                <input type="radio" name="paymentMode" checked={paymentMode === 'ADVANCE'} onChange={() => setPaymentMode('ADVANCE')} className="size-16" />
                                <span className="text-14 fw-600">Pay 50% Advance</span>
                              </div>
                            </label>
                          </div>
                        </div>
                        
                        <div className="d-flex justify-between items-end mb-35 px-10">
                          <span className="text-16 uppercase tracking-wider font-bold text-sec">Amount to Pay Now</span>
                          <span className="text-35 font-serif fw-700 text-dark-1 leading-none">
                            ₹{(paymentMode === 'ADVANCE' ? Math.floor((totalPrice - depositPrice) / 2) / 100 : totalPrice / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        <button
                          onClick={handleMockPayment}
                          disabled={processing || loading}
                          className="button bg-dark-1 text-white rounded-200 w-1/1 py-20 text-15 uppercase tracking-wider fw-700 shadow-md hover:shadow-xl transition-all d-flex justify-center items-center mb-15"
                        >
                          {processing ? 'PROCESSING...' : 'MOCK PAYMENT (SKIP RAZORPAY)'}
                        </button>

                        <button
                          onClick={handlePayment}
                          disabled={processing || loading}
                          className="button bg-accent-1 text-white rounded-200 w-1/1 py-20 text-15 uppercase tracking-wider fw-700 shadow-md hover:shadow-xl hover:bg-dark-1 transition-all d-flex justify-center items-center"
                        >
                          {processing ? (
                            <>
                              <span className="size-20 rounded-full border-3 border-white border-t-transparent animate-spin mr-10"></span>
                              PROCESSING PAYMENT...
                            </>
                          ) : (
                            <>
                              <i className="icon-lock text-18 mr-10"></i> SECURE PAYMENT
                            </>
                          )}
                        </button>
                        <p className="text-13 text-sec text-center mt-20 fw-500">
                          By clicking this button, you agree to our Terms of Service and Cancellation Policy.
                        </p>
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
