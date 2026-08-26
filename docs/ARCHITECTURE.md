# Project Architecture & System Overview

## 🛠️ Technology Stack

- **Framework / Bundler**: React 18 + Vite 5 + TypeScript 5
- **Routing**: React Router DOM v6
- **SEO & Meta Management**: React Helmet Async (`SEO.tsx` component)
- **Styling & CSS System**: Vanilla CSS tokens + Template utility classes (`public/assets/css/` & `src/assets/custom.css`)
- **Animation Framework**:
  - GSAP (GreenSock Animation Platform) + ScrollTrigger
  - ScrollMagic (`App.SMcontroller`)
  - Swiper 11 (Sliders & Carousels)
  - Custom line-splitting (`splitTextIntoLines()`)

---

## 📁 Repository Directory Layout

```
woodlandrivervillas/
├── .agents/
│   └── rules/
│       └── project_context.md       # AI & Developer project instruction rules
├── AGENTS.md                         # AGY project context root rule
├── .env                              # Environment variables (API URL & Key)
├── .env.example                      # Template for env variables
├── docs/                             # System Documentation Hub
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── API_INTEGRATION.md
│   ├── STATE_MANAGEMENT.md
│   ├── UI_UX_DESIGN_SYSTEM.md
│   └── DEVELOPMENT_GUIDELINES.md
├── public/
│   └── assets/                       # Static vendor scripts (main.js), CSS & images
├── src/
│   ├── assets/                       # Custom CSS overrides
│   ├── components/
│   │   ├── common/                   # SEO, ImageModal, PageHero, BookingCTA
│   │   ├── layout/                   # Header, NavigationMenu, Footer, Layout
│   │   └── sections/                 # VillaGrid, VillaWorldSlider, AboutSection, etc.
│   ├── context/
│   │   └── VillaContext.tsx          # Dynamic Villa Context Provider & Hook
│   ├── data/
│   │   ├── siteConfig.ts             # Contact details, phone numbers, social links
│   │   └── villasData.ts             # Villa interface definitions
│   ├── pages/
│   │   ├── HomePage.tsx              # Landing Page
│   │   ├── VillasPage.tsx            # Our Villas List Page
│   │   ├── VillaDetailPage.tsx       # Dynamic SaffronStays-Style Villa Details Page
│   │   ├── AboutPage.tsx             # About Us Page
│   │   └── ContactPage.tsx           # Contact Page
│   ├── services/
│   │   └── apiService.ts             # Amigo Market Hub API Catalogue Client
│   ├── types/
│   │   └── index.ts                  # Core TypeScript Data Interfaces
│   ├── App.tsx                       # Main Application Entry & Routes
│   └── main.tsx                      # React DOM Root
```

---

## 🎬 Animation & Reveal Engine (`main.js`)

Page reveal animations and Swiper sliders are initialized via `window.initApp()` in `public/assets/js/main.js`.

### Key Animation Behaviors:
1. **Debounced Execution**: `window.initApp()` is debounced by 60ms to prevent duplicate calls.
2. **ScrollMagic Controller**: Re-registers `App.SMcontroller = new ScrollMagic.Controller()` upon route navigation or data refresh.
3. **Split Text Protection**: `splitTextIntoLines()` prevents recursive line splitting by checking `if (el.querySelector('.split__line')) return;`.
4. **Post-Load Hook**: Must be triggered ONLY AFTER dynamic API data is rendered into the DOM.
