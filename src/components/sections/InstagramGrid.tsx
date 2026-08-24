import React from 'react';
import { siteConfig } from '../../data/siteConfig';

export const InstagramGrid: React.FC = () => {
  const images = [
    '/assets/img/inst/1/1.png',
    '/assets/img/inst/1/2.png',
    '/assets/img/inst/1/3.png',
    '/assets/img/inst/1/4.png',
    '/assets/img/inst/1/5.png',
    '/assets/img/inst/1/6.png',
  ];

  return (
    <section data-anim-wrap className="layout-pt-md">
      <div className="row justify-center text-center">
        <div data-anim-child="slide-up delay-1" className="col-auto">
          <h2 className="text-64 md:text-40">See It Before You Book It</h2>
        </div>
      </div>

      <div className="row x-gap-0 pt-100 sm:pt-50">
        {images.map((img, idx) => (
          <div key={idx} className="col">
            <a
              href={siteConfig.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="ratio ratio-1:1"
              data-anim-child={`img-right cover-white delay-${(idx + 1) * 2}`}
            >
              <img src={img} alt="Instagram preview" className="img-ratio" loading="lazy" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};
