import React from 'react';
import { SEO } from '../components/common/SEO';
import { HeroSlider } from '../components/sections/HeroSlider';
import { AboutSection } from '../components/sections/AboutSection';
import { VillaWorldSlider } from '../components/sections/VillaWorldSlider';
import { VillaGrid } from '../components/sections/VillaGrid';
import { ComfortSection } from '../components/sections/ComfortSection';
import { WhatYourStaySection } from '../components/sections/WhatYourStaySection';
import { EmbraceSpaceSection } from '../components/sections/EmbraceSpaceSection';
import { TestimonialSlider } from '../components/sections/TestimonialSlider';
import { InstagramGrid } from '../components/sections/InstagramGrid';

export const HomePage: React.FC = () => {
  return (
    <>
      <SEO
        title="Woodland River Villa Alibaug | Private Luxury Villas"
        description="Book woodland river villa in Alibaug for private stays with pool, space, and comfort. Perfect for weekend getaways, groups, and peaceful escapes."
      />
      <HeroSlider />
      <AboutSection />
      <VillaWorldSlider />
      <VillaGrid />
      <ComfortSection />
      <WhatYourStaySection />
      <EmbraceSpaceSection />
      <TestimonialSlider />
      <InstagramGrid />
    </>
  );
};
