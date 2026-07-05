- [x] Implement CSS variable theme overrides for saved theme values (dark-midnight/graphite/emerald/crimson/violet, light-paper/sky/mint/rose/sand) in `app/globals.css`.
- [x] Read user saved theme on the server and apply it via root wrapper (`data-theme`) in `app/(dashboard)/layout.tsx` so the whole dashboard updates.
- [ ] Ensure public routes also apply the saved theme (needs similar server-side wrapper at top-level).

- [ ] If needed, add a small client-side fallback to avoid flicker on first load.
- [ ] Verify Settings page theme radios immediately affect UI colors (no refresh / minimal flicker) across dashboard + public routes.



