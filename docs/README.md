# Woodland River Villas — Project Documentation & Context Hub

Welcome to the central documentation repository for **Woodland River Villas** (Alibaug). This directory contains systematically organized architectural, technical, and UI/UX documentation for developers and AI coding assistants (Antigravity, AGY, Gemini, Cursor).

---

## 📚 Documentation Sitemap

| Document | Description |
| :--- | :--- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical stack, project layout, routing, CSS design system, and animation mechanics. |
| [API_INTEGRATION.md](./API_INTEGRATION.md) | Amigo Market Hub Catalogue API endpoints, headers, data transformation, and caching rules. |
| [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) | React Context (`VillaContext`), dynamic state, and animation synchronization post-API load. |
| [UI_UX_DESIGN_SYSTEM.md](./UI_UX_DESIGN_SYSTEM.md) | SaffronStays-inspired Villa Details layout, bento photo grids, sticky cards, and resort styling. |
| [DEVELOPMENT_GUIDELINES.md](./DEVELOPMENT_GUIDELINES.md) | Instructions for team members & AI agents on maintaining code quality, linting, and updating docs. |

---

## 🔄 Rules for Team Members & AI Assistants

1. **Automatic Context Consumption**: Every developer or AI agent working on this codebase MUST read the documentation in `docs/` before making structural or API modifications.
2. **Continuous Documentation Updates**: Whenever you modify an API service, state model, route, or UI component structure, **you MUST update the relevant file inside `docs/`**.
3. **No Hardware-coded Fallbacks**: All villa data MUST be fetched dynamically from the Catalogue API. Do not re-introduce static mock fallbacks.
4. **Animation Post-Load Rule**: All page animations (`ScrollMagic`, `GSAP`, `Swiper`, line-splits) MUST trigger AFTER dynamic API data finishes loading into the DOM.

---

## 🚀 Quick Command Reference

```bash
# Start local development server
npm run dev

# Run TypeScript typechecks
npm run lint

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```
