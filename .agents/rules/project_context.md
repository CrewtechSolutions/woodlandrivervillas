# Project Context & Documentation Rules

> **MANDATORY INSTRUCTION FOR ALL AI AGENTS & DEVELOPERS**

Whenever initializing a turn or processing a user prompt in this repository:

1. **AUTOMATICALLY READ SYSTEM DOCS**: Before writing code or answering structural questions, review the files in [`docs/`](file:///Users/vivek/Documents/GitHub/woodlandrivervillas/docs/):
   - [`docs/README.md`](file:///Users/vivek/Documents/GitHub/woodlandrivervillas/docs/README.md)
   - [`docs/ARCHITECTURE.md`](file:///Users/vivek/Documents/GitHub/woodlandrivervillas/docs/ARCHITECTURE.md)
   - [`docs/API_INTEGRATION.md`](file:///Users/vivek/Documents/GitHub/woodlandrivervillas/docs/API_INTEGRATION.md)
   - [`docs/STATE_MANAGEMENT.md`](file:///Users/vivek/Documents/GitHub/woodlandrivervillas/docs/STATE_MANAGEMENT.md)
   - [`docs/UI_UX_DESIGN_SYSTEM.md`](file:///Users/vivek/Documents/GitHub/woodlandrivervillas/docs/UI_UX_DESIGN_SYSTEM.md)
   - [`docs/DEVELOPMENT_GUIDELINES.md`](file:///Users/vivek/Documents/GitHub/woodlandrivervillas/docs/DEVELOPMENT_GUIDELINES.md)

2. **AUTOMATICALLY KEEP DOCS UPDATED**: Whenever you add new features, refactor components, or update state/API services, update the corresponding markdown documentation in `docs/` to maintain a single source of truth.

3. **STRICT DYNAMIC DATA POLICY**: All villa information MUST be fetched dynamically from the Amigo Market Hub Catalogue API (`apiService.ts`). Never add hardcoded fallback arrays.

4. **ANIMATION POST-LOAD SYNCHRONIZATION**: All GSAP/ScrollMagic animations and Swiper sliders must be initialized via `window.initApp()` only AFTER dynamic API data finishes loading into the DOM.
