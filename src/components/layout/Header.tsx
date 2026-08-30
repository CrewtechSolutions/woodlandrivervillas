import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../../data/siteConfig';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  const [isSticky, setIsSticky] = useState(false);
  const { isAuthenticated, user } = useAuth();

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
          <a href={`tel:${siteConfig.phoneNumbers[0].replace(/\s+/g, '')}`} className="button text-white mr-40 lg:d-none">
            <i className="icon-phone mr-15"></i>
            {siteConfig.phoneNumbers[0]}
          </a>

          <Link
            to={isAuthenticated ? '/account' : '/login'}
            className="button d-inline-flex items-center text-white mr-30 hover-accent"
            aria-label="User Account"
          >
            <div className="size-36 rounded-full bg-white/10 flex-center mr-10 border-1 border-white/20">
              <i className="icon-guest text-16 text-accent-1"></i>
            </div>
            <span className="text-14 fw-600 sm:d-none">
              {isAuthenticated && user ? user.name.split(' ')[0] : 'SIGN IN'}
            </span>
          </Link>

          <Link
            className="button d-inline-flex -md -blur-1 text-white rounded-200 mr-20 lg:d-none"
            to="/catalogue"
          >
            BOOK YOUR STAY
          </Link>
        </div>
      </div>
    </header>
  );
};
