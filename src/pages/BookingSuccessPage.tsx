import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { Villa } from '../types';

export const BookingSuccessPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as {
    bookingId: string;
    villa?: Villa;
    startDate?: string;
    endDate?: string;
    guests?: number;
  } | null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <SEO title="Booking Confirmed | Woodland River Villas Alibaug" description="Your luxury villa reservation is confirmed." />
      
      {/* HERO BANNER WITH HEADER CLEARANCE */}
      <section className="relative pt-220 pb-90 md:pt-180 md:pb-60 bg-dark-1 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/assets/img/pageHero/4.png" alt="Success Background" className="w-1/1 h-1/1 object-cover opacity-35" />
          <div className="absolute inset-0 bg-dark-1/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-dark-1/80 via-transparent to-dark-1/95"></div>
        </div>

        <div className="container relative z-2 text-center text-white">
          <div className="size-80 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex-center mx-auto mb-20 shadow-xl backdrop-blur-md">
            <i className="icon-check text-36 text-emerald-400"></i>
          </div>
          <div className="d-inline-flex items-center x-gap-8 bg-amber-500/10 border-1 border-amber-500/30 px-16 py-6 rounded-200 mb-15 backdrop-blur-md">
            <span className="text-11 uppercase fw-700 tracking-widest text-amber-300">RESERVATION GUARANTEED</span>
          </div>
          <h1 className="text-42 md:text-32 font-serif fw-700 mb-12 text-white">Your Stay is Confirmed!</h1>
          <p className="text-16 fw-400 text-white/80 max-w-600 mx-auto leading-relaxed">
            Thank you for choosing Woodland River Villas. A formal booking confirmation and property access pass have been dispatched to your registered email.
          </p>
        </div>
      </section>

      {/* RESERVATION VOUCHER CARD */}
      <section className="layout-pt-md layout-pb-lg bg-light-1">
        <div className="container">
          <div className="row justify-center">
            <div className="col-xl-8 col-lg-10">
              
              <div className="bg-white p-40 md:p-24 rounded-24 border-1 border-light-2 shadow-2xl printable-voucher">
                
                {/* VOUCHER HEADER */}
                <div className="d-flex justify-between items-center pb-25 border-bottom-light flex-wrap y-gap-15">
                  <div>
                    <div className="text-11 uppercase tracking-widest text-accent-1 fw-700 mb-4">CONFIRMATION CODE</div>
                    <div className="text-24 font-mono fw-700 text-dark-1">
                      {state?.bookingId || `WVR-${Date.now().toString().slice(-6)}`}
                    </div>
                  </div>

                  <div className="d-flex x-gap-10">
                    <span className="px-16 py-6 rounded-200 bg-emerald-100 text-emerald-800 text-12 fw-700 uppercase tracking-wider d-flex items-center">
                      <span className="size-8 rounded-full bg-emerald-500 mr-6 animate-pulse"></span> CONFIRMED
                    </span>
                    <span className="px-16 py-6 rounded-200 bg-dark-1 text-white text-12 fw-700 uppercase tracking-wider">
                      PAID IN FULL
                    </span>
                  </div>
                </div>

                {/* VILLA DETAILS */}
                {state?.villa && (
                  <div className="py-25 border-bottom-light d-flex items-center flex-wrap y-gap-15">
                    <img src={state.villa.heroImage} alt={state.villa.name} className="size-110 rounded-16 object-cover shadow-md mr-24" />
                    <div>
                      <span className="text-11 uppercase tracking-widest text-accent-1 fw-700 mb-4 d-block">
                        RESERVED VILLA
                      </span>
                      <h3 className="text-26 font-serif fw-700 text-dark-1 mb-6">{state.villa.name}</h3>
                      <p className="text-14 text-sec mb-10">{state.villa.subtitle || 'Zirad, Alibaug • Private Estate'}</p>
                      <div className="text-13 fw-600 text-dark-1">
                        {state.villa.bedrooms} • {state.villa.bathrooms} • Up to {state.villa.maxGuests || 12} Guests
                      </div>
                    </div>
                  </div>
                )}

                {/* DATES GRID */}
                <div className="py-25 border-bottom-light">
                  <div className="row y-gap-16">
                    <div className="col-sm-6">
                      <div className="p-20 bg-light-1 rounded-16 border-1 border-light-2">
                        <div className="text-11 uppercase tracking-widest text-sec fw-700 mb-6 d-flex items-center">
                          <i className="icon-calendar-2 text-accent-1 mr-6 text-14"></i> Check-In Date
                        </div>
                        <div className="text-16 fw-700 text-dark-1">
                          {state?.startDate ? new Date(state.startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'As Reserved'}
                        </div>
                        <div className="text-12 text-sec mt-4 fw-500">From 2:00 PM onwards</div>
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <div className="p-20 bg-light-1 rounded-16 border-1 border-light-2">
                        <div className="text-11 uppercase tracking-widest text-sec fw-700 mb-6 d-flex items-center">
                          <i className="icon-calendar-2 text-accent-1 mr-6 text-14"></i> Check-Out Date
                        </div>
                        <div className="text-16 fw-700 text-dark-1">
                          {state?.endDate ? new Date(state.endDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'As Reserved'}
                        </div>
                        <div className="text-12 text-sec mt-4 fw-500">By 11:00 AM sharp</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PROPERTY DIRECTIONS & CONCIERGE ACCESS */}
                <div className="py-25 border-bottom-light">
                  <h4 className="text-16 font-serif fw-700 text-dark-1 mb-12">Property Location & Concierge</h4>
                  <div className="row y-gap-15">
                    <div className="col-sm-6">
                      <div className="text-13 text-sec mb-4 fw-500"><i className="icon-location mr-6 text-accent-1"></i> Address</div>
                      <div className="text-14 fw-600 text-dark-1">Woodland River Estate, Zirad Riverbed, Alibaug, MH 402201</div>
                    </div>
                    <div className="col-sm-6">
                      <div className="text-13 text-sec mb-4 fw-500"><i className="icon-phone mr-6 text-accent-1"></i> Dedicated Villa Butler</div>
                      <div className="text-14 fw-600 text-dark-1">+91 90040 29157 (Available 24/7)</div>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="pt-30 d-flex x-gap-15 y-gap-15 flex-wrap">
                  {state?.bookingId && (
                    <Link
                      to={`/account/bookings/${state.bookingId}`}
                      className="button flex-grow-1 -md bg-accent-1 text-white rounded-200 py-16 text-13 uppercase tracking-widest fw-700 shadow-md hover:bg-dark-1 transition-all text-center"
                    >
                      MANAGE RESERVATION
                    </Link>
                  )}

                  <button
                    onClick={handlePrint}
                    className="button d-inline-flex items-center justify-center -md bg-dark-1 text-white rounded-200 px-30 py-16 text-13 uppercase tracking-widest fw-700 shadow-md hover:bg-accent-1 transition-all"
                  >
                    <i className="icon-share mr-8 text-14"></i> PRINT VOUCHER
                  </button>

                  <Link
                    to="/catalogue"
                    className="button d-inline-flex items-center justify-center -md bg-light-2 text-dark-1 rounded-200 px-30 py-16 text-13 uppercase tracking-widest fw-700 hover:bg-light-3 transition-all"
                  >
                    EXPLORE COLLECTION
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};
