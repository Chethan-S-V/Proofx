# Repositories

Owns Repository Platform V1: CRUD, visibility, README, search, stars, watchers, bookmarks, forks, members, analytics, and activity.

Phase 0 architecture boundaries:

- `repository.service.ts`: repository application service facade
- `repository-permissions.service.ts`: repository permission rules
- `repository-storage.service.ts`: repository storage path conventions
- `../source-control`: shared source-control contracts
- `../branches`: branch contracts
- `../commits`: commit contracts

Keep Git-platform features modular. Later phases should extend the owning feature module instead of expanding this module into a monolith.
