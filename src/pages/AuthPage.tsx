import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { PageHero } from '../components/common/PageHero';
import { useAuth } from '../context/AuthContext';
import '../styles/account.css';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkEmail, login, register, isAuthenticated } = useAuth();

  const [step, setStep] = useState<'email' | 'login' | 'register'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to /account immediately
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/account', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await checkEmail(email.trim());
      if (res.exists) {
        setStep('login');
      } else {
        setStep('register');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify email address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/account', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) {
      setError('Please complete all required fields');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      navigate('/account', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetToEmail = () => {
    setStep('email');
    setError(null);
  };

  return (
    <>
      <SEO
        title="Guest Sign In & Registration | Woodland River Villa Alibaug"
        description="Sign in or register your account at Woodland River Villa Alibaug to manage your resort bookings and direct reservations."
      />

      <PageHero
        title="Guest Member Portal"
        subtitle="Access your resort reservations, guest profile, digital tax invoices, and direct member privileges."
        bgImage="/assets/img/pageHero/1.png"
      />

      <section className="layout-pt-md layout-pb-lg bg-light-1 account-wrapper">
        <div className="container relative z-10">
          <div className="row y-gap-40 justify-center items-stretch">
            {/* LEFT COLUMN: LUXURY RESORT PRIVILEGES SHOWCASE (6 COLS) */}
            <div className="col-lg-5 col-md-10">
              <div className="auth-banner-card">
                <div>
                  <div className="d-inline-flex items-center x-gap-8 bg-white/10 px-16 py-6 rounded-200 border-1 border-white/20 mb-24">
                    <span className="account-badge-vip">WOODLAND VIP CLUB</span>
                  </div>

                  <h2 className="text-36 font-serif fw-700 text-white mb-16 leading-tight">
                    Exclusive Resort Privileges
                  </h2>
                  <p className="text-15 text-white/80 mb-32 leading-relaxed">
                    Sign in to your member portal to manage current villa bookings, request priority check-in, download PDF invoices, and access 1-on-1 concierge assistance.
                  </p>

                  <div className="space-y-16">
                    <div className="auth-benefit-item">
                      <div className="size-40 rounded-12 bg-accent-1 text-dark-1 flex-center flex-shrink-0 fw-700">
                        <i className="icon-calendar text-18"></i>
                      </div>
                      <div>
                        <div className="text-16 font-bold text-white mb-2">Instant Reservation Tracking</div>
                        <div className="text-13 text-white/70">View stay timings, extra guest counts, and status updates in real time.</div>
                      </div>
                    </div>

                    <div className="auth-benefit-item">
                      <div className="size-40 rounded-12 bg-accent-1 text-dark-1 flex-center flex-shrink-0 fw-700">
                        <i className="icon-chat text-18"></i>
                      </div>
                      <div>
                        <div className="text-16 font-bold text-white mb-2">Direct Resort Concierge</div>
                        <div className="text-13 text-white/70">File support tickets or contact your personal WhatsApp manager 24/7.</div>
                      </div>
                    </div>

                    <div className="auth-benefit-item">
                      <div className="size-40 rounded-12 bg-accent-1 text-dark-1 flex-center flex-shrink-0 fw-700">
                        <i className="icon-shield text-18"></i>
                      </div>
                      <div>
                        <div className="text-16 font-bold text-white mb-2">Guaranteed Direct Rates</div>
                        <div className="text-13 text-white/70">Exclusive member rate protection for future luxury stays in Alibaug.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-30 mt-30 border-top-light border-white/10 text-13 text-white/60">
                  © Woodland River Villa • Luxury Private Resort Alibaug
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE GUEST AUTH FORM (7 COLS) */}
            <div className="col-lg-6 col-md-10">
              <div className="auth-card-luxury">
                {/* STEP 1: EMAIL VERIFICATION ENTRY */}
                {step === 'email' && (
                  <form onSubmit={handleCheckEmail}>
                    <div className="mb-32">
                      <div className="text-12 uppercase text-accent-1 font-bold tracking-wider mb-4">MEMBER AUTHENTICATION</div>
                      <h2 className="text-32 font-serif fw-700 text-dark-1 mb-8">Sign In or Register</h2>
                      <p className="text-15 text-sec">Enter your email address to access your guest portal.</p>
                    </div>

                    {error && (
                      <div className="p-16 mb-24 bg-red-50 text-red-800 rounded-16 text-14 font-medium border-1 border-red-200 d-flex items-center">
                        <i className="icon-close text-16 mr-10 text-red-600"></i>
                        {error}
                      </div>
                    )}

                    <div className="mb-28">
                      <label className="text-13 font-bold text-dark-1 mb-8 d-block uppercase tracking-wider">Email Address *</label>
                      <div className="relative">
                        <input
                          type="email"
                          className="form-control-luxury"
                          placeholder="e.g. guest@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={submitting}
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="button bg-accent-1 text-white rounded-200 w-1/1 py-16 text-15 fw-700 shadow-sm hover-accent-dark transition-all d-flex justify-center items-center"
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm mr-10" role="status" aria-hidden="true"></span>
                          Verifying Email...
                        </>
                      ) : (
                        <>
                          CONTINUE <i className="icon-arrow-right text-14 ml-8"></i>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* STEP 2A: LOGIN FORM */}
                {step === 'login' && (
                  <form onSubmit={handleLoginSubmit}>
                    <div className="d-flex justify-between items-center mb-25 pb-15 border-bottom-light">
                      <div>
                        <div className="text-12 uppercase text-accent-1 font-bold tracking-wider mb-2">WELCOME BACK</div>
                        <h2 className="text-28 font-serif fw-700 text-dark-1">Sign In to Account</h2>
                      </div>
                      <button
                        type="button"
                        onClick={resetToEmail}
                        className="text-13 text-sec hover-accent underline font-medium"
                      >
                        Change Email
                      </button>
                    </div>

                    <div className="p-14 bg-light-1 rounded-14 text-14 text-dark-1 mb-24 d-flex justify-between items-center border-1 border-light-1">
                      <div className="d-flex items-center">
                        <i className="icon-mail text-16 text-accent-1 mr-10"></i>
                        <span className="font-semibold">{email}</span>
                      </div>
                      <span className="text-11 font-bold text-emerald-800 bg-emerald-50 px-10 py-3 rounded-100 border-1 border-emerald-200">
                        Registered
                      </span>
                    </div>

                    {error && (
                      <div className="p-16 mb-24 bg-red-50 text-red-800 rounded-16 text-14 font-medium border-1 border-red-200 d-flex items-center">
                        <i className="icon-close text-16 mr-10 text-red-600"></i>
                        {error}
                      </div>
                    )}

                    <div className="mb-28">
                      <label className="text-13 font-bold text-dark-1 mb-8 d-block uppercase tracking-wider">Account Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control-luxury pr-50"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={submitting}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-16 top-1/2 -translate-y-1/2 text-14 text-sec hover-accent"
                        >
                          {showPassword ? 'HIDE' : 'SHOW'}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="button bg-accent-1 text-white rounded-200 w-1/1 py-16 text-15 fw-700 shadow-sm hover-accent-dark transition-all d-flex justify-center items-center mb-20"
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm mr-10" role="status" aria-hidden="true"></span>
                          Signing In...
                        </>
                      ) : (
                        'SIGN IN TO GUEST PORTAL'
                      )}
                    </button>

                    <div className="text-center pt-10 border-top-light">
                      <button
                        type="button"
                        onClick={() => { setStep('register'); setError(null); }}
                        className="text-14 text-sec hover-accent font-medium"
                      >
                        Don't have a password set up? <span className="text-accent-1 font-bold">Register now</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 2B: REGISTRATION FORM */}
                {step === 'register' && (
                  <form onSubmit={handleRegisterSubmit}>
                    <div className="d-flex justify-between items-center mb-25 pb-15 border-bottom-light">
                      <div>
                        <div className="text-12 uppercase text-accent-1 font-bold tracking-wider mb-2">NEW GUEST REGISTRATION</div>
                        <h2 className="text-28 font-serif fw-700 text-dark-1">Create Account</h2>
                      </div>
                      <button
                        type="button"
                        onClick={resetToEmail}
                        className="text-13 text-sec hover-accent underline font-medium"
                      >
                        Change Email
                      </button>
                    </div>

                    <div className="p-14 bg-light-1 rounded-14 text-14 text-dark-1 mb-24 d-flex justify-between items-center border-1 border-light-1">
                      <div className="d-flex items-center">
                        <i className="icon-mail text-16 text-accent-1 mr-10"></i>
                        <span className="font-semibold">{email}</span>
                      </div>
                      <span className="text-11 font-bold text-accent-1 bg-amber-50 px-10 py-3 rounded-100 border-1 border-amber-200">
                        New Guest
                      </span>
                    </div>

                    {error && (
                      <div className="p-16 mb-24 bg-red-50 text-red-800 rounded-16 text-14 font-medium border-1 border-red-200 d-flex items-center">
                        <i className="icon-close text-16 mr-10 text-red-600"></i>
                        {error}
                      </div>
                    )}

                    <div className="space-y-20 mb-28">
                      <div>
                        <label className="text-13 font-bold text-dark-1 mb-8 d-block uppercase tracking-wider">Full Name *</label>
                        <input
                          type="text"
                          className="form-control-luxury"
                          placeholder="e.g. Rahul Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={submitting}
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="text-13 font-bold text-dark-1 mb-8 d-block uppercase tracking-wider">Phone Number (Optional)</label>
                        <input
                          type="tel"
                          className="form-control-luxury"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={submitting}
                        />
                      </div>

                      <div>
                        <label className="text-13 font-bold text-dark-1 mb-8 d-block uppercase tracking-wider">Create Account Password *</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control-luxury pr-50"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={submitting}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-16 top-1/2 -translate-y-1/2 text-14 text-sec hover-accent"
                          >
                            {showPassword ? 'HIDE' : 'SHOW'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="button bg-accent-1 text-white rounded-200 w-1/1 py-16 text-15 fw-700 shadow-sm hover-accent-dark transition-all d-flex justify-center items-center mb-20"
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm mr-10" role="status" aria-hidden="true"></span>
                          Creating Account...
                        </>
                      ) : (
                        'CREATE GUEST ACCOUNT'
                      )}
                    </button>

                    <div className="text-center pt-10 border-top-light">
                      <button
                        type="button"
                        onClick={() => { setStep('login'); setError(null); }}
                        className="text-14 text-sec hover-accent font-medium"
                      >
                        Already registered? <span className="text-accent-1 font-bold">Sign in instead</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
