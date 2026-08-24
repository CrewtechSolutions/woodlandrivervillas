export interface Villa {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  guests: string;
  heroImage: string;
  galleryImages: string[];
  features: string[];
  bookingUrl: string;
}

export interface Amenity {
  id: string;
  title: string;
  image: string;
  description?: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  location: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'all' | 'villas' | 'exterior' | 'pool' | 'dining' | 'grounds';
  image: string;
  alt: string;
}

export interface PolicySection {
  title: string;
  content: string[];
}

export interface SiteConfig {
  name: string;
  tagline: string;
  phoneNumbers: string[];
  email: string;
  address: string;
  googleMapsUrl: string;
  bookingUrl: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
  };
}
