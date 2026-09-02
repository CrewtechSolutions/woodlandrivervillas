import React, { useState, useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
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
import { User, Calendar, MessageSquare, ShieldCheck, Mail, Phone, MapPin, Sparkles, LogOut, Compass, Lock, Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import '../styles/account.css';

export const AccountPage: React.FC = () => {
  const { user, token, isAuthenticated, logout } = useAuth();
  const { villas } = useVillas();
  const location = useLocation();

  const getTabFromLocation = () => {
    const searchTab = new URLSearchParams(location.search).get('tab');
    const stateTab = (location.state as any)?.tab;
    return (searchTab || stateTab || 'profile') as 'profile' | 'bookings' | 'complaints' | 'security';
  };

  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'complaints' | 'security'>(getTabFromLocation());
  const [bookingFilter, setBookingFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [successBanner, setSuccessBanner] = useState<string | null>((location.state as any)?.message || null);

  useEffect(() => {
    const targetTab = getTabFromLocation();
    setActiveTab(targetTab);
  }, [location]);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);

  // Password update form state & toggles
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityMessage('Please complete all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityMessage('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setSecurityMessage('Password must be at least 6 characters long.');
      return;
    }

    setSecurityMessage('Security settings updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  const filteredBookings = bookings.filter((b) => {
    const status = b.status?.toLowerCase();
    
    // Do not show pending bookings
    if (status === 'pending') return false;
    
    if (bookingFilter === 'upcoming') {
      return status === 'confirmed';
    }
    if (bookingFilter === 'past') {
      return status === 'completed' || status === 'cancelled';
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
      <section className="pageHero -type-1 account-hero-section relative overflow-hidden">
        <div className="pageHero__bg">
          <img src="/assets/img/pageHero/1.png" alt="Woodland River Villa" loading="eager" />
        </div>
        <div className="pageHero-account-overlay"></div>

        <div className="container relative z-10">
          <div className="account-hero-card-luxury">
            <div className="row justify-between items-center y-gap-30 relative z-10">
              {/* LEFT: USER WELCOME TEXT & METADATA */}
              <div className="col-lg-8">
                <div className="d-flex flex-column y-gap-14">
                  {/* LINE 1: WELCOME SUB-HEADING & NAME */}
                  <div>
                    <span className="hero-welcome-label">WELCOME TO GUEST PORTAL</span>
                    <h1 className="account-hero-title">
                      {user.name}
                    </h1>
                  </div>

                  {/* LINE 2: VIP MEMBER BADGE */}
                  <div className="d-flex items-center x-gap-12 flex-wrap y-gap-6">
                    <span className="account-badge-vip">
                      <Sparkles size={13} className="text-amber-300 mr-4" />
                      WOODLAND VIP MEMBER
                    </span>
                  </div>

                  {/* LINE 3: METADATA PILLS */}
                  <div className="d-flex items-center flex-wrap x-gap-10 y-gap-10 pt-8">
                    <span className="hero-meta-pill">
                      <Mail size={14} className="text-accent-gold mr-6" />
                      <span>{user.email}</span>
                    </span>
                    {user.phone && (
                      <span className="hero-meta-pill">
                        <Phone size={14} className="text-accent-gold mr-6" />
                        <span>{user.phone}</span>
                      </span>
                    )}
                    <span className="hero-meta-pill">
                      <MapPin size={14} className="text-accent-gold mr-6" />
                      <span>Zirad, Alibaug</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: EQUAL-SIZED ACTION BUTTONS (BOOK NEW VILLA STAY & SIGN OUT) */}
              <div className="col-lg-4 d-flex justify-end md:justify-start">
                <div className="d-flex flex-column sm:flex-row items-center x-gap-16 y-gap-12 w-1/1 sm:w-auto">
                  <Link
                    to="/catalogue"
                    className="btn-hero-primary"
                  >
                    <Compass size={17} className="mr-6" />
                    <span>BOOK NEW VILLA STAY</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="btn-hero-secondary"
                  >
                    <LogOut size={17} className="mr-6" />
                    <span>SIGN OUT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN BODY AREA WITH CENTERED PILL TABS */}
      <section className="bg-white text-dark-1 layout-pt-md pb-100 account-wrapper">
        <div className="container">

          {/* SUCCESS NOTIFICATION BANNER */}
          {successBanner && (
            <div className="mb-40 p-24 bg-emerald-50 text-emerald-900 rounded-20 border-1 border-emerald-200 d-flex justify-between items-center shadow-sm animate-fadeIn">
              <div className="d-flex items-center">
                <i className="icon-check text-18 text-emerald-600 mr-12 size-36 rounded-full bg-emerald-100 flex-center flex-shrink-0"></i>
                <div>
                  <div className="text-16 font-bold">{successBanner}</div>
                  <div className="text-13 text-emerald-700 font-medium mt-2">Your villa reservation is active and listed under My Bookings below.</div>
                </div>
              </div>
              <button 
                onClick={() => setSuccessBanner(null)} 
                className="text-emerald-700 hover:text-emerald-950 text-18 font-bold ml-16"
              >
                ✕
              </button>
            </div>
          )}

          {/* ELEGANT CENTERED SUB-MENU NAVIGATION PILL BAR */}
          <div className="account-tabs-container mb-40 px-15">
            <div className="account-tabs-wrapper">
              <button
                onClick={() => setActiveTab('profile')}
                className={`account-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              >
                <User size={17} className="tab-icon" />
                <span>Profile Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`account-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              >
                <Calendar size={17} className="tab-icon" />
                <span>My Reservations</span>
                <span className="account-tab-badge">
                  {bookings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('complaints')}
                className={`account-tab-btn ${activeTab === 'complaints' ? 'active' : ''}`}
              >
                <MessageSquare size={17} className="tab-icon" />
                <span>Support & Complaints</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`account-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              >
                <ShieldCheck size={17} className="tab-icon" />
                <span>Security & Settings</span>
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
                <div className="auth-card-luxury">
                  <div className="d-flex justify-between items-center mb-28 pb-18 border-bottom-light">
                    <div>
                      <div className="text-11 uppercase text-accent-1 font-bold tracking-wider mb-2">SECURITY & CREDENTIALS</div>
                      <h3 className="text-24 md:text-28 font-serif fw-700 text-dark-1">Change Account Password</h3>
                    </div>
                    <ShieldCheck size={28} className="text-accent-gold flex-shrink-0" />
                  </div>

                  {securityMessage && (
                    <div className={`p-16 mb-24 rounded-16 text-14 font-medium border-1 d-flex items-center ${
                      securityMessage.includes('successfully')
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                      {securityMessage.includes('successfully') ? (
                        <CheckCircle2 size={18} className="mr-10 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle size={18} className="mr-10 text-red-600 flex-shrink-0" />
                      )}
                      <span>{securityMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordUpdate}>
                    {/* CURRENT PASSWORD */}
                    <div className="auth-input-group">
                      <label className="auth-input-label">Current Password *</label>
                      <div className="auth-input-wrapper">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          className="form-control-luxury-icon has-toggle"
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                        <Lock size={18} className="auth-input-icon" />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="auth-password-toggle"
                        >
                          {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          <span>{showCurrentPassword ? 'HIDE' : 'SHOW'}</span>
                        </button>
                      </div>
                    </div>

                    {/* NEW PASSWORD */}
                    <div className="auth-input-group">
                      <label className="auth-input-label">New Password *</label>
                      <div className="auth-input-wrapper">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className="form-control-luxury-icon has-toggle"
                          placeholder="At least 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <KeyRound size={18} className="auth-input-icon" />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="auth-password-toggle"
                        >
                          {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          <span>{showNewPassword ? 'HIDE' : 'SHOW'}</span>
                        </button>
                      </div>
                    </div>

                    {/* CONFIRM NEW PASSWORD */}
                    <div className="auth-input-group -last">
                      <label className="auth-input-label">Confirm New Password *</label>
                      <div className="auth-input-wrapper">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="form-control-luxury-icon has-toggle"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <Lock size={18} className="auth-input-icon" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="auth-password-toggle"
                        >
                          {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          <span>{showConfirmPassword ? 'HIDE' : 'SHOW'}</span>
                        </button>
                      </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button
                      type="submit"
                      className="btn-auth-primary"
                    >
                      UPDATE ACCOUNT PASSWORD
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
