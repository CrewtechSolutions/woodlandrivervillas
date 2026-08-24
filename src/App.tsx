import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { VillasPage } from './pages/VillasPage';
import { VillaDetailPage } from './pages/VillaDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { RulesPolicyPage } from './pages/RulesPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/index.html" element={<AboutPage />} />
          <Route path="/our-villas" element={<VillasPage />} />
          <Route path="/our-villas/index.html" element={<VillasPage />} />
          <Route path="/our-villas/:id" element={<VillaDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/gallery/index.html" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact/index.html" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/rules-policy" element={<RulesPolicyPage />} />
          <Route path="/terms-conditions" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};
