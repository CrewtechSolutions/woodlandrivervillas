# Catalogue API Integration Specification

## 🌐 Endpoint Details

- **Base URL**: `https://api.amigomarkethub.com/api/public/v1/catalogue`
- **HTTP Method**: `GET`
- **Required Header**: `x-api-key: mk_8ea1437b92745ed3576ef6773956e5054b817afc9c33e75ee87af6863c219399`

---

## 🔒 Environment Variable Setup

The API configuration is loaded from `.env`:

```env
VITE_CATALOGUE_API_URL=https://api.amigomarkethub.com/api/public/v1/catalogue
VITE_CATALOGUE_API_KEY=mk_8ea1437b92745ed3576ef6773956e5054b817afc9c33e75ee87af6863c219399
```

---

## 🔄 API Service Layer (`src/services/apiService.ts`)

The `catalogueApiService` object executes HTTP requests to Amigo Market Hub and maps raw catalogue items into standard `Villa` domain objects.

### Data Mapping Rules:
1. **Products Filtering**: Only items with type `PRODUCT` or matching villa/cabana names are processed.
2. **Slug Generation**: Generated dynamically from product name (e.g. `"OAKWOOD VILLA"` → `"oakwood-villa"`).
3. **Photo Asset URLs**: Extracted from `attributes.photos` array (`https://assets.crowninnhotel.in/...`).
4. **Room & Guest Specs**:
   - `attributes.no_of_rooms` → `bedrooms` (e.g. `'4 BEDROOMS'` or `'1 BEDROOM W/ PRIVATE POOL'`)
   - `attributes.no_of_bathrooms` → `bathrooms` (e.g. `'5 BATHROOMS'` or `'1 BATHROOM'`)
   - `attributes.guests_allowed` → `maxGuests` / `guests` (e.g. `'8 GUESTS & MORE'`)
5. **Pricing & Deposits**:
   - `offerings[0].priceCents` / 100 → `pricePerNight`
   - `offerings[0].depositCents` / 100 → `securityDeposit`
6. **Caching**: Response is cached in `localStorage` (`wv_villas_cache`) for instant load on repeat visits.

---

## ⚠️ Pure Dynamic Rule
No static fallback mocks exist. If the API call fails or returns empty data, the system returns an empty array `[]` and reports the error via `VillaContext`.
