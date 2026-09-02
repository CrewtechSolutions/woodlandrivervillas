import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { PageHero } from '../components/common/PageHero';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ShieldCheck, 
  Calendar, 
  MessageSquare, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles,
  AlertCircle 
} from 'lucide-react';
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
          <div className="row y-gap-30 justify-center items-stretch">
            {/* LEFT COLUMN: LUXURY RESORT PRIVILEGES SHOWCASE */}
            <div className="col-lg-5 col-md-10">
              <div className="auth-banner-card">
                <div>
                  <div className="auth-vip-badge">
                    <Sparkles size={14} className="text-amber-300" />
                    <span className="auth-vip-badge-text">WOODLAND VIP CLUB</span>
                  </div>

                  <h2 className="auth-banner-title">
                    Exclusive Resort <span className="text-gold-gradient">Privileges</span>
                  </h2>
                  <p className="auth-banner-subtitle">
                    Sign in to your member portal to manage current villa bookings, request priority check-in, download PDF invoices, and access 1-on-1 concierge assistance.
                  </p>

                  <div className="auth-benefits-list">
                    <div className="auth-benefit-item">
                      <div className="auth-benefit-icon">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <div className="auth-benefit-title">Instant Reservation Tracking</div>
                        <div className="auth-benefit-desc">View stay timings, extra guest counts, and status updates in real time.</div>
                      </div>
                    </div>

                    <div className="auth-benefit-item">
                      <div className="auth-benefit-icon">
                        <MessageSquare size={20} />
                      </div>
                      <div>
                        <div className="auth-benefit-title">Direct Resort Concierge</div>
                        <div className="auth-benefit-desc">File support tickets or contact your personal WhatsApp manager 24/7.</div>
                      </div>
                    </div>

                    <div className="auth-benefit-item">
                      <div className="auth-benefit-icon">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <div className="auth-benefit-title">Guaranteed Direct Rates</div>
                        <div className="auth-benefit-desc">Exclusive member rate protection for future luxury stays in Alibaug.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="auth-banner-footer">
                  <span>© Woodland River Villa</span>
                  <span className="auth-banner-footer-dot"></span>
                  <span>Luxury Private Resort Alibaug</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE GUEST AUTH FORM */}
            <div className="col-lg-6 col-md-10">
              <div className="auth-card-luxury">                {/* STEP 1: EMAIL VERIFICATION ENTRY */}
                {step === 'email' && (
                  <form onSubmit={handleCheckEmail}>
                    <div className="auth-header-block">
                      <div className="text-11 uppercase text-accent-1 font-bold tracking-wider mb-6">MEMBER AUTHENTICATION</div>
                      <h2 className="text-28 md:text-32 font-serif fw-700 text-dark-1 mb-8">Sign In or Register</h2>
                      <p className="text-14 text-sec">Enter your email address to access your guest portal.</p>
                    </div>

                    {error && (
                      <div className="p-16 mb-24 bg-red-50 text-red-800 rounded-16 text-14 font-medium border-1 border-red-200 d-flex items-center">
                        <AlertCircle size={18} className="mr-10 text-red-600 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="auth-input-group -last">
                      <label className="auth-input-label">Email Address *</label>
                      <div className="auth-input-wrapper">
                        <input
                          type="email"
                          className="form-control-luxury-icon"
                          placeholder="e.g. guest@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={submitting}
                          autoFocus
                        />
                        <Mail size={18} className="auth-input-icon" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-auth-primary"
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm mr-8" role="status" aria-hidden="true"></span>
                          Verifying Email...
                        </>
                      ) : (
                        <>
                          CONTINUE <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* STEP 2A: LOGIN FORM */}
                {step === 'login' && (
                  <form onSubmit={handleLoginSubmit}>
                    <div className="d-flex justify-between items-center mb-28 pb-18 border-bottom-light">
                      <div>
                        <div className="text-11 uppercase text-accent-1 font-bold tracking-wider mb-2">WELCOME BACK</div>
                        <h2 className="text-24 md:text-28 font-serif fw-700 text-dark-1">Sign In to Account</h2>
                      </div>
                      <button
                        type="button"
                        onClick={resetToEmail}
                        className="text-13 text-sec hover-accent underline font-medium"
                      >
                        Change Email
                      </button>
                    </div>

                    <div className="auth-email-badge">
                      <div className="auth-email-badge-text">
                        <Mail size={16} className="text-accent-1 flex-shrink-0" />
                        <span>{email}</span>
                      </div>
                      <span className="auth-status-pill registered">
                        Registered
                      </span>
                    </div>

                    {error && (
                      <div className="p-16 mb-24 bg-red-50 text-red-800 rounded-16 text-14 font-medium border-1 border-red-200 d-flex items-center">
                        <AlertCircle size={18} className="mr-10 text-red-600 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="auth-input-group -last">
                      <label className="auth-input-label">Account Password *</label>
                      <div className="auth-input-wrapper">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control-luxury-icon has-toggle"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={submitting}
                          autoFocus
                        />
                        <Lock size={18} className="auth-input-icon" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="auth-password-toggle"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          <span>{showPassword ? 'HIDE' : 'SHOW'}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-auth-primary"
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm mr-8" role="status" aria-hidden="true"></span>
                          Signing In...
                        </>
                      ) : (
                        'SIGN IN TO GUEST PORTAL'
                      )}
                    </button>

                    <div className="auth-form-footer-link">
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
                    <div className="d-flex justify-between items-center mb-28 pb-18 border-bottom-light">
                      <div>
                        <div className="text-11 uppercase text-accent-1 font-bold tracking-wider mb-2">NEW GUEST REGISTRATION</div>
                        <h2 className="text-24 md:text-28 font-serif fw-700 text-dark-1">Create Account</h2>
                      </div>
                      <button
                        type="button"
                        onClick={resetToEmail}
                        className="text-13 text-sec hover-accent underline font-medium"
                      >
                        Change Email
                      </button>
                    </div>

                    <div className="auth-email-badge">
                      <div className="auth-email-badge-text">
                        <Mail size={16} className="text-accent-1 flex-shrink-0" />
                        <span>{email}</span>
                      </div>
                      <span className="auth-status-pill new-guest">
                        New Guest
                      </span>
                    </div>

                    {error && (
                      <div className="p-16 mb-24 bg-red-50 text-red-800 rounded-16 text-14 font-medium border-1 border-red-200 d-flex items-center">
                        <AlertCircle size={18} className="mr-10 text-red-600 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="auth-input-group">
                      <label className="auth-input-label">Full Name *</label>
                      <div className="auth-input-wrapper">
                        <input
                          type="text"
                          className="form-control-luxury-icon"
                          placeholder="e.g. Rahul Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={submitting}
                          autoFocus
                        />
                        <User size={18} className="auth-input-icon" />
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <label className="auth-input-label">Phone Number (Optional)</label>
                      <div className="auth-input-wrapper">
                        <input
                          type="tel"
                          className="form-control-luxury-icon"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={submitting}
                        />
                        <Phone size={18} className="auth-input-icon" />
                      </div>
                    </div>

                    <div className="auth-input-group -last">
                      <label className="auth-input-label">Create Account Password *</label>
                      <div className="auth-input-wrapper">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control-luxury-icon has-toggle"
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={submitting}
                        />
                        <Lock size={18} className="auth-input-icon" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="auth-password-toggle"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          <span>{showPassword ? 'HIDE' : 'SHOW'}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-auth-primary"
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm mr-8" role="status" aria-hidden="true"></span>
                          Creating Account...
                        </>
                      ) : (
                        'CREATE GUEST ACCOUNT'
                      )}
                    </button>

                    <div className="auth-form-footer-link">
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

