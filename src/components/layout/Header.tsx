import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../data/siteConfig';

interface HeaderProps {
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`header -mx-60 js-header ${isSticky ? 'is-sticky bg-dark-2' : ''}`}
      data-add-bg="bg-dark-2"
    >
      <div className={`header__container ${isSticky ? 'py-25' : 'py-50'}`}>
        <div className="header__left d-flex items-center">
          <button
            className="d-flex items-center cursor-pointer js-menuFullScreen-toggle border-0 bg-transparent"
            onClick={onOpenMenu}
            aria-label="Open Menu"
            type="button"
          >
            <i className="icon-menu text-9 text-white"></i>
            <div className="text-15 uppercase text-white ml-30 sm:d-none">Menu</div>
          </button>
        </div>

        <div className="header__center">
          <Link className="header__logo" to="/">
            <img src="/assets/img/general/logo-white.svg" alt={siteConfig.name} />
          </Link>
        </div>

        <div className="header__right d-flex items-center h-full">
          <a href={`tel:${siteConfig.phoneNumbers[0].replace(/\s+/g, '')}`} className="button text-white mr-60 lg:d-none">
            <i className="icon-phone mr-15"></i>
            {siteConfig.phoneNumbers[0]}
          </a>

          <a
            className="button d-inline-flex -md -blur-1 text-white rounded-200 mr-30 lg:d-none"
            href={siteConfig.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            BOOK YOUR STAY
          </a>
        </div>
      </div>
    </header>
  );
};
