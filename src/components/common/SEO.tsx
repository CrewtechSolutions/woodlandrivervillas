import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Woodland River Villa Alibaug | Private Luxury Villas',
  description = 'Book woodland river villa in Alibaug for private stays with pool, space, and comfort. Perfect for weekend getaways, groups, and peaceful escapes.',
  canonical,
}) => {
  useEffect(() => {
    document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    const metaOgTitle = document.querySelector('meta[property="og:title"]');
    if (metaOgTitle) {
      metaOgTitle.setAttribute('content', title);
    }

    const metaOgDescription = document.querySelector('meta[property="og:description"]');
    if (metaOgDescription) {
      metaOgDescription.setAttribute('content', description);
    }

    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (linkCanonical) {
        linkCanonical.setAttribute('href', canonical);
      }
    }
  }, [title, description, canonical]);

  return null;
};
