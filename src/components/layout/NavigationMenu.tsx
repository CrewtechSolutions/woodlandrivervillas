import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { siteConfig } from '../../data/siteConfig';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navLinks = [
    { label: 'HOME', path: '/' },
    { label: 'OUR VILLAS', path: '/our-villas' },
    { label: 'ABOUT US', path: '/about' },
    { label: 'GALLERY', path: '/gallery' },
    { label: 'CONTACT', path: '/contact' },
  ];

  // Auto-close menu on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Handle body scroll lock & GSAP open/close animations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.classList.add('html-overflow-hidden');
      document.body.classList.add('overflow-hidden');
      window.addEventListener('keydown', handleKeyDown);

      const menu = document.querySelector('.js-menuFullScreen');
      if (menu && typeof (window as any).gsap !== 'undefined') {
        const gsap = (window as any).gsap;
        const topMobile = menu.querySelector('.js-menuFullScreen-topMobile');
        const mobileBg = menu.querySelector('.js-menuFullScreen-mobile-bg');
        const bg = menu.querySelector('.js-menuFullScreen-bg');
        const bgImage = menu.querySelector('.js-menuFullScreen-bg > img');
        const closeBtn = menu.querySelector('.js-menuFullScreen-close-btn');
        const links = menu.querySelectorAll('.js-menuFullScreen-links > .menuFullScreen-links__item > a');
        const right = menu.querySelector('.js-menuFullScreen-right');
        const buttomMobile = menu.querySelector('.js-menuFullScreen-buttomMobile');

        // Reset & kill existing animations
        gsap.killTweensOf([mobileBg, bgImage, bg, topMobile, closeBtn, links, right, buttomMobile]);

        gsap.timeline()
          .fromTo(mobileBg, { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: 'quart.inOut' })
          .fromTo(bgImage, { scale: 1.2 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0)
          .fromTo(bg, { clipPath: 'rect(0px 100% 0% 0px)' }, { clipPath: 'rect(0px 100% 100% 0px)', duration: 0.8, ease: 'expo.inOut' }, 0)
          .fromTo(topMobile, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'quart.out' }, 0.3)
          .fromTo(closeBtn, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'quart.out' }, 0.3)
          .fromTo(links, { y: '50%', opacity: 0 }, { y: '0%', opacity: 1, duration: 0.5, stagger: 0.05, ease: 'quart.out' }, 0.3)
          .fromTo(buttomMobile, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'quart.out' }, 0.4)
          .fromTo(right, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, ease: 'quart.out' }, 0.3);
      }
    } else {
      document.body.classList.remove('html-overflow-hidden');
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('html-overflow-hidden');
      document.body.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div className={`menuFullScreen js-menuFullScreen ${isOpen ? 'is-active is-open' : ''}`}>
      <div className="menuFullScreen__topMobile js-menuFullScreen-topMobile">
        <button className="js-menuFullScreen-toggle border-0 bg-transparent" onClick={onClose} aria-label="Close Mobile Menu">
          <i className="icon-close text-20 text-white"></i>
        </button>

        <div>
          <Link to="/" onClick={onClose}>
            <img src="/assets/img/general/logo-white.svg" alt={siteConfig.name} />
          </Link>
        </div>
      </div>

      <div className="menuFullScreen__mobile__bg js-menuFullScreen-mobile-bg" onClick={onClose}></div>

      <div className="menuFullScreen__left">
        <div className="menuFullScreen__bg js-menuFullScreen-bg">
          <img src="/assets/img/menu/bg.png" alt="menu background" />
        </div>

        <button
          className="menuFullScreen__close js-menuFullScreen-toggle js-menuFullScreen-close-btn"
          onClick={onClose}
          aria-label="Close Menu"
          type="button"
        >
          <span className="icon">
            <span></span>
            <span></span>
          </span>
          CLOSE
        </button>

        <div className="menuFullScreen-links js-menuFullScreen-links">
          {navLinks.map((link) => (
            <div
              key={link.path}
              className={`menuFullScreen-links__item ${location.pathname === link.path ? 'is-active' : ''}`}
            >
              <Link to={link.path} onClick={onClose}>
                {link.label}
                <i className="icon-arrow-right"></i>
                <i className="icon-chevron-right"></i>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="menuFullScreen__right js-menuFullScreen-right">
        <div className="text-center">
          <div className="mb-100">
            <img src="/assets/img/general/logo-black.svg" alt={siteConfig.name} />
          </div>

          <div className="text-sec lh-11 fw-500 text-40">
            Own Your Weekend at<br />
            Woodland River Villa
          </div>

          <div className="mt-40">
            <div className="text-30 text-sec fw-500">Location</div>
            <div className="mt-10">
              230/3, Woodland River Villas, <br />Zirad Pada, Zirad, Alibag - 402201
            </div>
          </div>

          <div className="mt-40">
            <div className="text-30 text-sec fw-500">Phone Support</div>
            <div className="mt-10">
              <div>
                <a href={`tel:${siteConfig.phoneNumbers[0].replace(/\s+/g, '')}`}>{siteConfig.phoneNumbers[0]}</a>
              </div>
              <div>
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </div>
            </div>
          </div>

          <div className="mt-40">
            <div className="text-30 text-sec fw-500">Connect With Us</div>
            <div className="mt-10">
              <a href={`tel:${siteConfig.phoneNumbers[0].replace(/\s+/g, '')}`}>{siteConfig.phoneNumbers[0]}</a>
            </div>
          </div>
        </div>
      </div>

      <div className="menuFullScreen__bottomMobile js-menuFullScreen-buttomMobile">
        <a
          className="button d-inline-flex rounded-200 w-1/1 py-20 -light-1 bg-accent-2 justify-center"
          href={siteConfig.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          BOOK YOUR STAY
        </a>

        <a href={`tel:${siteConfig.phoneNumbers[0].replace(/\s+/g, '')}`} className="d-flex items-center mt-40">
          <i className="icon-phone mr-10"></i>
          <span>{siteConfig.phoneNumbers[0]}</span>
        </a>

        <a href={siteConfig.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="d-flex mt-20">
          <i className="icon-map mr-10"></i>
          <span>{siteConfig.address}</span>
        </a>

        <a href={`mailto:${siteConfig.email}`} className="d-flex items-center mt-20">
          <i className="icon-mail mr-10"></i>
          <span>{siteConfig.email}</span>
        </a>
      </div>
    </div>
  );
};
