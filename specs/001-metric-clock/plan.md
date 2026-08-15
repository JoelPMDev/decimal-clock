# Implementation Plan: Metric Clock

**Branch**: `001-metric-clock` | **Date**: 2026-08-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-metric-clock/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Build a focused responsive React web app that shows the proportion of the active
timezone's actual local calendar day as decimal time, with conventional local time
as context. Every display snapshot is derived from one exact instant, timezone-aware
local-day boundaries, and elapsed-day proportion. The app persists only the timezone
preference locally and ships as an installable offline PWA. The UI keeps the clock
dominant, provides a right-side settings drawer, reserves a fixed temporary
`Metric Clock` logo region, and exposes browser/iPhone install guidance.

## Technical Context

**Language/Version**: TypeScript 5.8 strict mode; React 19.1; Node.js 22 LTS tooling

**Primary Dependencies**: Vite 7, `@vitejs/plugin-react`, and `vite-plugin-pwa`/Workbox.
Prefer platform `Intl.DateTimeFormat` and `Intl.supportedValuesOf('timeZone')`; add
`date-fns-tz` only if a narrowly scoped boundary helper is needed. Use native HTML,
CSS, and React rather than a component framework.

**Storage**: Versioned `localStorage` key for timezone mode and named IANA timezone;
memory-only fallback when storage is unavailable or malformed. No backend or cookies.

**Testing**: Vitest 3 with Testing Library and `@testing-library/jest-dom`; Playwright
for responsive/offline/PWA-ish browser checks; `axe-core` or `@axe-core/playwright`
for accessibility. Fake clocks and injected instant providers make domain tests deterministic.

**Target Platform**: Evergreen Chromium, Firefox, and Safari on phone, tablet, and
desktop. iOS Safari installation is informational. Production service workers require
HTTPS (localhost is sufficient during development).

**Project Type**: Greenfield client-only responsive web application and PWA.

**Performance Goals**: At least 10 visible clock updates per second while active and
visible. Use a visibility-aware `requestAnimationFrame` scheduler, avoid duplicate
timers, and derive each render from `Date.now()` or an injected clock.

**Constraints**: Preserve full internal fractional precision; round only display seconds
with carry and explicit midnight precedence. Compute boundaries in the selected IANA
timezone, including DST and date changes. Cache-first static assets must support offline
core use. No analytics, network API, account, data collection, or out-of-scope V1 feature.

**Scale/Scope**: One clock screen, one right-side settings drawer, one iPhone guidance
dialog, and a generated searchable timezone catalog. Single-user/local with no server scale.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-research gate: PASS

- **Simplicity First**: One clock screen and only the required timezone/install controls;
  no accounts, backend, analytics, or deferred feature work is implemented.
- **Accuracy Above All**: Domain logic is isolated, uses actual selected-timezone day
  boundaries, derives snapshots from an instant, and includes reference, rollover, and
  DST tests.
- **Performance and Continuity**: A visibility-aware scheduler refreshes at least 10 Hz
  when visible but never increments a previous value.
- **Client-Side and Offline by Default**: Static Vite output, localStorage only, and a
  service worker satisfy the offline requirement.
- **Accessible Clarity**: Semantic controls, focus management, contrast, responsive
  layout, and automated axe plus keyboard checks are part of the design.

No gate violations or unresolved technical clarifications remain.

## Project Structure

### Documentation (this feature)

```text
specs/001-metric-clock/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── App.tsx
│   ├── styles.css
│   └── main.tsx
├── components/
│   ├── ClockDisplay.tsx
│   ├── InstallControl.tsx
│   ├── InstallGuidanceDialog.tsx
│   ├── SettingsDrawer.tsx
│   └── TimezoneSelector.tsx
├── domain/
│   ├── decimalTime.ts
│   ├── localDay.ts
│   ├── displaySnapshot.ts
│   └── types.ts
├── platform/
│   ├── clockScheduler.ts
│   ├── installContext.ts
│   ├── persistence.ts
│   ├── serviceWorker.ts
│   ├── timezones.ts
│   └── timeSource.ts
└── test/
    ├── setup.ts
    └── fixtures.ts
public/
├── manifest.webmanifest
└── icons/
tests/
├── unit/
│   ├── decimalTime.test.ts
│   ├── localDay.test.ts
│   ├── persistence.test.ts
│   └── timezones.test.ts
├── component/
│   ├── App.test.tsx
│   ├── SettingsDrawer.test.tsx
│   └── InstallGuidanceDialog.test.tsx
├── e2e/
│   ├── responsive.spec.ts
│   ├── offline.spec.ts
│   └── accessibility.spec.ts
└── contracts/
    └── browser-contracts.test.ts
```

**Structure Decision**: Use a single Vite project with domain logic under `src/domain`,
browser and persistence adapters under `src/platform`, and thin React components under
`src/components`. Tests mirror domain, component, browser-contract, and end-to-end
boundaries. This keeps clock logic independent from UI and hosting concerns.

### Post-design gate: PASS

The design preserves all five constitutional principles. PWA and iPhone install behavior
are isolated behind platform adapters and documented browser contracts. No complexity
requires a constitution exception.

## Complexity Tracking

No violations. Complexity tracking is not needed.
