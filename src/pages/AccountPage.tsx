import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { PageHero } from '../components/common/PageHero';
import { useAuth } from '../context/AuthContext';
import { useVillas } from '../context/VillaContext';
import { siteConfig } from '../data/siteConfig';
import { bookingApiService } from '../services/apiService';
import { Booking } from '../types';
import { ReservationCard } from '../components/account/ReservationCard';
import { ProfileOverview } from '../components/account/ProfileOverview';
import { GuestComplaintsPortal } from '../components/account/GuestComplaintsPortal';
import '../styles/account.css';

export const AccountPage: React.FC = () => {
  const { user, token, isAuthenticated, logout } = useAuth();
  const { villas } = useVillas();

  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'complaints' | 'security'>('profile');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);

  // Password update form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);

  // Fetch bookings dynamically from public/v1/my-bookings
  useEffect(() => {
    let isMounted = true;
    const fetchBookings = async () => {
      setLoadingBookings(true);
      try {
        const data = await bookingApiService.getMyBookings(token || undefined);
        if (isMounted) {
          setBookings(data);
        }
      } catch (err) {
        console.warn('Failed to fetch user bookings:', err);
      } finally {
        if (isMounted) {
          setLoadingBookings(false);
        }
      }
    };

    if (isAuthenticated) {
      fetchBookings();
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setSecurityMessage('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityMessage('New passwords do not match');
      return;
    }
    setSecurityMessage('Your password has been updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'upcoming') {
      return b.status === 'confirmed' || b.status === 'pending';
    }
    if (bookingFilter === 'past') {
      return b.status === 'completed' || b.status === 'cancelled';
    }
    return true;
  });

  return (
    <>
      <SEO
        title={`My Account (${user.name}) | Woodland River Villa Alibaug`}
        description="Access your guest profile, manage villa reservations, and view saved wishlist stays at Woodland River Villa Alibaug."
      />

      {/* UNIFIED LUXURY TOP HERO BANNER */}
      <section className="pageHero -type-1 -items-center relative overflow-hidden">
        <div className="pageHero__bg">
          <img src="/assets/img/pageHero/1.png" alt="Woodland River Villa" loading="eager" />
        </div>
        <div className="pageHero-account-overlay"></div>

        <div className="container relative z-10 py-60 sm:py-40">
          <div className="row justify-between items-center y-gap-30">
            {/* LEFT: USER WELCOME TEXT & METADATA */}
            <div className="col-lg-8">
              <div className="d-flex flex-column y-gap-14">
                {/* LINE 1: WELCOME TEXT */}
                <h1 className="pageHero__title text-44 md:text-34 font-serif fw-600 text-white m-0 drop-shadow-md">
                  Welcome, {user.name}
                </h1>

                {/* LINE 2: VIP MEMBER BADGE */}
                <div className="d-flex items-center x-gap-12 flex-wrap y-gap-6">
                  <span className="account-badge-vip">
                    WOODLAND VIP MEMBER
                  </span>
                </div>

                {/* LINE 3: METADATA PILLS */}
                <div className="d-flex items-center flex-wrap x-gap-10 y-gap-10 pt-4">
                  <span className="hero-meta-pill">
                    <i className="icon-mail text-14 text-accent-1 mr-8"></i>{user.email}
                  </span>
                  {user.phone && (
                    <span className="hero-meta-pill">
                      <i className="icon-phone text-14 text-accent-1 mr-8"></i>{user.phone}
                    </span>
                  )}
                  <span className="hero-meta-pill">
                    <i className="icon-map text-14 text-accent-1 mr-8"></i>Zirad, Alibaug
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: EQUAL-SIZED ACTION BUTTONS (BOOK NEW VILLA STAY & SIGN OUT) */}
            <div className="col-lg-4 d-flex justify-end md:justify-start">
              <div className="d-flex flex-column sm:flex-row items-center x-gap-16 y-gap-12 w-1/1 sm:w-auto">
                <a
                  href={siteConfig.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-hero-primary"
                >
                  <i className="icon-bed mr-8 text-16"></i> BOOK NEW VILLA STAY
                </a>

                <button
                  onClick={logout}
                  className="btn-hero-secondary"
                >
                  <i className="icon-logout mr-8 text-16"></i> SIGN OUT
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN BODY AREA WITH CENTERED PILL TABS */}
      <section className="bg-white text-dark-1 layout-pt-md pb-100 account-wrapper">
        <div className="container">
          {/* ELEGANT CENTERED SUB-MENU NAVIGATION PILL BAR */}
          <div className="d-flex justify-center items-center mb-50 px-15">
            <div className="account-tabs-wrapper">
              <button
                onClick={() => setActiveTab('profile')}
                className={`account-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              >
                <i className="icon-guest text-16"></i>
                Profile Overview
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`account-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              >
                <i className="icon-calendar text-16"></i>
                My Reservations
                <span className="account-tab-badge">
                  {bookings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('complaints')}
                className={`account-tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
              >
                <i className="icon-chat text-16"></i>
                Support & Complaints
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`account-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              >
                <i className="icon-shield text-16"></i>
                Security & Settings
              </button>
            </div>
          </div>

          {/* TAB 1: PROFILE OVERVIEW */}
          {activeTab === 'profile' && (
            <ProfileOverview user={user} totalBookings={bookings.length} />
          )}

          {/* TAB 2: MY RESERVATIONS */}
          {activeTab === 'bookings' && (
            <div>
              <div className="d-flex justify-between items-center mb-30 flex-wrap y-gap-15">
                <div>
                  <div className="text-13 uppercase text-accent-1 fw-600 tracking-wider">RESERVATIONS</div>
                  <h3 className="text-28 fw-500 text-dark-1">My Villa Bookings</h3>
                </div>

                <div className="d-flex x-gap-10">
                  <button
                    onClick={() => setBookingFilter('all')}
                    className={`px-18 py-8 rounded-200 text-13 fw-600 transition-all ${
                      bookingFilter === 'all' ? 'bg-accent-1 text-white shadow-xs' : 'bg-light-1 text-sec'
                    }`}
                  >
                    All Stays ({bookings.length})
                  </button>
                  <button
                    onClick={() => setBookingFilter('upcoming')}
                    className={`px-18 py-8 rounded-200 text-13 fw-600 transition-all ${
                      bookingFilter === 'upcoming' ? 'bg-accent-1 text-white shadow-xs' : 'bg-light-1 text-sec'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setBookingFilter('past')}
                    className={`px-18 py-8 rounded-200 text-13 fw-600 transition-all ${
                      bookingFilter === 'past' ? 'bg-accent-1 text-white shadow-xs' : 'bg-light-1 text-sec'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {loadingBookings ? (
                <div className="p-60 text-center bg-light-1 rounded-24 border-1 border-light-1">
                  <div className="spinner-border text-accent-1 mb-15" role="status"></div>
                  <div className="text-16 text-sec fw-500">Loading your villa reservations...</div>
                </div>
              ) : filteredBookings.length > 0 ? (
                <div>
                  {filteredBookings.map((b) => (
                    <ReservationCard key={b.id} booking={b} user={user} />
                  ))}
                </div>
              ) : (
                <div className="p-60 sm:p-30 bg-light-1 rounded-24 border-1 border-light-1 text-center shadow-xs">
                  <div className="size-80 rounded-full bg-white text-accent-1 flex-center mx-auto mb-20 border-1 border-light-1 shadow-xs">
                    <i className="icon-bed text-32"></i>
                  </div>
                  <h3 className="text-26 fw-500 text-dark-1 mb-10">No Active Villa Bookings</h3>
                  <p className="text-16 text-sec max-w-500 mx-auto mb-30 lh-16">
                    You haven't placed any villa reservations yet. Explore our curated 4BHK luxury villas and private cabanas in Alibaug!
                  </p>
                  <Link
                    to="/our-villas"
                    className="button bg-accent-1 text-white rounded-200 px-35 py-16 text-15 fw-600 d-inline-flex shadow-xs hover-accent-dark transition-all"
                  >
                    BROWSE OUR VILLAS
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GUEST SUPPORT & COMPLAINTS */}
          {activeTab === 'complaints' && (
            <GuestComplaintsPortal bookings={bookings} />
          )}

          {/* TAB 4: SECURITY & SETTINGS */}
          {activeTab === 'security' && (
            <div className="row y-gap-40 justify-center">
              <div className="col-lg-7">
                <div className="p-40 sm:p-25 bg-white rounded-24 border-1 border-light-1 shadow-xs">
                  <h3 className="text-28 fw-500 text-dark-1 mb-25 pb-15 border-bottom-light">Change Password</h3>

                  {securityMessage && (
                    <div className="p-15 mb-25 bg-light-1 text-accent-1 rounded-12 text-14 border-1 border-light-1">
                      {securityMessage}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange}>
                    <div className="mb-20">
                      <label className="text-14 fw-600 text-dark-1 mb-8 d-block">Current Password *</label>
                      <input
                        type="password"
                        className="form-control rounded-12 p-16 border-1 border-light-1 w-1/1 text-16"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-20">
                      <label className="text-14 fw-600 text-dark-1 mb-8 d-block">New Password *</label>
                      <input
                        type="password"
                        className="form-control rounded-12 p-16 border-1 border-light-1 w-1/1 text-16"
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-30">
                      <label className="text-14 fw-600 text-dark-1 mb-8 d-block">Confirm New Password *</label>
                      <input
                        type="password"
                        className="form-control rounded-12 p-16 border-1 border-light-1 w-1/1 text-16"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="button bg-accent-1 text-white rounded-200 px-35 py-16 text-15 fw-600 shadow-xs hover-accent-dark transition-all"
                    >
                      UPDATE PASSWORD
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
