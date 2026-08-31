# Dynamic State Management & Animation Synchronization

## 🧠 VillaContext Provider (`src/context/VillaContext.tsx`)

Application state for villa catalogue items is provided globally by `VillaProvider` and consumed via the `useVillas()` hook.

```tsx
interface VillaContextType {
  villas: Villa[];
  loading: boolean;
  error: string | null;
  refetchVillas: () => Promise<void>;
  getVillaById: (id: string) => Villa | undefined;
  getVillaBySlug: (slug: string) => Villa | undefined;
}
```

---

## 🔑 AuthContext Provider (`src/context/AuthContext.tsx`)

User authentication state is managed globally by `AuthProvider` and consumed via the `useAuth()` hook.

```tsx
interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  checkEmail: (email: string) => Promise<{ exists: boolean; message?: string }>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
}
```

- **Session Persistence**: User token (`token`) and profile data (`user`) are saved in `localStorage` (`wv_auth_token` and `wv_auth_user`).

---

## 📅 Catalogue Date Filtering & URL State (`src/pages/CataloguePage.tsx`)

Catalogue page supports real-time check-in and check-out date filtering with URL state persistence.

```tsx
// URL Query Parameter Sync: /catalogue?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
const [searchParams, setSearchParams] = useSearchParams();

const [startDate, setStartDate] = useState(searchParams.get('checkIn') || '');
const [endDate, setEndDate] = useState(searchParams.get('checkOut') || '');
const [showAvailableOnly, setShowAvailableOnly] = useState(true);
const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({});
```

- **Nights Stay Computation**: Calculated as $\text{Math.ceil}(\frac{t_{\text{end}} - t_{\text{start}}}{86400000})$.
- **Concurrent API Evaluation**: Calls `coreApiService.checkAvailability()` in parallel for all villas using `Promise.all`.
- **Total Stay Pricing**: Calculates $\text{Nights} \times \text{pricePerNight}$ live on villa cards.

---

## 🛒 Checkout State & Payment Flow (`src/pages/CheckoutPage.tsx`)

The checkout page manages end-to-end reservation state in a 2-Column Split layout:

```tsx
interface CheckoutState {
  startDate: string;
  endDate: string;
  villa: Villa;
  guests: number;
  selectedAddons: { id: string; quantity: number }[];
  paymentMode: 'FULL' | 'ADVANCE';
}
```

- **Add-On Customization**: Toggles and counters update `selectedAddons` state and recalculates total stay package live via `coreApiService.calculatePricing()`.
- **Payment Schedule Options**: Supports 100% Full Payment (`FULL`) vs 50% Advance Rental Deposit (`ADVANCE`).
- **Razorpay Integration**: Initiates `openRazorpayCheckout` with prefilled user credentials and calls `coreApiService.confirmBookingPayment` on success.
- **Express Mock Checkout**: Allows test verification using `pay_mock_` timestamp tokens.

---

## 🧾 Booking Details In-Page Ledger Refresh Protocol (`src/pages/BookingDetailsPage.tsx`)

The Booking Details page updates financial ledger transactions asynchronously without page reloads:

- **Payment Logging**: Payments processed for room balance or refundable security deposit execute `coreApiService.confirmBookingPayment(booking.id, referenceId, 'RAZORPAY', amountCents, depositCents)` directly against the specific booking ID.
- **In-Page Asynchronous Refetch**: Instead of triggering `window.location.reload()`, payment handlers invoke `await fetchBookingDetails(false)` to pull updated booking records and transaction ledgers directly from Amigo Market Hub API.
- **Dynamic Ledger State & Itemized History**: Processes all transaction entries from `metadata.paymentHistory` directly into a list array with formatted payment timestamp (`DATE & TIME` column formatted via `formatPaymentDateTime`). This ensures every transaction entry line by line is preserved and rendered in the Recorded Payment History table with exact reference IDs and payment timestamps. Updates `booking`, `paymentCents`, `remainingBalance`, `lineItems`, and transaction log table seamlessly with active notification toast confirmation.

---

## ⚡ Animation Synchronization Protocol

Because villa elements are rendered dynamically after the API call finishes or dates filter changes, page animations (`ScrollMagic` triggers, GSAP timelines, Swiper carousels) MUST be synchronized with the completion of data loading and filtering.

### Implementation Protocol:
```tsx
useEffect(() => {
  if (!loading && villas.length > 0) {
    const timer = setTimeout(() => {
      if (typeof (window as any).initApp === 'function') {
        (window as any).initApp();
      }
    }, 150);
    return () => clearTimeout(timer);
  }
}, [loading, villas.length, filteredVillas.length]);
```

