import React from 'react';
import { Link } from 'react-router-dom';
import { Booking, AuthUser } from '../../types';
import { generateInvoicePdf } from '../../utils/generateInvoice';

interface ReservationCardProps {
  booking: Booking;
  user: AuthUser;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({ booking, user }) => {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'booking-status-confirmed';
      case 'completed':
        return 'booking-status-completed';
      case 'cancelled':
        return 'booking-status-cancelled';
      default:
        return 'booking-status-pending';
    }
  };

  const statusClass = getStatusClass(booking.status);
  const locationName = booking.raw?.pickupLocation?.name || 'Zirad, Alibaug';

  return (
    <div className="reservation-card">
      <div className="row y-gap-24 items-center">
        {/* LEFT COLUMN: STATUS BADGE & MONOSPACE BOOKING ID */}
        <div className="col-lg-3 col-md-4">
          <div className="d-flex flex-column items-start">
            <div className={`booking-status-tag ${statusClass}`}>
              <span className="status-dot"></span>
              {booking.status.toUpperCase()}
            </div>

            <div className="booking-id-box">
              <div className="text-11 uppercase text-sec font-sans tracking-wider mb-2">BOOKING REFERENCE</div>
              <div className="booking-id-text">
                {booking.bookingCode || booking.id}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: VILLA TITLE, STAY TIMINGS & GUESTS */}
        <div className="col-lg-6 col-md-5">
          {/* VILLA TITLE */}
          <h4 className="text-24 sm:text-20 font-serif fw-700 text-dark-1 mb-12">
            {booking.villaName}
          </h4>

          {/* CHECK-IN & CHECK-OUT DATES / TIMES */}
          <div className="stay-timing-box">
            <div className="row y-gap-10 items-center">
              <div className="col-sm-6">
                <div className="d-flex items-center text-12 text-sec mb-2 uppercase tracking-wider fw-600">
                  <i className="icon-calendar text-accent-1 mr-6 text-14"></i>
                  CHECK-IN
                </div>
                <div className="text-15 fw-700 text-dark-1">
                  {booking.checkIn}{' '}
                  <span className="text-12 text-accent-1 font-mono fw-600">({booking.checkInTime || '14:00 hrs'})</span>
                </div>
              </div>

              <div className="col-sm-6 border-left-light sm:border-left-0 sm:pt-8">
                <div className="d-flex items-center text-12 text-sec mb-2 uppercase tracking-wider fw-600">
                  <i className="icon-calendar text-accent-1 mr-6 text-14"></i>
                  CHECK-OUT
                </div>
                <div className="text-15 fw-700 text-dark-1">
                  {booking.checkOut}{' '}
                  <span className="text-12 text-accent-1 font-mono fw-600">({booking.checkOutTime || '11:00 hrs'})</span>
                </div>
              </div>
            </div>
          </div>

          {/* LOCATION & GUESTS DISPLAY */}
          <div className="d-flex items-center flex-wrap x-gap-20 y-gap-8 text-14 text-sec">
            <span className="d-flex items-center">
              <i className="icon-map text-accent-1 mr-6 text-15"></i>
              <span>Location: <strong className="text-dark-1">{locationName}</strong></span>
            </span>
            <span className="text-light-2 sm:d-none">•</span>
            <span className="d-flex items-center">
              <i className="icon-guest text-accent-1 mr-6 text-15"></i>
              <span>Guests: <strong className="text-dark-1">{booking.guestsDisplay || `${booking.guests} Guests`}</strong></span>
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: PRICE & EQUAL SIZED ACTION BUTTONS */}
        <div className="col-lg-3 col-md-3 text-right md:text-left border-left-light md:border-left-0 pt-10">
          
          {booking.paymentHistory && booking.paymentHistory.length > 0 ? (
            <div className="mb-16">
              <div className="text-11 uppercase text-sec mb-4 tracking-wider fw-700">PAYMENT BREAKDOWN</div>
              {booking.paymentHistory.map((p, idx) => (
                <div key={idx} className="d-flex justify-between md:justify-start md:x-gap-10 items-center text-13">
                  <span className="text-sec">
                    {p.notes?.includes('Deposit') ? 'Security Deposit' : 'Rent Paid'}:
                  </span>
                  <span className="fw-700 text-dark-1">
                    ₹{(p.amountCents / 100).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
              <div className="border-top-light mt-6 pt-6 d-flex justify-between md:justify-start md:x-gap-10 items-center text-14 fw-700 text-accent-1">
                <span>TOTAL:</span>
                <span>₹{booking.totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="text-11 uppercase text-sec mb-4 tracking-wider fw-700">TOTAL AMOUNT PAID</div>
              <div className="text-32 font-serif fw-700 text-accent-1 mb-16">
                ₹{booking.totalPrice.toLocaleString('en-IN')}
              </div>
            </>
          )}

          <div className="d-flex flex-column y-gap-10">
            <Link
              to={`/account/bookings/${booking.id}`}
              className="button bg-dark-1 text-white rounded-200 py-15 text-13 fw-600 tracking-wider mb-10 w-1/1 d-flex justify-center items-center"
            >
              <i className="icon-setting text-15 mr-10"></i> MANAGE BOOKING
            </Link>

            <button
              onClick={() => generateInvoicePdf(booking, user)}
              className="btn-card-invoice"
            >
              <i className="icon-download text-15"></i> VIEW INVOICE (PDF)
            </button>

            <Link
              to={`/our-villas/${booking.villaSlug}`}
              className="btn-card-villa"
            >
              <i className="icon-bed text-15"></i> VIEW VILLA DETAILS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
