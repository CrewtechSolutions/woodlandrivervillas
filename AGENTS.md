# AGENTS.md — Repository Rule & Context Directive

All AI coding assistants (AGY, Antigravity, Gemini, Cursor) working on this project MUST automatically read and adhere to the project documentation system in the `docs/` directory:

1. [docs/README.md](file:///Users/vivek/Documents/GitHub/woodlandrivervillas/docs/README.md) - Context Hub Overview
2. [docs/ARCHITECTURE.md](file:///Users/vivek/Documents/GitHub/woodlandrivervillas/docs/ARCHITECTURE.md) - Architecture & Animations
3. [docs/API_INTEGRATION.md](file:///Users/vivek/Documents/GitHub/woodlandrivervillas/docs/API_INTEGRATION.md) - Catalogue API Specifications
4. [docs/STATE_MANAGEMENT.md](file:///Users/vivek/Documents/GitHub/woodlandrivervillas/docs/STATE_MANAGEMENT.md) - State & Animation Synchronization
5. [docs/UI_UX_DESIGN_SYSTEM.md](file:///Users/vivek/Documents/GitHub/woodlandrivervillas/docs/UI_UX_DESIGN_SYSTEM.md) - SaffronStays UI System
6. [docs/DEVELOPMENT_GUIDELINES.md](file:///Users/vivek/Documents/GitHub/woodlandrivervillas/docs/DEVELOPMENT_GUIDELINES.md) - Team Guidelines

### Mandatory Rules
- Automatically consume context from `docs/` on every task.
- Automatically update `docs/` whenever adding features, modifying state, or changing API models.
- All villa data MUST be dynamic from Amigo Market Hub API (`apiService.ts`).
- Animations MUST be triggered via `window.initApp()` AFTER dynamic data finishes loading into the DOM.
