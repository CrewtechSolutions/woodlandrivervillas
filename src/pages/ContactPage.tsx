import React from 'react';
import { SEO } from '../components/common/SEO';
import { PageHero } from '../components/common/PageHero';
import { ContactForm } from '../components/sections/ContactForm';
import { InstagramGrid } from '../components/sections/InstagramGrid';

export const ContactPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Get in Touch with us to Plan Your Villa Stay | Woodland River Villa"
        description="Reach out with your dates or questions. We’ll help you plan a smooth villa stay with clear details, quick responses, and personal support."
        canonical="https://www.woodlandriver.com/contact/"
      />
      <PageHero
        title="Let’s Plan Your Stay Together"
        subtitle="Questions, dates, or special requests. Share what you need and we’ll help shape a stay that fits you."
        bgImage="/assets/img/pageHero/4.png"
      />
      <ContactForm />
      <InstagramGrid />
    </>
  );
};
