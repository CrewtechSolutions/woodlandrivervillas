import { Villa } from '../types';

const BASE_URL =
  import.meta.env.VITE_CATALOGUE_API_URL || 'https://api.amigomarkethub.com/api/public/v1/catalogue';
const API_KEY =
  import.meta.env.VITE_CATALOGUE_API_KEY || 'mk_8ea1437b92745ed3576ef6773956e5054b817afc9c33e75ee87af6863c219399';

export interface CatalogueOffering {
  id: string;
  productId: string;
  name: string;
  type: string;
  priceCents: number;
  depositCents: number;
  currency: string;
  priceUnit: string;
  active: boolean;
}

export interface CatalogueProduct {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  active: boolean;
  attributes?: {
    type?: string;
    no_of_rooms?: string | number;
    no_of_bathrooms?: string | number;
    guests_allowed?: string | number;
    amenities?: string[];
    photos?: string[];
  };
  offerings?: CatalogueOffering[];
}

export interface CatalogueApiResponse {
  success: boolean;
  count?: number;
  data: CatalogueProduct[];
}

// In-memory cache for fast SPA navigation
let villasCache: Villa[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const catalogueApiService = {
  /**
   * Raw fetch call to Amigo Market Hub Catalogue API
   */
  async fetchCatalogueRaw(): Promise<CatalogueApiResponse> {
    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Catalogue API HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },

  /**
   * Fetch catalogue products and transform them into dynamic Villa models
   */
  async getVillas(forceRefresh = false): Promise<Villa[]> {
    const now = Date.now();
    if (!forceRefresh && villasCache && now - lastFetchTime < CACHE_TTL_MS) {
      return villasCache;
    }

    try {
      const responseData = await this.fetchCatalogueRaw();
      const rawObj = responseData as any;
      const products = Array.isArray(responseData)
        ? responseData
        : rawObj.data || rawObj.products || [];

      if (!products || products.length === 0) {
        return [];
      }

      // Filter products that represent villas/cabanas
      const villaProducts = products.filter((p: CatalogueProduct) => {
        if (!p.active) return false;
        const nameUpper = p.name.toUpperCase();
        return (
          nameUpper.includes('VILLA') ||
          nameUpper.includes('CABANA') ||
          (p.attributes && p.attributes.photos && p.attributes.photos.length > 0)
        );
      });

      if (villaProducts.length === 0) {
        return [];
      }

      // Transform raw API products into Villa models
      const mappedVillas: Villa[] = villaProducts.map((p: CatalogueProduct) => {
        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const photos = p.attributes?.photos || [];

        const heroImage = photos.length > 0 ? photos[0] : '/assets/img/cards/rooms/2/oakwood-villa.jpg';
        const galleryImages = photos.length > 0 ? photos : [heroImage];

        // Format rooms/baths/guests strings
        const roomsCount = p.attributes?.no_of_rooms || '4';
        const bathsCount = p.attributes?.no_of_bathrooms || '4';
        const maxGuests = p.attributes?.guests_allowed || 8;

        const isCabana = slug.includes('cabana');
        const bedrooms = isCabana
          ? `${roomsCount} BEDROOM W/ PRIVATE POOL`
          : `${roomsCount} BEDROOMS`;
        const bathrooms = `${bathsCount} BATHROOMS`;
        const guests = `${maxGuests} GUESTS & MORE`;

        // Price calculations from primary offering
        const primaryOffering = p.offerings && p.offerings.length > 0 ? p.offerings[0] : null;
        const pricePerNight = primaryOffering
          ? Math.round(primaryOffering.priceCents / 100)
          : (isCabana ? 8000 : 18000);

        const securityDeposit = primaryOffering
          ? Math.round(primaryOffering.depositCents / 100)
          : (isCabana ? 3000 : 10000);

        // Features & Amenities
        const apiAmenities = p.attributes?.amenities || [];
        const featuresMap: Record<string, string> = {
          'wi-fi': 'High-Speed Wi-Fi & Smart TV',
          swimming_pool: 'Private Swimming Pool',
          air_conditioner: 'Air Conditioned Bedrooms',
        };

        const mappedFeatures = apiAmenities
          .map((a) => featuresMap[a.toLowerCase()] || a)
          .filter(Boolean);

        const features =
          mappedFeatures.length > 0
            ? mappedFeatures
            : [
              'Private Swimming Pool',
              'Spacious Open Living Room',
              'Air Conditioned Bedrooms',
              'Landscaped Garden & Lawn',
              'High-Speed Wi-Fi & Smart TV',
              'In-Villa Dining & Kitchen Access',
            ];

        // Subtitle & description
        const titleFormatted = p.name
          .toLowerCase()
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        const subtitle = (isCabana ? 'Intimate Stay with Private Pool' : 'Spacious Four-Bedroom Group Stay');
        const description = p.description || '';

        return {
          id: p.id || slug,
          slug,
          name: titleFormatted,
          subtitle,
          description,
          bedrooms,
          bathrooms,
          guests,
          maxGuests: Number(maxGuests) || 8,
          pricePerNight,
          securityDeposit,
          cleaningFee: 2000,
          heroImage,
          galleryImages,
          features,
          bookingUrl: 'https://tinyurl.com/4hu2asv5',
        };
      });

      // Update cache
      villasCache = mappedVillas;
      lastFetchTime = Date.now();
      try {
        localStorage.setItem('wv_villas_cache', JSON.stringify(mappedVillas));
      } catch (e) {
        // ignore localStorage quota errors
      }

      return mappedVillas;
    } catch (error) {
      console.warn('Failed to fetch dynamic catalogue API, using fallback data:', error);

      // Try localStorage cache first before hardcoded fallback
      try {
        const cachedStr = localStorage.getItem('wv_villas_cache');
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        // ignore
      }

      return [];
    }
  },
};
