# Development Guidelines & Team Workflow

## 📝 Rules for Team Members & AI Assistants

1. **Context First**: Always consult the files in `docs/` before making code modifications or adding features.
2. **Synchronous Documentation Maintenance**: Any change to API structure, React Context, state, or component hierarchy MUST be documented back into `docs/`.
3. **No Unverified Success**: Always run `npm run lint` and `npm run build` to verify code changes compile without errors.
4. **Dynamic Data Principle**: All villa content must be rendered from `useVillas()`. Do not re-introduce static mock data arrays.

---

## 🛠️ Common Commands

```bash
# Verify TypeScript types
npm run lint

# Compile production bundle
npm run build
```
