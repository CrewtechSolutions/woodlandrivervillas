import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VillaProvider } from './context/VillaContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { CataloguePage } from './pages/CataloguePage';
import { VillasPage } from './pages/VillasPage';
import { VillaDetailPage } from './pages/VillaDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPage } from './pages/AuthPage';
import { AccountPage } from './pages/AccountPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BookingDetailsPage } from './pages/BookingDetailsPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { RulesPolicyPage } from './pages/RulesPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VillaProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/about/index.html" element={<AboutPage />} />
              <Route path="/our-villas" element={<VillasPage />} />
              <Route path="/our-villas/index.html" element={<VillasPage />} />
              <Route path="/catalogue" element={<CataloguePage />} />
              <Route path="/our-villas/:id" element={<VillaDetailPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/gallery/index.html" element={<GalleryPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/contact/index.html" element={<ContactPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/account/bookings/:bookingId" element={<BookingDetailsPage />} />
              <Route path="/checkout/:id" element={<CheckoutPage />} />
              <Route path="/success" element={<BookingSuccessPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/rules-policy" element={<RulesPolicyPage />} />
              <Route path="/terms-conditions" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </VillaProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
