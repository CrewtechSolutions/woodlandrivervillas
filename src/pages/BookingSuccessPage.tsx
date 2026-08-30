import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { PageHero } from '../components/common/PageHero';

export const BookingSuccessPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { bookingId: string } | null;

  return (
    <>
      <SEO title="Booking Successful | Woodland River Villa" description="Your booking has been confirmed." />
      <PageHero title="Booking Confirmed!" subtitle="Thank you for choosing Woodland River Villas." bgImage="/assets/img/pageHero/4.png" />
      
      <section className="layout-pt-md layout-pb-md">
        <div className="container">
          <div className="row justify-center text-center">
            <div className="col-xl-6 col-lg-8">
              
              <div className="bg-light-1 p-40 rounded-24 border-1 border-light-1">
                <div className="size-80 rounded-full bg-white flex-center mx-auto mb-20 shadow-md">
                  <i className="icon-check text-40 text-accent-1"></i>
                </div>
                
                <h2 className="text-30 fw-600 mb-10">Payment Successful</h2>
                <p className="text-16 text-sec mb-30">
                  Your reservation has been successfully placed. We've sent the details to your email.
                </p>

                {state?.bookingId && (
                  <div className="text-14 text-sec mb-30 p-15 bg-white rounded-12 inline-block">
                    Booking Reference: <span className="fw-700 text-dark-1">{state.bookingId}</span>
                  </div>
                )}

                <div className="mt-40 space-y-16">
                  <Link to={state?.bookingId ? `/account/bookings/${state.bookingId}` : "/account"} className="button bg-accent-1 text-white rounded-200 w-1/1 py-16 text-15 fw-700 shadow-sm hover-accent-dark transition-all d-flex justify-center items-center">
                    {state?.bookingId ? "VIEW BOOKING DETAILS" : "VIEW MY BOOKINGS"}
                  </Link>
                  <Link to="/" className="button bg-white text-dark-1 rounded-200 border-1 border-light-1 w-1/1 py-16 text-15 fw-700 shadow-sm hover:bg-light-1 transition-all d-flex justify-center items-center">
                    RETURN TO HOME
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
