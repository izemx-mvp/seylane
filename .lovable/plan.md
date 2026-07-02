
## Big overhaul — Seylane AI Backoffice

Frontend-only. All state stays in `src/lib/store.tsx` + `src/lib/mock-data.ts`. No backend.

### 1. Global redesign & UX fixes
- Bigger Seylane logo in sidebar (h-16 → h-24, more breathing room).
- Refreshed background: animated aurora + subtle grid, softer glass cards, refined shadows, better hover states, smoother route transitions.
- Fix modal scroll: every Dialog/Sheet gets `max-h-[85vh]` + internal `overflow-y-auto` body so long forms scroll cleanly. Sticky headers/footers inside dialogs.
- New reusable `Pagination` component (10/25/50 per page) wired into every list: Community Manager (Idées, Calendrier list view), Prospection, Sourcing (recherches + candidats), HuntTool CRM (contacts), Base de Connaissances (FAQ, documents, contacts).
- Search + filter bars unified.

### 2. Sidebar reordering & renaming
- New order: Dashboard → **Gestion des utilisateurs** → AI Community Manager → **Agent IA Prospection** (was "Prospection") → Agent IA de Sourcing → **Agent IA Relance HuntTool** (was "HuntTool CRM") → Base de Connaissances.
- Header titles updated to match.

### 3. Gestion des utilisateurs (new interface, 2nd in sidebar)
- Table: Nom, Email, Rôle (Admin / Collaborateur), Statut, Dernière connexion, Actions.
- CRUD: add, edit, delete, activate/deactivate. Toast confirmations.
- Role = **Admin**: full access, no permission grid.
- Role = **Collaborateur**: matrix of permissions per interface (all sidebar entries EXCEPT Dashboard and Gestion des utilisateurs). For each interface: `read`, `add`, `update`, `delete`.
  - UI rule: `add` / `update` / `delete` are disabled unless `read` is checked. Toggling `read` off clears the other three.
- Persist "current user" in store; sidebar hides interfaces where `read=false`. Admin sees everything.
- Route buttons (Add / Edit / Delete) auto-disable when permission is missing.

### 4. AI Community Manager
- **Configuration tab**: add a **Services** field (multi-tag input) alongside Objectifs and Logo, so generated content references the client's services.
- **Nouveau post** flow: media block now supports drag-to-reorder for images AND videos (native HTML5 drag or `@dnd-kit/sortable`).
- **Calendrier tab**: view switcher **Mois / Semaine / Jour / Agenda**. Each event chip shows the small platform logo (LinkedIn, Instagram, Site Web). Agenda = paginated chronological list.

### 5. Agent IA Prospection (renamed)
- Sidebar + header label updated. Pagination added to the leads table.

### 6. Agent IA de Sourcing
- Pagination on recherches list and ranked candidates list.

### 7. Agent IA Relance HuntTool (renamed)
- **Configuration tab** additions:
  - Number of relances
  - **Days to wait after the initial offer is sent** (new field)
  - Delay between relances
  - Allowed days + time windows (already present, refined)
- **Contacts tab**: when AI classification is "Ambigu", show an **"Assigner à un agent humain"** action → opens dropdown of users (Admins + Collabs with HuntTool `update` right). Once assigned:
  - Row badge "Pris en charge par …".
  - Detail sheet lets the human continue the conversation (add message, receive mock reply) inside HuntTool.
  - Closing conversation forces a final classification: **Intéressé** or **Refusé** (Ambigu no longer allowed at close).
- Pagination on contacts.

### 8. Base de Connaissances (wire up CRUD properly)
- **FAQ**: add / modify / delete already work — keep, add pagination.
- **Fiches services**: convert from static array to store-backed CRUD (add / edit / delete) via modal. **No image field.** Fields: brand, tag, description, benefits (list).
- **Documents**: real upload (FileReader → base64 stored in-memory), download (Blob), delete. Pagination.
- **Contacts**: add / update / delete via modal. Pagination.

### 9. Files touched
- `src/lib/store.tsx`, `src/lib/mock-data.ts` — users, permissions, currentUserId, humanAssignments on hunttool contacts, services array on CM config, `serviceFiches` state, real document blobs.
- `src/components/app-shell.tsx` — bigger logo, reordered nav, permission-based filtering.
- `src/components/pagination.tsx` (new), `src/components/permission-guard.tsx` (new), `src/components/sortable-media.tsx` (new).
- `src/routes/users.tsx` (new).
- `src/routes/community-manager.tsx` — Services field, drag reorder, calendar views.
- `src/routes/prospection.tsx` — rename + pagination.
- `src/routes/sourcing.tsx` — pagination.
- `src/routes/hunttool.tsx` — rename + config field + human handoff + pagination.
- `src/routes/knowledge.tsx` — services CRUD, documents upload/download, contacts CRUD, pagination.
- `src/styles.css` — background, shadows, dialog scroll utilities, animations.

### Technical notes
- Drag-and-drop: use `@dnd-kit/core` + `@dnd-kit/sortable` (small, already React 19 compatible). Install via bun.
- Permission gating: a `usePermission(interfaceId, action)` hook reading current user from store.
- All destructive actions keep AlertDialog confirms. All list actions show toasts.
