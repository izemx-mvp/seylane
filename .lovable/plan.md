## Rebrand & Overhaul — Seylane AI Backoffice

Full visual rebrand to match seylane.com (deep navy + cyan accent, clean typography, their white logo) and a functional refactor of every module per your notes.

### 1. Brand & Design System
- Pull Seylane logo from `https://www.seylane.com/_next/image?url=%2FLOGO%2520SEYLANE%2520-%2520BLANC_.png` (transparent white version) — used as-is in the sidebar over navy.
- Replace navy/gold tokens in `src/styles.css` with Seylane palette: deep navy `#0B1E3F`, cyan accent `#22D3EE`-like turquoise from their logo, soft white `#F5F7FA`, muted slate text. Update gradients, glass-card, focus rings, chart palette.
- Typography: sans-serif close to their site (Inter/Manrope), tighter tracking on headings.
- Global polish: refined shadows, subtle motion (fade/slide on route change, hover lifts on cards/rows, animated KPI counters, skeleton loaders), consistent rounded-xl, redesigned buttons with clear primary/secondary/ghost variants, redesigned tables (sticky header, zebra, hover, row actions), redesigned modals/sheets.

### 2. Dashboard — Minimalist
Strip to only what matters:
- 4 KPI tiles: Idées publiées ce mois, Prospects actifs, Candidats sourcés, Campagnes HuntTool en cours.
- One trend chart (content + prospects, 30 days).
- Latest activity feed (5 rows).
Remove everything else.

### 3. Community Manager
**Configuration tab** — keep only: Objectifs, Logo d'entreprise (upload), and a per-platform block for **LinkedIn**, **Instagram**, **Site Web**, each with its own Tonalité + Fréquence. Save persists to store.

**Idées tab** — image-only generation (remove video toggle & video scripting). Full CRUD: create, edit, duplicate, delete, regenerate image, approve, schedule.

**"Nouveau" flow** — reduced to 2 steps:
1. Configuration (platform, objectif, prompt/angle, tonalité prefilled from config)
2. Preview (editable text + image, regenerate, then choose: **Publier maintenant** or **Planifier** with date + heure picker)

**Calendrier tab** — click any scheduled idea to edit day/time or publish now.

### 4. Prospection — Table view
- Remove Kanban; single sortable/filterable table (Nom, Société, Source, Score IA, Statut, Dernière activité, Actions).
- Row click → side sheet with full lead detail, notes, timeline, status change, convert to campaign.
- Working CRUD (add, edit, delete, bulk status change).

### 5. Sourcing
- Each "Recherche" is tied to a **specific post/offre** for a **specific client** (fields: client, poste, critères).
- List of recherches as cards/rows; click → detail page showing the brief + ranked candidates with score breakdown, actions (shortlist, reject, push to HuntTool).

### 6. HuntTool CRM
- Convert to table (Candidat, Poste lié, Canal, Étape, Dernière réponse, Classification IA, Actions).
- **Remove "Nouvelle campagne"** — campaigns are auto-created when an offer is sent from Sourcing/Prospection; show a subtle banner "Détecté automatiquement depuis HuntTool" on new rows.
- Row detail: full conversation timeline + AI classification (Intéressé / Refusé / Ambigu) with manual override.

### 7. Base de connaissances
- **Remove Simulateur IA / Chatbot** section entirely.
- Keep FAQ + Fiches services with clean CRUD table + editor.

### 8. Global button/CRUD audit
Every button on every screen wired to real actions on the local store, with toast confirmation, optimistic updates, and undo where relevant. Empty states, loading states, and destructive confirms everywhere.

### Technical notes
- All work stays in frontend + `src/lib/store.tsx` + `src/lib/mock-data.ts`. No backend.
- Logo used via `<img src="https://www.seylane.com/_next/image?url=%2FLOGO%2520SEYLANE%2520-%2520BLANC_.png&w=384&q=75" />` on navy background (transparent PNG, no white box).
- New reusable primitives: `DataTable`, `DetailSheet`, `StepperTwo`, `DateTimePicker`, `PlatformToneCard`.
- Framer-motion for route/list transitions; keep bundle lean.

### Files to touch
- `src/styles.css` (tokens, palette, motion utilities)
- `src/components/app-shell.tsx` (logo, nav polish)
- `src/components/data-table.tsx`, `src/components/detail-sheet.tsx`, `src/components/datetime-picker.tsx` (new)
- `src/routes/index.tsx` (minimalist dashboard)
- `src/routes/community-manager.tsx` (config restructure, 2-step wizard, image-only, calendar edit)
- `src/routes/prospection.tsx` (table + sheet)
- `src/routes/sourcing.tsx` (recherche-per-poste, detail)
- `src/routes/hunttool.tsx` (table, auto-campaign, remove new-campaign CTA)
- `src/routes/knowledge.tsx` (remove chatbot simulator)
- `src/lib/store.tsx`, `src/lib/mock-data.ts` (schema updates: platform-scoped tone/freq, recherche→client/poste link, auto campaign origin)
