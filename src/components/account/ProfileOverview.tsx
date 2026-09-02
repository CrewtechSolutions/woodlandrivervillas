import React from 'react';
import { AuthUser } from '../../types';
import { siteConfig } from '../../data/siteConfig';
import { User, Mail, Phone, MapPin, ShieldCheck, Clock, Gift, MessageSquare } from 'lucide-react';

interface ProfileOverviewProps {
  user: AuthUser;
  totalBookings: number;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({ user, totalBookings }) => {
  return (
    <div className="row y-gap-40">
      {/* LEFT COLUMN: GUEST PROFILE & DETAILS GRID */}
      <div className="col-lg-7">
        <div className="profile-card">
          {/* HEADER ROW */}
          <div className="d-flex justify-between items-center mb-28 pb-18 border-bottom-light flex-wrap y-gap-10">
            <div>
              <div className="text-11 uppercase text-accent-1 font-bold tracking-wider mb-2">MEMBER PROFILE</div>
              <h3 className="text-28 font-serif fw-700 text-dark-1">Personal Details</h3>
            </div>
            <span className="profile-badge-verified">
              <span className="profile-badge-dot"></span>
              Verified Guest
            </span>
          </div>

          {/* INFORMATION TILES GRID */}
          <div className="row x-gap-16 y-gap-16 mb-28">
            <div className="col-sm-6">
              <div className="profile-info-tile">
                <div className="profile-tile-label">
                  <User size={14} className="text-accent-gold" />
                  <span>FULL NAME</span>
                </div>
                <div className="profile-tile-value">{user.name}</div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="profile-info-tile">
                <div className="profile-tile-label">
                  <Mail size={14} className="text-accent-gold" />
                  <span>EMAIL ADDRESS</span>
                </div>
                <div className="profile-tile-value word-break-all">{user.email}</div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="profile-info-tile">
                <div className="profile-tile-label">
                  <Phone size={14} className="text-accent-gold" />
                  <span>PHONE NUMBER</span>
                </div>
                <div className="profile-tile-value">{user.phone || '+91 Not Provided'}</div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="profile-info-tile">
                <div className="profile-tile-label">
                  <MapPin size={14} className="text-accent-gold" />
                  <span>PRIMARY RESORT</span>
                </div>
                <div className="profile-tile-value">Woodland Villa Alibaug</div>
              </div>
            </div>
          </div>

          {/* QUICK RESORT STATS STRIP */}
          <div className="profile-stats-strip">
            <div className="row y-gap-15 text-center">
              <div className="col-4 border-right-light">
                <div className="profile-stat-number">{totalBookings}</div>
                <div className="profile-stat-label">TOTAL STAYS</div>
              </div>
              <div className="col-4 border-right-light">
                <div className="profile-stat-text">VIP</div>
                <div className="profile-stat-label">MEMBER TIER</div>
              </div>
              <div className="col-4">
                <div className="profile-stat-text">ALIBAUG</div>
                <div className="profile-stat-label">LOCATION</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: WOODLAND VIP CLUB PRIVILEGES & DIRECT CONCIERGE */}
      <div className="col-lg-5">
        <div className="profile-card bg-light-1">
          <div className="text-11 uppercase text-accent-1 font-bold tracking-wider mb-2">EXCLUSIVE PRIVILEGES</div>
          <h3 className="text-28 font-serif fw-700 text-dark-1 mb-24">Woodland VIP Club</h3>

          {/* BENEFIT ITEMS */}
          <div className="vip-benefits-group">
            <div className="benefit-card-item">
              <div className="benefit-icon-box">
                <ShieldCheck size={22} className="text-accent-gold" />
              </div>
              <div>
                <div className="text-16 font-bold text-dark-1 mb-2">Direct Best Rate Guarantee</div>
                <div className="text-13 text-sec lh-15">Guaranteed lowest pricing when booking directly through your member portal.</div>
              </div>
            </div>

            <div className="benefit-card-item">
              <div className="benefit-icon-box">
                <Clock size={22} className="text-accent-gold" />
              </div>
              <div>
                <div className="text-16 font-bold text-dark-1 mb-2">Priority Early Check-In</div>
                <div className="text-13 text-sec lh-15">Enjoy priority room readiness and flexible check-in upon request.</div>
              </div>
            </div>

            <div className="benefit-card-item">
              <div className="benefit-icon-box">
                <Gift size={22} className="text-accent-gold" />
              </div>
              <div>
                <div className="text-16 font-bold text-dark-1 mb-2">Complimentary Welcome Amenity</div>
                <div className="text-13 text-sec lh-15">Curated welcome hamper and refreshment setup prepared for every stay.</div>
              </div>
            </div>
          </div>

          {/* DIRECT CONCIERGE BUTTON */}
          <a
            href={`https://wa.me/${siteConfig.phoneNumbers[0].replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20am%20a%20Woodland%20VIP%20Member%20inquiring%20about%20villa%20availability`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-concierge-whatsapp"
          >
            <MessageSquare size={18} />
            <span>Direct Member Concierge</span>
          </a>
        </div>
      </div>
    </div>
  );
};
