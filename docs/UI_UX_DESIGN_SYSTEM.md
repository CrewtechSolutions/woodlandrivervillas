# UI/UX & SaffronStays Design System Specification

## 🎨 Aesthetic & Brand Pillars

Woodland River Villas features a luxury resort aesthetic drawing direct inspiration from premium hospitality portals like **SaffronStays**.

- **Primary Accent**: Gold / Bronze (`#e5c158` / `text-accent-1`)
- **Dark Neutral**: Deep Charcoal (`#122223` / `bg-dark-1`, `bg-dark-2`)
- **Light Neutral**: Warm Off-White / Alabaster (`#F7F7F6` / `bg-light-1`)
- **Action Highlight**: Emerald Green (`bg-emerald-50 text-emerald-800` for WhatsApp)

---

## 🏰 Villa Details Page Structure (`VillaDetailPage.tsx`)

The Villa Details page uses a SaffronStays layout structure:

1. **3-Column Bento Photo Showcase**:
   - Left 66% width: 1 Large Hero Featured Photo (`ratio 16:10 rounded-20`).
   - Right 33% width: 2 Stacked Grid Photos (`ratio 4:3 rounded-20`) with a `"+{total - 3} More Photos"` dark gradient overlay.
   - Floating `"All Photos ({total})"` pill button triggering the Lightbox modal.

2. **Sticky Sub-Header Navigation Tab Bar**:
   - Floating sticky navigation bar (`top: 70px`, `bg-white/95 backdrop-blur border-y-light`).
   - Jump tabs: `Overview`, `Highlights`, `Meals & Dining`, `Amenities`, `Location & Reach`, `Stay Guidelines`.

3. **SaffronStays Quick Highlights Pill Row**:
   - Icon pills for Bedrooms, Bathrooms, Guest Capacity, Swimming Pool, Lawn, and Pet-Friendly policy.

4. **SaffronStays Floating Booking Card**:
   - Sticky card (`position: sticky`, `top: 130px`):
   - Price per night (`₹18,000 / night + taxes`), refundable deposit breakdown (`₹10,000 Deposit`), primary gold CTA (`UNLOCK OFFER / BOOK NOW`), and WhatsApp concierge button (`bg-emerald-50 text-emerald-800 border-1 border-emerald-200`).

5. **Full Lightbox Photo Gallery Modal**:
   - Interactive Lightbox (`ImageModal.tsx`) with slideshow prev/next navigation and keyboard arrow listeners.

---

## 🧾 Booking Details Page Structure (`BookingDetailsPage.tsx`)

The redesigned Booking Details page features an ultra-luxury SaffronStays resort visual layout powered by [`src/styles/bookingDetails.css`](file:///Users/vivek/Documents/GitHub/woodlandrivervillas/src/styles/bookingDetails.css):

1. **Header-Matched Hero Banner & Responsive Luxury Breadcrumb Bar**:
   - Clean background banner matching site header height (`height: 120px`, `minHeight: 120px`) acting as a top spacer for the fixed header navbar.
   - Integrated **Responsive Luxury Breadcrumb Bar** (`HOME` › `MY ACCOUNT` › `MY RESERVATIONS` › `BOOKING #REF`) with flex-wrapping, mobile font scaling (11px), truncated ellipsis for long active items, and primary gold SVG **Download Invoice** button (`.btn-download-invoice-luxury`).
   - Clicking **`MY RESERVATIONS`** directly navigates to `/account?tab=bookings` with location state `{ tab: 'bookings' }` to ensure the Reservations tab stays active upon return.

2. **Top Section — Stay Details (Bento Grid)**:
   - Full-width card (`.bd-card`) with high contrast serif titles (`Cinzel`) and explicit inline vector SVGs for all icons (no missing font icons).
   - **4 Bento Cards**: Check-in (`Sat, 12 Sept 2026`, `From 2:00 PM`), Check-out (`Mon, 14 Sept 2026`, `By 11:00 AM`), Guests & Duration (`8 Guests`, `2 Night(s) Stay`), Villa Reserved (`Oakwood Villa`, `Luxury Private Pool Villa`).
   - Dedicated Resort Location box and Selected Add-ons grid with quantity pills.

3. **Bottom Section — Payment Summary & Ledger**:
   - Status badge overlay (`FULLY SETTLED` or `BALANCE DUE: ₹X`).
   - Paid vs payable visual progress bar (`TOTAL PAID: ₹81,200` in emerald green vs `TOTAL PAYABLE: ₹81,200`).
   - **Itemized Payment Ledger**: Dark charcoal header (`.bd-ledger-header`), base price per night, line items for add-ons/charges, subtotal bar, and highlighted refundable security deposit box with terms and status pill.
   - **Payment History Ledger**: Recorded transactions table with payment gateway, reference code, status, and paid amounts.
   - **Outstanding Balance & Payment Action**: Display net outstanding balance (`NET OUTSTANDING BALANCE`) with **one single primary CTA button** to pay the total pending amount (`PAY PENDING AMOUNT (₹X)`). When fully settled, displays a green `RESERVATION FULLY PAID` status pill.
   - **Lazy Loading Image System (`LazyImage.tsx`)**: Applied across villa overview detail pages (`VillaDetailPage.tsx`), catalogue cards (`CatalogueVillaCard.tsx`), and photo gallery pages (`GalleryPage.tsx`) with authentic blurred image preview (`filter: blur(16px)` + `transform: scale(1.15)`) and smooth `0.5s` opacity transition. Preserves original template native image tags on ratio card listings (`VillasPage.tsx`, `VillaCard.tsx`) to guarantee pixel-perfect layout alignment.

