# Changelog

All notable changes to this project are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/);
versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] — 2026-05-25

### Added

- **TypeScript migration** — all frontend and backend source files converted from JavaScript to TypeScript with `strict: true`, `noImplicitReturns: true`, and `noFallthroughCasesInSwitch: true`.
- **`src/` architecture** — code reorganised into purpose-based directories:
  - `frontend/src/types/` — shared interface and type definitions
  - `frontend/src/core/` — `ProjectManager`, `UIController`, `APIClient`, `UXEnhancements`
  - `frontend/src/projects/` — one `.ts` file per weekly assignment (A1A–A1J)
  - `frontend/src/classes/` — `Car`, `DiceRoller`, `OrderChaosComposition`
  - `frontend/src/utils/` — `AudioWorkletFix`
  - `backend/src/types/` — `database.ts`, `api.ts`
  - `backend/src/api/` — Express server (`index.ts`)
  - `backend/src/utils/` — `database.ts` (dev + in-memory), `database-aws.ts` (production)
- **7:3:1 design system** applied to the outer shell UI only — Dark Navy `#1a1a2e` (70%), Purple-Blue `#667eea` (30%), Gold `#ffd93d` (10%).
- **Modular CSS** — replaced two monolithic CSS files with five purpose-scoped files: `design-tokens.css`, `layout.css`, `components.css`, `animations.css`, `responsive.css`.
- **Ambient type declarations** for CDN-loaded p5.js (`src/types/vendor/p5.d.ts`) and ml5.js (`src/types/vendor/ml5.d.ts`) — avoids `@types/p5` conflicts.
- **JSDoc** on all public classes, methods, interfaces, and important fields.
- **Cleanup hooks** for A1E (microphone stop) and A1H (DOM element removal) via the `cleanup` registration option.
- **`vite.config.ts`** with `vite-plugin-checker` for in-browser TypeScript error overlay.
- **Bilingual README** (Korean / English) with project table, architecture ASCII diagram, and student-friendly setup guide.
- `CHANGELOG.md` (this file).

### Changed

- `frontend/package.json` and `backend/package.json` versions bumped to `2.0.0`.
- Root `package.json` version bumped to `2.0.0`.
- `frontend/index.html` script section updated to load TypeScript source files via Vite (`type="module"`) and load `AudioWorkletFix.ts` before CDN scripts.
- All UI text stripped of emoji characters per accessibility and style guidelines.
- `UIController.reloadCurrentProject()` visibility changed from `private` → public to allow `UXEnhancements` keyboard-shortcut handler access.
- Backend `dev` script updated to use `ts-node`: `nodemon --exec ts-node src/api/index.ts`.
- Backend `build` script updated to `tsc`.

### Preserved (intentionally not changed)

- **A1A–A1J canvas drawing logic** — the p5.js sketch code inside each project is byte-for-byte identical to v1.x. Only boilerplate, registration calls, and TypeScript type annotations were added.
- **p5.js and ml5.js CDN `<script>` loads** — these are NOT npm dependencies.
- **Serverless backend architecture** — Lambda export via `serverless-http` unchanged.
- **AWS DynamoDB schema and table names** — no data migration required.
- **All existing API routes and response shapes** — backward compatible.

### Removed

- `frontend/css/style.css` — replaced by the five modular CSS files.
- `frontend/css/landing-enhancements.css` — styles merged into `components.css` and `animations.css` (duplicate `@keyframes fadeIn` deduplicated).
- `frontend/vite.config.js` — replaced by `vite.config.ts`.

---

## [1.0.0] — 2025-05-01

Initial release — 9 p5.js interactive sketches (A1A–A1J), Express.js API, AWS DynamoDB backend, plain JavaScript frontend.
