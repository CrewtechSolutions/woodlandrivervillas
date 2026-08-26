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

## ⚡ Animation Synchronization Protocol

Because villa elements are rendered dynamically after the API call finishes, page animations (`ScrollMagic` triggers, GSAP timelines, Swiper carousels) MUST be synchronized with the completion of data loading.

### Implementation Protocol:
```tsx
useEffect(() => {
  if (!loading && villas.length > 0) {
    const timer = setTimeout(() => {
      if (typeof (window as any).initApp === 'function') {
        (window as any).initApp();
      }
    }, 120);
    return () => clearTimeout(timer);
  }
}, [loading, villas.length]);
```

### Why This Sequence is Critical:
1. When `loading === true`, React renders initial loading states.
2. When API data arrives, `setLoading(false)` causes React to commit new `.roomCard`, `.swiper-slide`, and section containers into the DOM.
3. The 120ms timeout ensures DOM layout calculations are finalized before `window.initApp()` invokes `RevealAnim.init()`, preventing 0-height element measurement bugs.
