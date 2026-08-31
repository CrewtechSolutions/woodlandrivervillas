import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { useAuth } from '../context/AuthContext';
import { bookingApiService, coreApiService } from '../services/apiService';
import { Booking } from '../types';
import { openRazorpayCheckout } from '../utils/razorpay';
import { generateInvoicePdf } from '../utils/generateInvoice';
import '../styles/bookingDetails.css';

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const formatPaymentDateTime = (dateVal: any) => {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (err) {
    return String(dateVal);
  }
};

export const BookingDetailsPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | false>(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);
  const [localPayments, setLocalPayments] = useState<any[]>([]);

  const fetchBookingDetails = async (showLoadingSpinner: boolean = false) => {
    try {
      if (showLoadingSpinner) setLoading(true);
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
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    fetchBookingDetails(true);
  }, [bookingId, user, authLoading, navigate]);

  const handleDownloadInvoice = () => {
    if (booking && user) {
      generateInvoicePdf(booking, user);
    }
  };

  const handlePayBalance = async () => {
    if (!booking) return;
    
    const rawData = booking.raw || booking;
    const totalCents = rawData.totalCents || booking.totalPrice * 100;
    const paymentCents = rawData.paymentCents || 0;
    const depositAmount = rawData.depositCents || 1000000;
    const remainingBalance = totalCents - paymentCents;
    if (remainingBalance <= 0) return;

    const amountToPay = remainingBalance;
    const roomBalanceCents = Math.max(0, remainingBalance - depositAmount);
    const depositToPayCents = remainingBalance > roomBalanceCents ? remainingBalance - roomBalanceCents : 0;

    setProcessing('balance');
    setPaymentSuccessMessage(null);
    setError('');

    const isMock = rawData.referenceId?.startsWith('pay_mock_');

    if (isMock) {
      setTimeout(async () => {
        try {
          const payRef = 'pay_mock_balance_' + Date.now();
          await coreApiService.confirmBookingPayment(
            booking.id,
            payRef,
            'RAZORPAY',
            amountToPay,
            depositToPayCents
          );
          setLocalPayments(prev => [
            ...prev,
            {
              referenceId: payRef,
              paymentMethod: 'Razorpay / Online',
              type: 'Balance Settlement',
              amountCents: amountToPay,
              status: 'SUCCESS',
              createdAt: new Date().toISOString()
            }
          ]);
          setPaymentSuccessMessage(`Payment of ₹${(amountToPay / 100).toLocaleString('en-IN')} logged successfully! Ledger updated.`);
          await fetchBookingDetails(false);
        } catch (err: any) {
          setError(err.message || 'Payment update failed.');
          setProcessing(false);
        }
      }, 1200);
      return;
    }

    try {
      const orderRes = await coreApiService.createRazorpayOrder(booking.id);
      if (!orderRes.id) throw new Error('Failed to create payment order');

      openRazorpayCheckout({
        amount: amountToPay,
        name: 'Woodland River Villas',
        description: 'Payment for Outstanding Reservation Balance',
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        onSuccess: async (response: any) => {
          try {
            const payRef = response.razorpay_payment_id || `PAY-${Date.now()}`;
            await coreApiService.confirmBookingPayment(
              booking.id,
              payRef,
              'RAZORPAY',
              amountToPay,
              depositToPayCents
            );
            setLocalPayments(prev => [
              ...prev,
              {
                referenceId: payRef,
                paymentMethod: 'Razorpay / Online',
                type: 'Balance Settlement',
                amountCents: amountToPay,
                status: 'SUCCESS',
                createdAt: new Date().toISOString()
              }
            ]);
            setPaymentSuccessMessage(`Payment of ₹${(amountToPay / 100).toLocaleString('en-IN')} logged successfully! Ledger updated.`);
            await fetchBookingDetails(false);
          } catch (err: any) {
            setError(err.message || 'Payment update failed.');
            setProcessing(false);
          }
        },
        onDismiss: () => {
          setError('Payment failed or cancelled.');
          setProcessing(false);
        }
      });
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
  
  const totalCents = Number(rawData.totalCents ?? (booking.totalPrice * 100)) || 0;
  const paymentCents = Number(rawData.paymentCents ?? 0) || 0;
  const remainingBalance = Math.max(0, totalCents - paymentCents);
  
  const depositAmount = rawData.depositCents !== undefined ? Number(rawData.depositCents) : 1000000;
  const roomBalanceCents = Math.max(0, remainingBalance - depositAmount);
  const unpaidDepositCents = remainingBalance > roomBalanceCents ? remainingBalance - roomBalanceCents : 0;

  const mainItem = rawData.items?.[0];
  const villaName = mainItem?.offering?.product?.name || booking.villaName || 'Woodland River Villa';
  
  const notesMatch = rawData.metadata?.notes?.match(/Guests: (\d+)/) || rawData.notes?.match(/Guests: (\d+)/);
  const guests = notesMatch ? notesMatch[1] : booking.guestsDisplay || booking.guests || 'N/A';
  
  const pricing = rawData.metadata?.pricingBreakdown || rawData.pricingBreakdown || rawData.breakdown || rawData.metadata?.breakdown || {};
  let lineItems: any[] = pricing?.details?.lineItems || pricing?.lineItems || [];

  if ((!lineItems || lineItems.length === 0) && rawData.items && Array.isArray(rawData.items) && rawData.items.length > 0) {
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const totalRoomCents = totalCents - depositAmount;
    const synthesized: any[] = [];
    let addonsTotalCents = 0;

    rawData.items.slice(1).forEach((item: any) => {
      const itemValCents = Number(item.totalCents ?? item.priceCents ?? (item.price ? item.price * 100 : 0)) * (item.quantity || 1);
      addonsTotalCents += itemValCents;
      synthesized.push({
        label: item.offering?.product?.name || item.name || 'Selected Add-on',
        total: itemValCents,
        detail: `Qty ${item.quantity || 1} (Per Day)`,
        units: item.quantity || 1
      });
    });

    const baseVillaCents = Math.max(0, totalRoomCents - addonsTotalCents);
    synthesized.unshift({
      label: 'Base Price',
      total: baseVillaCents,
      detail: `${nights} DAY(s) @ ₹${((baseVillaCents / 100) / nights).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      units: nights
    });

    lineItems = synthesized;
  }

  const nightsCount = pricing?.details?.days || Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <>
      <SEO title={`Booking Details - ${villaName} | Woodland River Villa`} description="View your booking details and manage payments." />

      {/* COMPACT HERO BANNER BACKGROUND */}
      <section className="pageHero -compact -type-1 -items-center relative overflow-hidden" style={{ height: '120px', minHeight: '120px' }}>
        <div className="pageHero__bg">
          <img src="/assets/img/pageHero/1.png" alt="Woodland River Villa" loading="lazy" />
        </div>
        <div className="pageHero-account-overlay"></div>
      </section>

      {/* LUXURY BREADCRUMB BAR */}
      <div className="luxury-breadcrumb-bar">
        <div className="container">
          <div className="d-flex justify-between items-center w-1/1 flex-wrap gap-15">
            <nav className="luxury-breadcrumb-nav">
              <Link to="/" className="luxury-breadcrumb-link">
                <i className="icon-home text-15 mr-6" style={{ color: '#004d43' }}></i> HOME
              </Link>
              <span className="luxury-breadcrumb-separator">›</span>
              <Link to="/account" className="luxury-breadcrumb-link">
                MY ACCOUNT
              </Link>
              <span className="luxury-breadcrumb-separator">›</span>
              <Link to="/account?tab=bookings" state={{ tab: 'bookings' }} className="luxury-breadcrumb-link" style={{ color: '#004d43' }}>
                <i className="icon-chevron-left text-12 mr-6"></i> MY RESERVATIONS
              </Link>
              <span className="luxury-breadcrumb-separator">›</span>
              <span className="luxury-breadcrumb-active">
                BOOKING #{booking.bookingCode || booking.id.slice(-6).toUpperCase()}
              </span>
            </nav>

            <button
              onClick={handleDownloadInvoice}
              className="btn-download-invoice-luxury"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <polyline points="9 15 12 18 15 15"></polyline>
              </svg>
              Download Invoice
            </button>
          </div>
        </div>
      </div>

      {/* MAIN REDESIGNED SECTION */}
      <div className="bd-wrapper">
        <div className="bd-container">
          
          {/* TOP SECTION: STAY DETAILS */}
          <div className="bd-card">
            <div className="bd-card-header">
              <h2 className="bd-card-title">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#cfa856" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Stay Details
              </h2>
              <span className="bd-badge-ref">
                ID: {booking.id}
              </span>
            </div>

            {/* Bento Cards Grid */}
            <div className="bd-grid-4">
              {/* Check-in */}
              <div className="bd-info-item">
                <div className="bd-info-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cfa856" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div className="bd-info-label">Check-in</div>
                <div className="bd-info-value">{formatDate(checkIn)}</div>
                <div className="bd-info-sub">From 2:00 PM</div>
              </div>

              {/* Check-out */}
              <div className="bd-info-item">
                <div className="bd-info-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cfa856" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div className="bd-info-label">Check-out</div>
                <div className="bd-info-value">{formatDate(checkOut)}</div>
                <div className="bd-info-sub">By 11:00 AM</div>
              </div>

              {/* Guests & Duration */}
              <div className="bd-info-item">
                <div className="bd-info-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cfa856" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className="bd-info-label">Guests & Duration</div>
                <div className="bd-info-value">{guests}</div>
                <div className="bd-info-sub">{nightsCount} Night(s) Stay</div>
              </div>

              {/* Villa Reserved */}
              <div className="bd-info-item">
                <div className="bd-info-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cfa856" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 4v16"></path>
                    <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                    <path d="M2 17h20"></path>
                    <path d="M6 8v9"></path>
                  </svg>
                </div>
                <div className="bd-info-label">Villa Reserved</div>
                <div className="bd-info-value">{villaName}</div>
                <div className="bd-info-sub">Luxury Private Pool Villa</div>
              </div>
            </div>

            {/* Resort Location Box */}
            <div className="bd-location-box">
              <div className="bd-info-icon-circle" style={{ margin: 0, flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cfa856" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div>
                <div className="bd-info-label" style={{ marginBottom: 2 }}>Resort Location & Address</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#122223' }}>
                  Woodland River Villas, 230/3 Zirad Pada, Zirad, Alibaug, Maharashtra 402201
                </div>
              </div>
            </div>

            {/* Selected Add-ons */}
            {rawData.items && rawData.items.length > 1 && (
              <div className="bd-addons-container">
                <div className="bd-info-label" style={{ fontSize: 12, marginBottom: 14, color: '#122223' }}>
                  Selected Add-ons ({rawData.items.length - 1})
                </div>
                <div className="bd-addon-grid">
                  {rawData.items.slice(1).map((item: any, idx: number) => (
                    <div key={idx} className="bd-addon-card">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="bd-addon-qty">{item.quantity || 1}x</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#122223' }}>
                          {item.offering?.product?.name || item.name || 'Add-on Service'}
                        </span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#122223' }}>
                        ₹{((Number(item.totalCents ?? item.priceCents ?? (item.price ? item.price * 100 : 0)) * (item.quantity || 1)) / 100).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM SECTION: PAYMENT SUMMARY & LEDGER */}
          <div className="bd-card">
            <div className="bd-card-header">
              <div>
                <h2 className="bd-card-title">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#cfa856" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  Payment Summary & Ledger
                </h2>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                  Comprehensive itemized financial ledger & transaction log
                </div>
              </div>
              <span className={remainingBalance <= 0 ? "bd-status-settled" : "bd-status-due"}>
                {remainingBalance <= 0 ? 'Fully Settled' : `Balance Due: ₹${(remainingBalance / 100).toLocaleString('en-IN')}`}
              </span>
            </div>

            {/* Payment Progress Bar */}
            <div style={{ background: '#faf9f6', border: '1px solid #eae8e1', borderRadius: 16, padding: '20px 24px', marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 10, letterSpacing: '0.04em' }}>
                <span style={{ color: '#059669' }}>TOTAL PAID: ₹{(paymentCents / 100).toLocaleString('en-IN')}</span>
                <span style={{ color: '#122223' }}>TOTAL PAYABLE: ₹{(totalCents / 100).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ width: '100%', height: 10, background: '#e2e8f0', borderRadius: 100, overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${Math.min(100, Math.max(0, (paymentCents / totalCents) * 100))}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                    borderRadius: 100,
                    transition: 'width 1s ease'
                  }}
                ></div>
              </div>
            </div>

            {/* Itemized Payment Ledger Table */}
            <div className="bd-ledger-box">
              <div className="bd-ledger-header">
                <span>ITEMIZED PAYMENT LEDGER</span>
                <span>INR (₹)</span>
              </div>

              <div style={{ background: '#ffffff' }}>
                {(() => {
                  const baseItem = lineItems.find((i: any) => 
                    /base price|base rental|villa rental|villa stay|stay charge/i.test(i.label || '')
                  );
                  const otherItems = lineItems.filter((i: any) => 
                    !/base price|base rental|villa rental|villa stay|stay charge/i.test(i.label || '')
                  );
                  
                  const baseCents = baseItem 
                    ? Number(baseItem.total ?? baseItem.totalCents ?? baseItem.price ?? baseItem.unitPrice ?? 0)
                    : (pricing?.price?.base ?? (totalCents - depositAmount));

                  const perNightRate = (baseCents / 100) / nightsCount;

                  return (
                    <>
                      {/* Base Villa Price Row */}
                      <div className="bd-ledger-row">
                        <div>
                          <div className="bd-ledger-item-title">{baseItem?.label || 'Base Price'}</div>
                          <div className="bd-ledger-item-sub">
                            {baseItem?.detail || `${nightsCount} DAY(s) @ ₹${perNightRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                          </div>
                        </div>
                        <div className="bd-ledger-amount">
                          ₹{(baseCents / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Selected Add-ons & Charges */}
                      {otherItems.map((item: any, idx: number) => {
                        const itemValCents = Number(item.total ?? item.totalCents ?? item.price ?? item.amount ?? item.priceCents ?? item.unitPrice ?? 0);
                        const isPositive = itemValCents >= 0;

                        return (
                          <div key={idx} className="bd-ledger-row">
                            <div>
                              <div className="bd-ledger-item-title">{item.label || 'Add-on Charge'}</div>
                              {item.detail ? (
                                <div className="bd-ledger-item-sub">{item.detail}</div>
                              ) : item.description ? (
                                <div className="bd-ledger-item-sub">{item.description}</div>
                              ) : null}
                            </div>
                            <div className="bd-ledger-amount">
                              {isPositive ? '+' : ''}₹{(itemValCents / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}

                {/* Subtotal Bar */}
                <div className="bd-ledger-total-bar">
                  <span>Total Stay & Add-on Charges</span>
                  <span>₹{((totalCents - depositAmount) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Refundable Security Deposit Card */}
                <div className="bd-deposit-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: '#ea580c', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        Refundable Security Deposit
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>
                        Collected prior to check-in & refunded post check-out inspection.
                      </div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#f97316' }}>
                      ₹{(depositAmount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #fed7aa', paddingTop: 14, marginTop: 14 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      DEPOSIT PAYMENT STATUS:
                    </span>
                    <span style={{ 
                      background: paymentCents >= totalCents ? '#dcfce7' : '#fef3c7', 
                      color: paymentCents >= totalCents ? '#15803d' : '#b45309', 
                      fontSize: 11, 
                      fontWeight: 700, 
                      padding: '4px 14px', 
                      borderRadius: 100,
                      textTransform: 'uppercase'
                    }}>
                      {paymentCents >= totalCents ? 'DEPOSIT PAID' : 'DEPOSIT OUTSTANDING'}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Transaction History Log Table */}
            <div style={{ background: '#ffffff', border: '1px solid #e8e6e1', borderRadius: 16, padding: '24px', marginBottom: 28 }}>
              <div style={{ fontSize: 16, fontFamily: 'Cinzel, serif', fontWeight: 700, color: '#122223', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Recorded Payment Ledger History
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="bd-table">
                  <thead>
                    <tr>
                      <th>TRANSACTION REF</th>
                      <th>DATE & TIME</th>
                      <th>PAYMENT GATEWAY</th>
                      <th>TYPE</th>
                      <th style={{ textAlign: 'right' }}>AMOUNT</th>
                      <th style={{ textAlign: 'right' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const rawPayments: any[] = 
                        rawData.metadata?.paymentHistory || 
                        rawData.paymentHistory || 
                        rawData.metadata?.payment_history || 
                        rawData.payments || 
                        rawData.transactions || 
                        rawData.metadata?.payments || 
                        rawData.metadata?.transactions || 
                        [];

                      const paymentList: any[] = [];

                      // Extract actual primary reference number from booking object
                      const primaryRef = rawData.referenceId || 
                                         rawData.paymentReference || 
                                         rawData.paymentId || 
                                         rawData.payment_id || 
                                         rawData.metadata?.referenceId || 
                                         rawData.metadata?.paymentReference || 
                                         rawData.metadata?.razorpay_payment_id || 
                                         rawData.metadata?.payment_id || 
                                         booking.bookingCode || 
                                         booking.id;

                      // Process EVERY API payment entry from metadata.paymentHistory without dropping duplicate IDs
                      rawPayments.forEach((p: any, idx: number) => {
                        const refId = p.referenceId || p.reference_id || p.paymentId || p.payment_id || p.razorpay_payment_id || p.transactionRef || p.id || primaryRef;
                        
                        let valCents = 0;
                        if (typeof p.amountCents === 'number') {
                          valCents = p.amountCents;
                        } else if (typeof p.amount === 'number') {
                          valCents = p.amount > 100000 ? p.amount : Math.round(p.amount * 100);
                        } else if (typeof p.totalCents === 'number') {
                          valCents = p.totalCents;
                        } else if (typeof p.price === 'number') {
                          valCents = Math.round(p.price * 100);
                        }

                        const pDate = p.createdAt || p.created_at || p.timestamp || p.date || p.time || rawData.createdAt || rawData.created_at;

                        paymentList.push({
                          referenceId: refId,
                          createdAt: pDate,
                          paymentMethod: p.paymentMethod || p.method || p.gateway || rawData.paymentMethod || 'Razorpay / Online',
                          type: p.type || p.paymentType || p.note || (idx === 0 ? 'Advance Payment' : 'Balance Settlement'),
                          amountCents: valCents,
                          status: (p.status || 'SUCCESS').toString().toUpperCase(),
                        });
                      });

                      // Process local session payment entries
                      localPayments.forEach((lp: any) => {
                        const exists = paymentList.some(item => item.referenceId === lp.referenceId && item.amountCents === lp.amountCents);
                        if (!exists) {
                          paymentList.push(lp);
                        }
                      });

                      // Fallback: If no explicit array items, but paymentCents > 0
                      if (paymentList.length === 0 && paymentCents > 0) {
                        paymentList.push({
                          referenceId: primaryRef,
                          createdAt: rawData.createdAt || rawData.created_at,
                          paymentMethod: rawData.paymentMethod || 'Razorpay / Online',
                          type: 'Advance Payment',
                          amountCents: paymentCents,
                          status: 'SUCCESS',
                        });
                      }

                      // If multiple payments took place and paymentList has only 1 item while paymentCents > paymentList[0].amountCents
                      if (paymentList.length === 1 && paymentCents > paymentList[0].amountCents) {
                        const secondVal = paymentCents - paymentList[0].amountCents;
                        const secondRef = localPayments[0]?.referenceId || rawData.metadata?.balancePaymentRef || `${primaryRef}_BAL`;
                        paymentList.push({
                          referenceId: secondRef,
                          createdAt: localPayments[0]?.createdAt || new Date().toISOString(),
                          paymentMethod: 'Razorpay / Online',
                          type: 'Balance Settlement',
                          amountCents: secondVal,
                          status: 'SUCCESS',
                        });
                      }

                      if (paymentList.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: 20 }}>
                              No payment transactions recorded yet.
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <>
                          {paymentList.map((tx: any, idx: number) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 700, color: '#122223' }}>{tx.referenceId}</td>
                              <td style={{ color: '#64748b', fontSize: 13, whiteSpace: 'nowrap' }}>{formatPaymentDateTime(tx.createdAt)}</td>
                              <td style={{ color: '#64748b' }}>{tx.paymentMethod}</td>
                              <td style={{ color: '#64748b' }}>{tx.type}</td>
                              <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                                ₹{(tx.amountCents / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <span style={{ 
                                  background: tx.status === 'SUCCESS' || tx.status === 'CONFIRMED' ? '#dcfce7' : '#fef3c7', 
                                  color: tx.status === 'SUCCESS' || tx.status === 'CONFIRMED' ? '#15803d' : '#b45309', 
                                  fontSize: 11, 
                                  fontWeight: 700, 
                                  padding: '3px 10px', 
                                  borderRadius: 100, 
                                  textTransform: 'uppercase' 
                                }}>
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          ))}

                          {remainingBalance > 0 && (
                            <tr>
                              <td style={{ color: '#64748b' }}>Pending Settlement</td>
                              <td style={{ color: '#94a3b8' }}>—</td>
                              <td style={{ color: '#64748b' }}>—</td>
                              <td style={{ color: '#64748b' }}>Balance Due</td>
                              <td style={{ textAlign: 'right', fontWeight: 700, color: '#d97706' }}>
                                ₹{(remainingBalance / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <span style={{ background: '#fef3c7', color: '#b45309', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase' }}>
                                  PENDING
                                </span>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* In-Page Payment Success Notification */}
            {paymentSuccessMessage && (
              <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 16, padding: '16px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#047857' }}>
                  {paymentSuccessMessage}
                </div>
              </div>
            )}

            {/* Outstanding Balance Box & Single CTA Button */}
            <div className="bd-balance-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>
                    NET OUTSTANDING BALANCE
                  </div>
                  <div style={{ fontSize: 32, fontFamily: 'Cinzel, serif', fontWeight: 700, color: remainingBalance > 0 ? '#b89243' : '#059669', lineHeight: 1 }}>
                    ₹{(remainingBalance / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {remainingBalance > 0 ? (
                  <button
                    onClick={handlePayBalance}
                    disabled={!!processing}
                    className="btn-card-invoice"
                    style={{ 
                      height: 50, 
                      padding: '0 32px', 
                      borderRadius: 100, 
                      fontWeight: 700, 
                      fontSize: 13, 
                      letterSpacing: '0.06em',
                      width: 'auto',
                      minWidth: 260
                    }}
                  >
                    {processing ? (
                      <>
                        <span className="size-18 rounded-full border-2 border-white border-t-transparent animate-spin mr-8"></span>
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        PAY PENDING AMOUNT (₹{(remainingBalance / 100).toLocaleString('en-IN')})
                      </>
                    )}
                  </button>
                ) : (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8, color: '#15803d' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      RESERVATION FULLY PAID
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default BookingDetailsPage;


