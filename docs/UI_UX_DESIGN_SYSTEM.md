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
