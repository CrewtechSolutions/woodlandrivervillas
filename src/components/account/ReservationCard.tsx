import React from 'react';
import { Link } from 'react-router-dom';
import { Booking, AuthUser } from '../../types';
import { generateInvoicePdf } from '../../utils/generateInvoice';
import { Calendar, MapPin, Users, ArrowRight, Sliders, FileDown, Eye, ShieldCheck } from 'lucide-react';

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
    <div className="reservation-card-luxury">
      {/* CARD TOP HEADER BAR: STATUS, REF & TOTAL PRICE */}
      <div className="res-card-header">
        <div className="d-flex items-center gap-12 flex-wrap">
          {/* STATUS TAG */}
          <div className={`booking-status-tag ${statusClass}`}>
            <span className="status-dot"></span>
            {booking.status.toUpperCase()}
          </div>

          {/* REFERENCE ID PILL */}
          <div className="res-reference-pill">
            <span className="label">REF:</span>
            <span className="code">{booking.bookingCode || booking.id}</span>
          </div>
        </div>

        {/* PRICE DISPLAY */}
        <div className="res-price-block">
          <span className="res-price-label">TOTAL AMOUNT PAID</span>
          <span className="res-price-amount">₹{booking.totalPrice.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* CARD BODY: VILLA TITLE, DATES & METADATA */}
      <div className="res-card-body">
        <h3 className="res-villa-title">{booking.villaName}</h3>

        {/* CHECK-IN & CHECK-OUT DATES CONTAINER */}
        <div className="res-dates-container">
          <div className="res-date-item">
            <div className="res-date-label">
              <Calendar size={14} className="text-accent-gold" />
              <span>CHECK-IN</span>
            </div>
            <div className="res-date-value">
              {booking.checkIn}{' '}
              <span className="res-time">({booking.checkInTime || '14:00 hrs'})</span>
            </div>
          </div>

          <div className="res-date-arrow">
            <ArrowRight size={18} />
          </div>

          <div className="res-date-item">
            <div className="res-date-label">
              <Calendar size={14} className="text-accent-gold" />
              <span>CHECK-OUT</span>
            </div>
            <div className="res-date-value">
              {booking.checkOut}{' '}
              <span className="res-time">({booking.checkOutTime || '11:00 hrs'})</span>
            </div>
          </div>
        </div>

        {/* METADATA PILLS */}
        <div className="res-meta-group">
          <span className="res-meta-item">
            <MapPin size={15} className="text-accent-gold" />
            <span>Location: <strong>{locationName}</strong></span>
          </span>
          <span className="res-meta-item">
            <Users size={15} className="text-accent-gold" />
            <span>Guests: <strong>{booking.guestsDisplay || `${booking.guests} Guests`}</strong></span>
          </span>
          <span className="res-meta-item">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>Confirmed Booking</span>
          </span>
        </div>
      </div>

      {/* CARD ACTION BUTTONS FOOTER */}
      <div className="res-card-actions">
        <Link
          to={`/account/bookings/${booking.id}`}
          className="btn-res-action primary"
        >
          <Sliders size={16} />
          <span>MANAGE BOOKING</span>
        </Link>

        <button
          onClick={() => generateInvoicePdf(booking, user)}
          className="btn-res-action gold"
        >
          <FileDown size={16} />
          <span>VIEW INVOICE (PDF)</span>
        </button>

        <Link
          to={`/our-villas/${booking.villaSlug}`}
          className="btn-res-action outline"
        >
          <Eye size={16} />
          <span>VIEW VILLA DETAILS</span>
        </Link>
      </div>
    </div>
  );
};
