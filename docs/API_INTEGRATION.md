# Catalogue, Auth & My Bookings API Integration Specification

## 🌐 Endpoint Details

- **Catalogue Base URL**: `https://api.amigomarkethub.com/api/public/v1/catalogue`
- **Auth Base URL**: `https://api.amigomarkethub.com/api/public/v1/auth`
- **My Bookings Endpoint**: `https://api.amigomarkethub.com/api/public/v1/my-bookings`
- **Required Headers**:
  - `x-api-key: mk_8ea1437b92745ed3576ef6773956e5054b817afc9c33e75ee87af6863c219399`
  - `Authorization: Bearer <token>` (for authenticated user session calls)

---

## 🔒 Environment Variable Setup

The API configuration is loaded from `.env`:

```env
VITE_BASE_URL=https://api.amigomarkethub.com/api/public/v1
VITE_CATALOGUE_API_URL=https://api.amigomarkethub.com/api/public/v1/catalogue
VITE_CATALOGUE_API_KEY=mk_8ea1437b92745ed3576ef6773956e5054b817afc9c33e75ee87af6863c219399
```

---

## 🔄 API Service Layer (`src/services/apiService.ts`)

### 1. Catalogue Service (`catalogueApiService`)
Maps raw catalogue items into standard `Villa` domain objects.
- **Products Filtering**: Only active items matching villa/cabana patterns are processed.
- **Photo Assets**: Extracted from `attributes.photos`.
- **Pricing & Deposits**: Calculated from primary `offerings[0]`.

### 2. Auth Service (`authApiService`)
Handles guest authentication and account management:
- `checkEmail(email)`: `POST /auth/check-email` with `{ email }`. Returns `{ exists: boolean }`.
- `login({ email, password })`: `POST /auth/login` with `{ email, password }`. Returns `{ token, user }`.
- `register({ name, email, password, phone })`: `POST /auth/register` with `{ name, email, password, phone }`. Returns `{ token, user }`.

### 3. Booking Service (`bookingApiService`)
Handles reservation management:
- `getMyBookings(token?)`: `GET /my-bookings`. Returns array of `Booking` objects containing booking code, villa name, check-in, check-out dates, guest counts, pricing, and status.

---

## ⚠️ Pure Dynamic Rule
No static fallback mocks exist. All dynamic villa, auth, and reservation data is fetched live from API integration.
