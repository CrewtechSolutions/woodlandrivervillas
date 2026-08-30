import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { useAuth } from '../context/AuthContext';
import { bookingApiService, coreApiService } from '../services/apiService';
import { Booking } from '../types';
import { openRazorpayCheckout } from '../utils/razorpay';

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const BookingDetailsPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBooking = async () => {
      try {
        setLoading(true);
        // We fetch all bookings and filter by ID since there's no specific GET /bookings/:id endpoint currently
        const allBookings = await bookingApiService.getMyBookings();
        const found = allBookings.find(b => b.id === bookingId);
        
        if (!found) {
          setError('Booking not found');
        } else {
          setBooking(found);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, user, authLoading, navigate]);

  const handlePayBalance = async (isDeposit: boolean = false) => {
    if (!booking) return;
    
    const rawData = booking.raw || booking;
    const totalCents = rawData.totalCents || booking.totalPrice * 100;
    const paymentCents = rawData.paymentCents || 0;
    const depositAmount = rawData.depositCents || 1000000;
    const remainingBalance = totalCents - paymentCents;
    if (remainingBalance <= 0) return;

    // Calculate how much they are paying
    const roomBalanceCents = Math.max(0, remainingBalance - depositAmount);
    // If it's the deposit button, we pay the deposit. Otherwise, we pay the room balance. 
    // Wait, if it's full payment, pay everything? The UI separates them.
    const amountToPay = isDeposit ? Math.min(remainingBalance, depositAmount) : roomBalanceCents;
    if (amountToPay <= 0) return;

    setProcessing(isDeposit ? 'deposit' : 'balance');
    
    // Check if it's a mock booking to skip razorpay
    const isMock = rawData.referenceId?.startsWith('pay_mock_');

    if (isMock) {
      // Mock payment flow
      setTimeout(async () => {
        try {
          await coreApiService.confirmBookingPayment(
            booking.id,
            'pay_mock_balance_' + Date.now(),
            'RAZORPAY',
            amountToPay,
            isDeposit ? amountToPay : 0
          );
          window.location.reload();
        } catch (err: any) {
          setError(err.message || 'Payment update failed.');
          setProcessing(false);
        }
      }, 1500);
      return;
    }

    try {
      // Razorpay real flow
      const orderRes = await coreApiService.createRazorpayOrder(booking.id);
      if (!orderRes.id) throw new Error('Failed to create payment order');

      openRazorpayCheckout(
        orderRes.id,
        amountToPay,
        user?.name || '',
        user?.email || '',
        user?.phone || '',
        async (response: any) => {
          await coreApiService.confirmBookingPayment(
            booking.id,
            response.razorpay_payment_id,
            'RAZORPAY',
            amountToPay,
            isDeposit ? amountToPay : 0
          );
          window.location.reload();
        },
        (errorRes: any) => {
          console.error('Payment failed', errorRes);
          setError('Payment failed or cancelled.');
          setProcessing(false);
        }
      );
    } catch (err: any) {
      setError(err.message || 'Payment initialization failed.');
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="py-120 text-center">
        <div className="size-40 rounded-full border-3 border-accent-1 border-t-transparent animate-spin mx-auto mb-15"></div>
        <div className="text-14 fw-600 text-sec uppercase tracking-wider">Loading details...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-120 text-center">
        <h2 className="text-24 fw-600 mb-20">{error || 'Booking not found'}</h2>
        <button onClick={() => navigate('/account')} className="button bg-dark-1 text-white px-30 py-15 rounded-100">
          Back to My Account
        </button>
      </div>
    );
  }

  const rawData = booking.raw || booking;
  const checkIn = new Date(rawData.startTime || booking.checkIn);
  const checkOut = new Date(rawData.endTime || booking.checkOut);
  
  // Safely parse cents
  const totalCents = Number(rawData.totalCents ?? (booking.totalPrice * 100) ?? 0) || 0;
  const paymentCents = Number(rawData.paymentCents ?? 0) || 0;
  const remainingBalance = Math.max(0, totalCents - paymentCents);
  
  const depositAmount = rawData.depositCents !== undefined ? Number(rawData.depositCents) : 1000000; // default to ₹10,000 if not found
  const roomBalanceCents = Math.max(0, remainingBalance - depositAmount);
  const unpaidDepositCents = remainingBalance > roomBalanceCents ? remainingBalance - roomBalanceCents : 0;

  const mainItem = rawData.items?.[0];
  const villaName = mainItem?.offering?.product?.name || booking.villaName || 'Woodland River Villa';
  
  // Extract guests from notes or metadata if possible
  const notesMatch = rawData.metadata?.notes?.match(/Guests: (\d+)/) || rawData.notes?.match(/Guests: (\d+)/);
  const guests = notesMatch ? notesMatch[1] : booking.guestsDisplay || booking.guests || 'N/A';
  
  const pricing = rawData.metadata?.pricingBreakdown || {};
  const lineItems = pricing?.details?.lineItems || [];
  const basePriceCents = pricing?.price?.base ?? (totalCents - depositAmount);

  return (
    <>
      <SEO title={`Booking Details - ${villaName} | Woodland River Villa`} description="View your booking details and manage payments." />

      <section className="pageHero -type-1 -items-center relative overflow-hidden" style={{ minHeight: '35vh', padding: '140px 0 80px 0' }}>
        <div className="pageHero__bg">
          <img src="/assets/img/pageHero/1.png" alt="Woodland River Villa" loading="lazy" />
        </div>
        <div className="pageHero-account-overlay"></div>
        
        <div className="container relative z-10 text-center pt-40">
          <div className="d-flex justify-between items-center w-1/1 mb-40 mt-20">
            <button onClick={() => navigate('/account')} className="d-inline-flex items-center text-14 fw-600 text-dark-1 hover:text-accent-1 transition-all bg-white px-25 py-15 rounded-100 border-1 border-light-2" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <i className="icon-chevron-left mr-10 text-12"></i>
              Back to Bookings
            </button>
            <button onClick={() => window.print()} className="d-inline-flex items-center text-14 fw-700 text-white transition-all bg-accent-1 px-25 py-15 rounded-100 border-1 border-accent-1 hover-accent-dark" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              <i className="icon-download mr-10 text-14"></i>
              Download Invoice
            </button>
          </div>

          <div className="d-inline-block text-12 uppercase tracking-widest fw-700 mb-20 text-white px-25 py-10 rounded-100 border-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
            RESERVATION SUMMARY
          </div>
          <h1 className="pageHero__title text-50 md:text-40 font-serif fw-700 mb-25 text-white drop-shadow-md">Booking #{booking.id.slice(-6).toUpperCase()}</h1>
          <div className="d-flex justify-center items-center gap-10">
            <span className={`px-20 py-8 rounded-100 text-13 fw-700 uppercase tracking-wider shadow-lg ${
              booking.status === 'CONFIRMED' ? 'bg-green-500 text-white' : 
              booking.status === 'CANCELLED' ? 'bg-red-500 text-white' : 
              'bg-blue-500 text-white'
            }`} style={booking.status === 'CONFIRMED' ? { backgroundColor: '#10b981' } : {}}>
              {booking.status}
            </span>
          </div>
        </div>
      </section>

      <section className="layout-pt-md layout-pb-lg bg-light-2">
        <div className="container">
          <div className="row y-gap-40">
            {/* LEFT COLUMN: Booking Details */}
            <div className="col-lg-7">
              <div className="bg-white rounded-24 shadow-sm p-40 mb-30 border-1 border-light-2">
                <h3 className="text-24 font-serif fw-700 mb-30 border-bottom-light pb-20 d-flex items-center">
                  <i className="icon-home text-accent-1 mr-15 text-28"></i> 
                  Stay Details
                </h3>
                
                <div className="row y-gap-30">
                  <div className="col-sm-6">
                    <div className="d-flex items-start">
                      <div className="size-50 rounded-full bg-light-1 flex-center mr-15 text-accent-1 text-20 shadow-inner">
                        <i className="icon-calendar-2"></i>
                      </div>
                      <div>
                        <div className="text-12 uppercase tracking-wider text-sec fw-700 mb-5">Check-in</div>
                        <div className="text-16 fw-700 text-dark-1 mb-2">{formatDate(checkIn)}</div>
                        <div className="text-14 text-sec">From 2:00 PM</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex items-start">
                      <div className="size-50 rounded-full bg-light-1 flex-center mr-15 text-accent-1 text-20 shadow-inner">
                        <i className="icon-calendar-2"></i>
                      </div>
                      <div>
                        <div className="text-12 uppercase tracking-wider text-sec fw-700 mb-5">Check-out</div>
                        <div className="text-16 fw-700 text-dark-1 mb-2">{formatDate(checkOut)}</div>
                        <div className="text-14 text-sec">By 11:00 AM</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 border-top-light pt-30">
                    <div className="row y-gap-20">
                      <div className="col-sm-6">
                        <div className="d-flex items-center">
                          <i className="icon-bed text-accent-1 text-24 mr-15"></i>
                          <div>
                            <div className="text-12 uppercase tracking-wider text-sec fw-700 mb-2">Villa</div>
                            <div className="text-16 fw-700 text-dark-1">{villaName}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="d-flex items-center">
                          <i className="icon-guest text-accent-1 text-24 mr-15"></i>
                          <div>
                            <div className="text-12 uppercase tracking-wider text-sec fw-700 mb-2">Guests</div>
                            <div className="text-16 fw-700 text-dark-1">{guests}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 mt-10">
                        <div className="d-flex items-center bg-light-1 p-15 rounded-12 border-1 border-light-2">
                          <i className="icon-location text-accent-1 text-20 mr-15"></i>
                          <div>
                            <div className="text-12 uppercase tracking-wider text-sec fw-700 mb-2">Location</div>
                            <div className="text-15 fw-600 text-dark-1">Woodland River Villas, Zirad, Alibaug, Maharashtra 402201</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Addons Section if any exist */}
              {rawData.items && rawData.items.length > 1 && (
                <div className="bg-white rounded-24 shadow-sm p-40 border-1 border-light-2">
                  <h3 className="text-22 font-serif fw-700 mb-20 border-bottom-light pb-15 d-flex items-center">
                    <i className="icon-grid text-accent-1 mr-15 text-24"></i>
                    Selected Add-ons
                  </h3>
                  <div className="space-y-15 mt-20">
                    {rawData.items.slice(1).map((item: any, idx: number) => (
                      <div key={idx} className="d-flex justify-between items-center text-15 fw-500 bg-light-1 p-20 rounded-12 border-1 border-white shadow-inner">
                        <span className="d-flex items-center">
                          <span className="size-30 rounded-full bg-white text-dark-1 flex-center fw-700 shadow-sm mr-15">{item.quantity}x</span>
                          {item.offering?.product?.name || 'Add-on'}
                        </span>
                        <span className="fw-700 text-dark-1">₹{((item.priceCents * item.quantity) / 100).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Payment Summary */}
            <div className="col-lg-5">
              <div 
                className="rounded-24 p-40 sticky-top border-1" 
                style={{ 
                  top: '120px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  WebkitBackdropFilter: 'blur(20px)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.06)',
                  borderColor: 'rgba(255,255,255,0.8)'
                }}
              >
                <div className="text-center mb-35">
                  <div className="size-60 rounded-full flex-center text-accent-1 text-24 mx-auto mb-20 shadow-inner" style={{ backgroundColor: 'rgba(5, 77, 67, 0.1)' }}>
                    <i className="icon-cart"></i>
                  </div>
                  <h3 className="text-26 font-serif fw-700">Payment Summary</h3>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-35 bg-white p-25 rounded-16 border-1 border-light-2 shadow-inner">
                  <div className="d-flex justify-between text-13 fw-700 mb-12 uppercase tracking-wider">
                    <span style={{ color: '#059669' }}>Paid: ₹{(paymentCents / 100).toLocaleString('en-IN')}</span>
                    <span className="text-sec">Total: ₹{(totalCents / 100).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-1/1 h-10 bg-light-2 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                      style={{ width: `${Math.min(100, Math.max(0, (paymentCents / totalCents) * 100))}%`, backgroundColor: '#10b981' }}
                    >
                      <div className="absolute inset-0 w-full h-full transform skew-x-12 translate-x-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
                    </div>
                  </div>
                                <div className="space-y-15 mb-30 bg-white rounded-16 border-1 border-light-2 p-30 shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="d-flex items-center text-13 uppercase tracking-widest fw-700 text-sec mb-25 border-bottom-light pb-15">
                    <i className="icon-wallet mr-10 text-18"></i> PAYMENT LEDGER
                  </div>

                  {/* Base Price */}
                  <div className="d-flex justify-between items-start text-15 fw-500 mb-15">
                    <div>
                      <div className="text-dark-1 fw-600">Base Price</div>
                      {pricing?.details?.days && <div className="text-13 text-sec mt-5">{pricing.details.days} DAY(s) @ {(pricing.price.base / 100 / pricing.details.days).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>}
                    </div>
                    <span className="fw-700 text-16 text-dark-1">₹{((pricing?.price?.base || Math.max(0, basePriceCents)) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  {/* Subtotal */}
                  {pricing?.price?.base && (
                    <div className="d-flex justify-between text-15 fw-700 border-top-light pt-20 mb-20 text-sec">
                      <span>Subtotal (Before Adjustments)</span>
                      <span>₹{(pricing.price.base / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {/* Line Items (Surcharges, Addons, Taxes) */}
                  {lineItems.filter((item: any) => item.label?.toLowerCase() !== 'base price').length > 0 && (
                    <div className="space-y-15 mb-20">
                      {lineItems.filter((item: any) => item.label?.toLowerCase() !== 'base price').map((item: any, idx: number) => {
                        const itemPrice = Number(item.price ?? item.amount ?? item.priceCents ?? 0);
                        const isPositive = itemPrice >= 0;
                        const isSurcharge = item.label?.toLowerCase().includes('surcharge');
                        return (
                          <div key={idx} className="d-flex justify-between items-start text-15 fw-500">
                            <div>
                              <span className="fw-700" style={{ color: isSurcharge ? '#f97316' : 'var(--color-dark-1)' }}>{item.label || 'Item'}</span>
                              {item.description && <span className="text-13 text-sec ml-5">({item.description})</span>}
                            </div>
                            <span className="fw-700 text-16" style={{ color: isPositive && isSurcharge ? '#f97316' : 'var(--color-dark-1)' }}>
                              {isPositive ? '+' : ''}₹{(itemPrice / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Total Booking Amount (Excl Deposit) */}
                  <div className="d-flex justify-between text-18 fw-800 border-top-light pt-20 mt-20 mb-30 text-dark-1">
                    <span>Total Amount</span>
                    <span>₹{((pricing?.price?.total || (totalCents - depositAmount)) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  {/* Security Deposit Box */}
                  <div className="rounded-12 p-25 border-1 mb-30" style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa' }}>
                    <div className="d-flex justify-between items-start mb-20">
                      <div>
                        <div className="fw-800 text-16 uppercase tracking-wider mb-5" style={{ color: '#ea580c' }}>Required Security Deposit</div>
                        <div className="text-13 text-sec">Total deposit to be collected before handover:</div>
                      </div>
                      <span className="text-28 fw-800" style={{ color: '#f97316' }}>₹{(depositAmount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="border-left-2 pl-15 mb-25" style={{ borderColor: '#fdba74' }}>
                      <div className="text-14 fw-700 text-dark-1">Security Deposit Terms</div>
                      <div className="text-13 mt-5" style={{ color: '#f97316' }}>Calculation: Fixed Offering Deposit</div>
                    </div>

                    <div className="border-top-light pt-20 d-flex justify-between items-center">
                      <div className="text-13 fw-800 text-sec uppercase tracking-wider">Deposit Paid</div>
                      <div className="text-20 fw-800 text-dark-1">
                        ₹{((paymentCents >= totalCents ? depositAmount : 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="space-y-10 pt-10">
                    <div className="d-flex justify-between text-15 fw-500 text-sec">
                      <span>Total Booking Amount</span>
                      <span className="fw-700 text-dark-1">₹{((pricing?.price?.total || (totalCents - depositAmount)) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    <div className="d-flex justify-between text-15 fw-700" style={{ color: '#059669' }}>
                      <span>Total Deposit Paid</span>
                      <span>-₹{((paymentCents >= totalCents ? depositAmount : 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="d-flex justify-between text-15 fw-700" style={{ color: '#059669' }}>
                      <span>Total Payment Paid</span>
                      <span>-₹{(paymentCents / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-between items-center mb-15 pt-25 px-10">
                  <span className="text-16 uppercase tracking-wider fw-700 text-dark-1">Balance Due</span>
                  <span className="text-32 font-serif fw-700 text-accent-1 leading-none">
                    ₹{(remainingBalance / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div><div className="bg-light-1 p-15 rounded-12 mb-30 border-1 border-light-2 text-13 fw-500 text-sec d-flex items-start">
                  <i className="icon-shield text-accent-1 text-16 mr-10 mt-2"></i>
                  <span>A refundable security deposit of ₹{(depositAmount / 100).toLocaleString('en-IN')} is tracked as a distinct payment.</span>
                </div>

                {remainingBalance > 0 ? (
                  <div className="d-flex flex-column gap-15">
                    {roomBalanceCents > 0 && (
                      <div className="border-top-light pt-20">
                        <div className="d-flex justify-between items-center mb-15">
                          <span className="text-14 uppercase tracking-wider fw-700 text-dark-1">Room Balance Due</span>
                          <span className="text-24 font-serif fw-700 text-dark-1">
                            ₹{(roomBalanceCents / 100).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <button
                          onClick={() => handlePayBalance(false)}
                          disabled={!!processing}
                          className="button bg-dark-1 text-white rounded-200 w-1/1 py-20 text-14 uppercase tracking-wider fw-700 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all d-flex justify-center items-center group"
                        >
                          {processing === 'balance' ? (
                            <><span className="size-20 rounded-full border-3 border-white border-t-transparent animate-spin mr-10"></span>PROCESSING...</>
                          ) : (
                            <><i className="icon-lock text-18 mr-10 text-accent-1 group-hover:text-white transition-all"></i> PAY ROOM BALANCE</>
                          )}
                        </button>
                      </div>
                    )}
                    
                    {unpaidDepositCents > 0 && (
                      <div className="border-top-light pt-20">
                        <div className="d-flex justify-between items-center mb-15">
                          <span className="text-14 uppercase tracking-wider fw-700 text-dark-1">Security Deposit Due</span>
                          <span className="text-24 font-serif fw-700 text-dark-1">
                            ₹{(unpaidDepositCents / 100).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <button
                          onClick={() => handlePayBalance(true)}
                          disabled={!!processing}
                          className="button bg-accent-1 text-white rounded-200 w-1/1 py-20 text-14 uppercase tracking-wider fw-700 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover-accent-dark transition-all d-flex justify-center items-center"
                        >
                          {processing === 'deposit' ? (
                            <><span className="size-20 rounded-full border-3 border-white border-t-transparent animate-spin mr-10"></span>PROCESSING...</>
                          ) : (
                            <><i className="icon-shield text-18 mr-10"></i> PAY SECURITY DEPOSIT</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-30 rounded-20 text-center border-1 shadow-inner" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}>
                    <div className="size-60 rounded-full flex-center mx-auto mb-20 shadow-sm" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                      <i className="icon-check text-28"></i>
                    </div>
                    <div className="fw-700 text-20 mb-5 font-serif">Fully Paid</div>
                    <div className="text-15 fw-500">Thank you! Your payment is complete.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
    </>
  );
};

export default BookingDetailsPage;
