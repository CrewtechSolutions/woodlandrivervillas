import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';

export const NotFoundPage: React.FC = () => {
  return (
    <>
      <SEO title="404 Page Not Found | Woodland River Villa" />
      <section className="layout-pt-md layout-pb-md flex-center text-center py-100">
        <div className="container">
          <h1 className="text-64 md:text-40 fw-500">404</h1>
          <h2 className="text-30 md:text-24 mt-20">Page Not Found</h2>
          <p className="text-18 text-sec mt-20">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="mt-40">
            <Link to="/" className="button d-inline-flex -md bg-accent-1 text-white rounded-200">
              RETURN TO HOME
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
