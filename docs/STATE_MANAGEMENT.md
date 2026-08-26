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
