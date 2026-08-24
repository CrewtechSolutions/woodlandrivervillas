import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { NavigationMenu } from './NavigationMenu';
import { Footer } from './Footer';
import '../../assets/custom.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMenuOpen(false);

    const initAnimations = () => {
      if (typeof (window as any).initApp === 'function') {
        (window as any).initApp();
      }

      // Safety fallback: ensure cross-page mounted elements reveal smoothly and never stay hidden
      setTimeout(() => {
        document.querySelectorAll('[data-anim-wrap]').forEach((wrap) => {
          wrap.classList.add('animated');
        });

        document.querySelectorAll('[data-anim], [data-anim-child]').forEach((el) => {
          el.classList.add('is-in-view');
          el.querySelectorAll('.split__line').forEach((line) => {
            (line as HTMLElement).style.transform = 'translateY(0%)';
          });
        });
      }, 100);
    };

    const timer = setTimeout(initAnimations, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="layout-wrapper">
      {/* Custom Follower Cursor */}
      <div className="cursor js-cursor">
        <div className="cursor__follower"></div>
        <div className="cursor__label"></div>
        <div className="cursor__icon"></div>
      </div>

      <Header onOpenMenu={() => setIsMenuOpen(true)} />
      <NavigationMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <main className="main-content">{children}</main>

      <Footer />
    </div>
  );
};
