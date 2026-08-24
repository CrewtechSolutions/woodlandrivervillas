import React from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../data/siteConfig';

export const Footer: React.FC = () => {
  return (
    <footer className="footer -type-1 -bottom-border-dark bg-light-1">
      <div className="footer__main">
        <div className="container">
          <div className="footer__grid">
            <div className="">
              <h4 className="text-30 fw-500">About Us</h4>
              <div className="text-15 lh-17 mt-60 md:mt-20">
                Woodland river villa gives you a private space where you don’t have to adjust around strangers or rigid timings. It’s simple you check in, and the place is yours.
              </div>

              <div className="row x-gap-25 y-gap-10 items-center justify-start mt-30">
                <div className="col-auto">
                  <a href={siteConfig.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="d-block" aria-label="Facebook">
                    <i className="icon-facebook text-13"></i>
                  </a>
                </div>

                <div className="col-auto">
                  <a href={siteConfig.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="d-block" aria-label="Instagram">
                    <i className="icon-instagram text-13"></i>
                  </a>
                </div>

                <div className="col-auto">
                  <a href={siteConfig.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="d-inline-flex justify-content-center align-items-center" aria-label="YouTube">
                    <svg fill="#122223" width="14" height="14" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                      <title>youtube</title>
                      <path d="M31.681 9.6c0 0-0.313-2.206-1.275-3.175-1.219-1.275-2.581-1.281-3.206-1.356-4.475-0.325-11.194-0.325-11.194-0.325h-0.012c0 0-6.719 0-11.194 0.325-0.625 0.075-1.987 0.081-3.206 1.356-0.963 0.969-1.269 3.175-1.269 3.175s-0.319 2.588-0.319 5.181v2.425c0 2.587 0.319 5.181 0.319 5.181s0.313 2.206 1.269 3.175c1.219 1.275 2.819 1.231 3.531 1.369 2.563 0.244 10.881 0.319 10.881 0.319s6.725-0.012 11.2-0.331c0.625-0.075 1.988-0.081 3.206-1.356 0.962-0.969 1.275-3.175 1.275-3.175s0.319-2.587 0.319-5.181v-2.425c-0.006-2.588-0.325-5.181-0.325-5.181zM12.694 20.15v-8.994l8.644 4.513-8.644 4.481z"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="">
              <h4 className="text-30 fw-500">Contact</h4>

              <div className="d-flex flex-column mt-60 md:mt-20">
                <div>
                  <a className="d-block text-15 lh-17" href={siteConfig.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    {siteConfig.address}
                  </a>
                </div>

                <div className="mt-25">
                  <a className="d-block text-15" href={`mailto:${siteConfig.email}`}>
                    {siteConfig.email}
                  </a>
                </div>

                <div className="mt-10">
                  <a className="d-block text-15" href={`tel:${siteConfig.phoneNumbers[0].replace(/\s+/g, '')}`}>
                    {siteConfig.phoneNumbers[0]}
                  </a>
                </div>
              </div>
            </div>

            <div className="">
              <h4 className="text-30 fw-500">Links</h4>

              <div className="row x-gap-50 y-gap-15">
                <div className="col-sm-6">
                  <div className="y-gap-15 text-15 mt-60 md:mt-20">
                    <Link className="d-block" to="/about"> About Us </Link>
                    <Link className="d-block" to="/our-villas"> Our Villas </Link>
                    <Link className="d-block" to="/contact"> Contact </Link>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="y-gap-15 text-15 mt-60 md:mt-20">
                    <Link className="d-block" to="/rules-policy"> Rules & Policies </Link>
                    <a className="d-block" href={siteConfig.googleMapsUrl} target="_blank" rel="noopener noreferrer"> Get Directions </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <div className="row y-gap-30 justify-between md:justify-center items-center">
            <div className="col-sm-auto">
              <div className="text-15 text-center">
                Copyright © 2026 by Woodland River Villa's
              </div>
            </div>

            <div className="col-sm-auto">
              <div className="footer__bottom_center">
                <div className="d-flex justify-center">
                  <Link to="/">
                    <img src="/assets/img/general/logo-black.svg" alt={siteConfig.name} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-sm-auto">
              <div className="text-15 text-center">
                Designed & Developed by <a href="https://werqlabs.com" target="_blank" rel="noopener noreferrer">Werq Labs</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
