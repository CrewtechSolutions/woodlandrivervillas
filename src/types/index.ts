export interface Villa {
  id: string;
  offeringId?: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  guests: string;
  maxGuests?: number;
  checkInTime?: string;
  checkOutTime?: string;
  pricePerNight?: number;
  securityDeposit?: number;
  cleaningFee?: number;
  heroImage: string;
  galleryImages: string[];
  features: string[];
  bookingUrl: string;
  addons?: {
    id: string;
    name: string;
    description?: string;
    priceCents: number;
    priceType: string;
    multiSelect: boolean;
    maxQuantity?: number;
  }[];
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

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  createdAt?: string;
}

export interface CheckEmailResponse {
  exists: boolean;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

export interface Booking {
  id: string;
  bookingCode?: string;
  villaName: string;
  villaSlug?: string;
  heroImage?: string;
  checkIn: string;
  checkOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  guests: number | string;
  additionalGuests?: number;
  guestsDisplay?: string;
  totalPrice: number;
  currency?: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt?: string;
  paymentHistory?: any[];
  raw?: any;
  totalCents: number;
  paymentCents?: number;
  depositCents?: number;
  items?: any[];
  metadata?: any;
  notes?: string;
  referenceId?: string;
  startTime: string;
  endTime: string;
}

export interface ComplaintTicket {
  id: string;
  bookingId: string;
  bookingCode: string;
  villaName: string;
  category: 'housekeeping' | 'amenities' | 'billing' | 'staff_service' | 'maintenance' | 'other';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  resolutionNote?: string;
}
