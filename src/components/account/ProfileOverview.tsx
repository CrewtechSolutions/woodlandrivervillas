import React from 'react';
import { AuthUser } from '../../types';
import { siteConfig } from '../../data/siteConfig';

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
          <div className="d-flex justify-between items-center mb-32 pb-20 border-bottom-light flex-wrap y-gap-10">
            <div>
              <div className="text-12 uppercase text-accent-1 font-semibold tracking-wider mb-2">MEMBER PROFILE</div>
              <h3 className="text-28 font-serif fw-700 text-dark-1">Personal Details</h3>
            </div>
            <span className="text-12 font-bold uppercase text-emerald-800 bg-emerald-50 px-14 py-6 rounded-200 border-1 border-emerald-200 d-inline-flex items-center">
              <span className="size-6 rounded-full bg-emerald-600 mr-8"></span>
              Verified Guest
            </span>
          </div>

          {/* INFORMATION TILES GRID */}
          <div className="row x-gap-16 y-gap-16 mb-32">
            <div className="col-sm-6">
              <div className="profile-info-tile">
                <div className="d-flex items-center text-sec text-12 uppercase tracking-wider mb-6 fw-600">
                  <i className="icon-guest text-accent-1 mr-6 text-14"></i>
                  FULL NAME
                </div>
                <div className="text-17 font-semibold text-dark-1">{user.name}</div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="profile-info-tile">
                <div className="d-flex items-center text-sec text-12 uppercase tracking-wider mb-6 fw-600">
                  <i className="icon-mail text-accent-1 mr-6 text-14"></i>
                  EMAIL ADDRESS
                </div>
                <div className="text-17 font-semibold text-dark-1 word-break-all">{user.email}</div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="profile-info-tile">
                <div className="d-flex items-center text-sec text-12 uppercase tracking-wider mb-6 fw-600">
                  <i className="icon-phone text-accent-1 mr-6 text-14"></i>
                  PHONE NUMBER
                </div>
                <div className="text-17 font-semibold text-dark-1">{user.phone || '+91 Not Provided'}</div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="profile-info-tile">
                <div className="d-flex items-center text-sec text-12 uppercase tracking-wider mb-6 fw-600">
                  <i className="icon-map text-accent-1 mr-6 text-14"></i>
                  PRIMARY RESORT
                </div>
                <div className="text-17 font-semibold text-dark-1">Woodland Villa Alibaug</div>
              </div>
            </div>
          </div>

          {/* QUICK RESORT STATS STRIP */}
          <div className="p-20 rounded-16 bg-light-1 border-1 border-light-1">
            <div className="row y-gap-15 text-center">
              <div className="col-4 border-right-light">
                <div className="text-24 font-serif fw-700 text-accent-1">{totalBookings}</div>
                <div className="text-11 uppercase text-sec fw-600 tracking-wider">TOTAL STAYS</div>
              </div>
              <div className="col-4 border-right-light">
                <div className="text-24 font-serif fw-700 text-dark-1">VIP</div>
                <div className="text-11 uppercase text-sec fw-600 tracking-wider">MEMBER TIER</div>
              </div>
              <div className="col-4">
                <div className="text-24 font-serif fw-700 text-dark-1">ALIBAUG</div>
                <div className="text-11 uppercase text-sec fw-600 tracking-wider">LOCATION</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: WOODLAND VIP CLUB PRIVILEGES & DIRECT CONCIERGE */}
      <div className="col-lg-5">
        <div className="profile-card bg-light-1">
          <div className="text-12 uppercase text-accent-1 font-semibold tracking-wider mb-4">EXCLUSIVE PRIVILEGES</div>
          <h3 className="text-28 font-serif fw-700 text-dark-1 mb-24">Woodland VIP Club</h3>

          {/* BENEFIT ITEMS */}
          <div className="space-y-14 mb-32">
            <div className="benefit-card-item">
              <div className="benefit-icon-box">
                <i className="icon-check text-18"></i>
              </div>
              <div>
                <div className="text-16 font-bold text-dark-1 mb-2">Direct Best Rate Guarantee</div>
                <div className="text-13 text-sec lh-15">Guaranteed lowest pricing when booking directly through your member portal.</div>
              </div>
            </div>

            <div className="benefit-card-item">
              <div className="benefit-icon-box">
                <i className="icon-calendar text-18"></i>
              </div>
              <div>
                <div className="text-16 font-bold text-dark-1 mb-2">Priority Early Check-In</div>
                <div className="text-13 text-sec lh-15">Enjoy priority room readiness and flexible check-in upon request.</div>
              </div>
            </div>

            <div className="benefit-card-item">
              <div className="benefit-icon-box">
                <i className="icon-bed text-18"></i>
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
            <i className="icon-chat text-18"></i> Direct Member Concierge
          </a>
        </div>
      </div>
    </div>
  );
};
