import React from 'react';
import { siteConfig } from '../../data/siteConfig';

interface BookingCTAProps {
  title?: string;
  subtitle?: string;
}

export const BookingCTA: React.FC<BookingCTAProps> = ({
  title = 'Ready for Your Private Stay in Alibaug?',
  subtitle = 'Book Woodland River Villa directly for the best rates and personalized experience.',
}) => {
  return (
    <section className="layout-pt-md layout-pb-md bg-dark-2 text-white">
      <div className="container text-center">
        <div className="row justify-center">
          <div className="col-xl-8 col-lg-10">
            <h2 className="text-64 md:text-40 text-white">{title}</h2>
            <p className="text-20 text-white opacity-80 mt-30 md:mt-15">{subtitle}</p>

            <div className="d-flex justify-center items-center x-gap-30 y-gap-20 mt-50 flex-wrap">
              <a
                href={siteConfig.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button d-inline-flex -md bg-accent-1 text-white rounded-200"
              >
                BOOK YOUR STAY NOW
              </a>

              <a
                href={`tel:${siteConfig.phoneNumbers[0].replace(/\s+/g, '')}`}
                className="button d-inline-flex -md -blur-1 text-white rounded-200"
              >
                <i className="icon-phone mr-15"></i>
                CALL US DIRECTLY
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
