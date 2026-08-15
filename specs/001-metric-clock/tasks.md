---

description: "Implementation tasks for the Metric Clock feature"
---

# Tasks: Metric Clock

**Input**: Design documents from `specs/001-metric-clock/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`, and contracts under `contracts/`

**Tests**: Included because the feature specification explicitly requires automated domain, component, integration, accessibility, responsive, PWA/offline, and persistence verification.

**Organization**: Tasks are grouped by implementation phase and user story. Domain and platform contracts are completed before dependent rendering work.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the greenfield Vite/React/TypeScript project and test tooling described in the approved plan.

- [X] T001 Create the Vite React TypeScript project manifest and scripts for development, unit tests, end-to-end tests, build, and preview in `./package.json`
- [X] T002 [P] Configure strict TypeScript compilation and browser module resolution in `./tsconfig.json`
- [X] T003 [P] Configure Vite and the React plugin for the client-only application in `./vite.config.ts`
- [X] T004 [P] Configure Vitest, Testing Library, and jsdom test execution in `./vitest.config.ts`
- [X] T005 [P] Configure Playwright browser projects and local preview usage in `./playwright.config.ts`
- [X] T006 Create the planned application, component, domain, platform, public, and test directories without adding application behavior in `src/app/main.tsx`
- [X] T007 [P] Add shared test environment registration and jest-dom setup in `src/test/setup.ts`
- [X] T008 [P] Add deterministic instant, timezone, local-day, and preference fixtures for focused tests in `src/test/fixtures.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared types, browser boundaries, and test seams required by every user story.

**Critical ordering**: Complete this phase before story work. Decimal conversion reference tests and timezone boundary tests remain before any clock rendering task in Phase 3.

- [X] T009 Define shared domain types for current instants, local-day windows, decimal positions, display snapshots, and timezone preferences in `src/domain/types.ts`
- [X] T010 Define the injected current-time source interface and browser clock adapter boundary in `src/platform/timeSource.ts`
- [X] T011 Define the platform service-worker registration boundary without coupling domain modules to hosting in `src/platform/serviceWorker.ts`
- [X] T012 [P] Add browser contract test scaffolding for supported timezone, storage, install, and service-worker capabilities in `tests/contracts/browser-contracts.test.ts`
- [X] T013 [P] Add the application entrypoint that mounts the React root and imports the shared stylesheet in `src/app/main.tsx`

**Checkpoint**: The project builds its test harness and shared boundaries; no story implementation depends on an untested browser-global call.

---

## Phase 3: User Story 1 - Read the Current Decimal Time (Priority: P1) - MVP

**Goal**: Given one exact instant and the active timezone, calculate and render accurate decimal and conventional clocks with stable updates across midnight and local-day boundaries.

**Independent Test**: Use injected instants at midnight, 06:00, noon, 18:00, just before rollover, and the next local midnight; verify `H:MM:SS`, conventional time, timezone label, same-instant behavior, and no visible layout shift without settings or installation features.

### Tests for User Story 1

- [X] T014 [P] [US1] Write decimal conversion reference-value unit tests for `00:00:00`, `06:00:00`, `12:00:00`, `18:00:00`, and next-day `24:00:00` in `tests/unit/decimalTime.test.ts`
- [X] T015 [P] [US1] Write decimal rounding, carry, valid-range, exact-start, exact-half-day, and end-of-day unit tests in `tests/unit/decimalTime.test.ts`
- [X] T016 [P] [US1] Write local-day resolution tests for local midnight, selected-zone date changes, and actual 23/24/25-hour day windows in `tests/unit/localDay.test.ts`
- [X] T017 [P] [US1] Write DST spring-forward and fall-back boundary tests proving decimal proportion uses the selected local day duration in `tests/unit/localDay.test.ts`
- [X] T018 [P] [US1] Write display-snapshot tests proving decimal and conventional labels derive from the same instant and active timezone in `tests/unit/localDay.test.ts`

### Domain Logic for User Story 1

- [X] T019 [US1] Implement IANA-aware local date extraction and local-midnight/next-midnight resolution without adding 24 hours to a day start in `src/domain/localDay.ts`
- [X] T020 [US1] Implement total-tick decimal conversion with fractional internal precision, display-second rounding, carry, and explicit midnight precedence in `src/domain/decimalTime.ts`
- [X] T021 [US1] Implement pure display-snapshot construction using one instant, one local-day window, conventional formatting, decimal formatting, and a friendly timezone label in `src/domain/displaySnapshot.ts`
- [X] T022 [US1] Update the deterministic fixtures to cover the selected IANA zones and DST instants required by the domain tests in `src/test/fixtures.ts`

### Clock Scheduling and Rendering for User Story 1

- [X] T023 [US1] Implement a visibility-aware requestAnimationFrame scheduler that samples a current time source, publishes at least 10 visible updates per second, and never increments prior display values in `src/platform/clockScheduler.ts`
- [X] T024 [US1] Write scheduler tests for injected time sampling, visibility changes, duplicate-loop prevention, and refresh cadence in `tests/unit/localDay.test.ts`
- [X] T025 [P] [US1] Write the primary/secondary clock component test for shared snapshot rendering, timezone state, semantic labels, and stable markup in `tests/component/App.test.tsx`
- [X] T026 [P] [US1] Implement the decimal primary clock and conventional secondary clock presentation from a `DisplaySnapshot` in `src/components/ClockDisplay.tsx`
- [X] T027 [US1] Compose the current instant, selected timezone, snapshot builder, scheduler, and clock display into the primary screen in `src/app/App.tsx`
- [X] T028 [US1] Add the initial semantic page structure, fixed top logo region, centered clock region, and high-contrast stable layout rules in `src/app/styles.css`
- [X] T029 [US1] Run the focused decimal and local-day suites and correct any implementation defects before starting timezone settings or rendering-dependent stories in `tests/unit/decimalTime.test.ts`

**Checkpoint**: User Story 1 independently delivers the accurate glanceable clock and is suitable for MVP validation.

---

## Phase 4: User Story 2 - Choose and Retain a Timezone (Priority: P1)

**Goal**: Let users search/select an IANA timezone, immediately update both clocks and labels, retain the preference locally, and return to automatic device timezone mode.

**Independent Test**: Open settings, select London, New York, and Tokyo at controlled instants, verify local dates and both displays, reload with storage available and unavailable, and switch back to automatic mode.

### Tests for User Story 2

- [X] T030 [P] [US2] Write timezone catalog tests for supported-value discovery, bundled fallback, recognizable London/New York/Tokyo labels, filtering, and empty results in `tests/unit/timezones.test.ts`
- [X] T031 [P] [US2] Write persistence tests for version 1 JSON validation, automatic/named records, malformed records, unavailable zones, best-effort writes, and automatic fallback in `tests/unit/persistence.test.ts`
- [X] T032 [P] [US2] Write settings drawer component tests for automatic mode, searchable selection, selected state, empty results, close, Escape, and focus return in `tests/component/SettingsDrawer.test.tsx`

### Platform and Domain Integration for User Story 2

- [X] T033 [US2] Implement supported IANA timezone discovery, bundled fallback catalog, friendly names, and search filtering in `src/platform/timezones.ts`
- [X] T034 [US2] Implement versioned `metric-clock:preferences:v1` localStorage read/write validation with memory-only fallback and non-blocking retention status in `src/platform/persistence.ts`
- [X] T035 [US2] Integrate persisted timezone preference loading, named-zone selection, automatic mode reset, and snapshot recalculation into `src/app/App.tsx`

### Settings UI for User Story 2

- [X] T036 [P] [US2] Implement the accessible searchable timezone selector with selected and no-results states in `src/components/TimezoneSelector.tsx`
- [X] T037 [US2] Implement the right-side semantic settings drawer with automatic mode, selector, dismiss actions, Escape handling, focus trap, and focus return in `src/components/SettingsDrawer.tsx`
- [X] T038 [US2] Add settings drawer layout, focus-visible styling, responsive overflow, and timezone state presentation in `src/app/styles.css`
- [X] T039 [US2] Add integrated settings interaction tests proving selection changes both clock labels/values and survives reopen in `tests/component/App.test.tsx`
- [X] T040 [US2] Run focused timezone, persistence, and settings suites including a network-disabled reload scenario before beginning PWA/install work in `tests/unit/persistence.test.ts`

**Checkpoint**: User Stories 1 and 2 work together while timezone preference behavior remains independently testable through platform and component boundaries.

---

## Phase 5: User Story 3 - Install and Use Metric Clock Offline (Priority: P2)

**Goal**: Provide browser install detection, iPhone installation guidance, a manifest, cache-first service-worker behavior, and full core use after an offline launch.

**Independent Test**: Load a production preview, inspect manifest/service worker, activate the browser install path or iPhone guide, dismiss it accessibly, select a timezone, disable network, reload, and verify clock, settings, search, and persistence remain usable.

### Tests for User Story 3

- [X] T041 [P] [US3] Extend browser contract tests for `beforeinstallprompt`, standalone display mode, iOS standalone detection, manifest metadata, and service-worker registration in `tests/contracts/browser-contracts.test.ts`
- [X] T042 [P] [US3] Write install guidance component tests for ordered Share/Add to Home Screen/Add steps, dismissal, accessible dialog state, and focus return in `tests/component/InstallGuidanceDialog.test.tsx`
- [X] T043 [P] [US3] Write browser end-to-end tests for manifest, service worker, install-control visibility, standalone hiding, and offline launch continuity in `tests/e2e/offline.spec.ts`

### Platform and PWA Implementation for User Story 3

- [X] T044 [US3] Implement installed-context detection, deferred `beforeinstallprompt` capture, user-gesture prompting, iOS detection, and install-state refresh in `src/platform/installContext.ts`
- [X] T045 [US3] Configure service-worker registration and cache-first Workbox static-shell behavior with versioned cache cleanup in `src/platform/serviceWorker.ts`
- [X] T046 [US3] Add the standalone PWA manifest with temporary branding, start URL, display mode, theme/background colors, and suitable icon references in `public/manifest.webmanifest`
- [X] T047 [P] [US3] Add installable PWA icon assets referenced by the manifest in `public/icons/`
- [X] T048 [US3] Add the generated timezone catalog and all application-shell assets to the offline precache configuration in `./vite.config.ts`

### Install UI and Offline Integration for User Story 3

- [X] T049 [P] [US3] Implement the bottom-left browser install control with installed-context hiding and native-prompt trigger in `src/components/InstallControl.tsx`
- [X] T050 [P] [US3] Implement the accessible iPhone guidance dialog with ordered Share, Add to Home Screen, and Add instructions and dismissal semantics in `src/components/InstallGuidanceDialog.tsx`
- [X] T051 [US3] Integrate install context, install control, guidance dialog, and service-worker registration into the application shell in `src/app/App.tsx`
- [X] T052 [US3] Add install-control positioning, dialog layout, small-screen readability, focus styles, and installed-context presentation rules in `src/app/styles.css`
- [X] T053 [US3] Run the production preview offline/PWA suite and correct cache, manifest, registration, or offline preference defects in `tests/e2e/offline.spec.ts`

**Checkpoint**: User Story 3 provides the complete installable and offline-capable experience, including explicit iPhone installation guidance.

---

## Phase 6: User Story 4 - Use the Clock Comfortably on Any Supported Screen (Priority: P2)

**Goal**: Verify and refine responsive, keyboard, semantic, focus, contrast, and screen-reader behavior across phone, tablet, and desktop layouts.

**Independent Test**: Exercise representative narrow mobile, landscape, tablet, and desktop viewports; navigate all controls by keyboard; inspect accessible names, states, focus return, and clock text without relying on visual styling.

### Tests for User Story 4

- [X] T054 [P] [US4] Write responsive end-to-end checks for fixed logo region, centered dominant clock, secondary time, bottom controls, no clipping, no overlap, and stable digit changes in `tests/e2e/responsive.spec.ts`
- [X] T055 [P] [US4] Write keyboard and axe accessibility end-to-end checks for clock values, settings, timezone search, install control, dialog, focus visibility, and focus return in `tests/e2e/accessibility.spec.ts`
- [X] T056 [P] [US4] Add component assertions for accessible names, live-region politeness, pressed/open state, and semantic structure in `tests/component/App.test.tsx`

### Responsive and Accessibility Implementation for User Story 4

- [X] T057 [US4] Refine semantic `main`, `header`, clock status text, timezone state, and restrained non-assertive live-region behavior in `src/components/ClockDisplay.tsx`
- [X] T058 [US4] Refine drawer and install dialog accessible descriptions, focus containment, Escape handling, and return-focus behavior in `src/components/SettingsDrawer.tsx`
- [X] T059 [US4] Implement phone, tablet, desktop, landscape, high-contrast, visible-focus, no-overlap, and stable-dimension rules in `src/app/styles.css`
- [X] T060 [US4] Complete application-level keyboard wiring and accessible control names/states across clock, settings, install, and guidance flows in `src/app/App.tsx`
- [X] T061 [US4] Run responsive and accessibility browser checks at representative viewports and fix only user-story presentation or interaction failures in `tests/e2e/accessibility.spec.ts`

**Checkpoint**: All four user stories meet their independent responsive and accessibility criteria without changing domain accuracy or offline boundaries.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature against the approved quickstart, constitutional gates, and measurable success criteria.

- [X] T062 [P] Run the complete unit and component suite covering decimal conversion, local-day/DST behavior, timezone catalog, persistence, scheduler, clock rendering, settings, and install guidance in `tests/unit/decimalTime.test.ts`
- [X] T063 [P] Run all browser contract and end-to-end suites for responsive, accessibility, offline, install, persistence, and PWA behavior in `tests/e2e/offline.spec.ts`
- [X] T064 [P] Build the production bundle and verify TypeScript strict compilation and service-worker asset generation in `./vite.config.ts`
- [X] T065 Review the implementation against the constitution and feature requirements, confirming no accounts, analytics, network API, out-of-scope clock features, or unnecessary data transmission were introduced in `src/app/App.tsx`
- [X] T066 Run every command in `specs/001-metric-clock/quickstart.md` and record the remaining manual iPhone Safari Share/Add to Home Screen/Add limitation in `specs/001-metric-clock/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies; T001-T008 initialize the project and test seams. T002-T005 and T007-T008 can run in parallel once T001 establishes the package scripts.
- **Phase 2 (Foundational)**: Depends on Phase 1; T009-T013 establish shared domain/platform boundaries and block story work.
- **Phase 3 (US1, P1)**: Depends on Phase 2. T014-T018 must be written and run against the intended behavior before T019-T022; T019-T022 must complete before T023-T028 clock rendering and scheduling work.
- **Phase 4 (US2, P1)**: Depends on Phase 2 and the display snapshot contract from US1. T030-T032 precede T033-T039; persistence and timezone handling must pass before settings-dependent integration is complete.
- **Phase 5 (US3, P2)**: Depends on US1 and US2 so offline verification covers the complete clock and settings experience. T041-T043 precede T044-T053 implementation and browser validation.
- **Phase 6 (US4, P2)**: Depends on the completed clock, settings, and install surfaces from US1-US3. T054-T056 establish presentation/accessibility checks before T057-T061 refinements.
- **Phase 7 (Polish)**: Depends on all desired stories; T062-T066 are final cross-cutting validation.

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational. This is the MVP and owns the decimal/local-day domain and first clock rendering.
- **US2 (P1)**: Depends on Foundational and consumes US1 display snapshots; it can be developed in parallel with late US1 UI work only after the shared domain contract is complete.
- **US3 (P2)**: Depends on US1 clock rendering and US2 settings/persistence for its full offline acceptance path.
- **US4 (P2)**: Depends on the UI surfaces delivered by US1-US3; its tests and refinements cover the integrated experience.

### Requirement Ordering Guarantees

- Decimal conversion reference-value and boundary tests (T014-T018) precede all UI rendering tasks (T025-T028).
- Timezone local-day and DST tests plus implementation (T016-T022) precede clock rendering and scheduler integration (T023-T028).
- Persistence and timezone catalog tests/implementations (T030-T035) precede settings UI integration (T036-T040).
- Install detection, service-worker, manifest, and offline tests are explicit in T041-T053.
- iPhone installation guidance is explicit in T042, T050, and the manual limitation in T066.

### Parallel Execution Examples

**After Setup is complete:**

```text
Task T002: Configure strict TypeScript in tsconfig.json
Task T003: Configure Vite React integration in vite.config.ts
Task T004: Configure Vitest in vitest.config.ts
Task T005: Configure Playwright in playwright.config.ts
Task T007: Add test setup in src/test/setup.ts
Task T008: Add test fixtures in src/test/fixtures.ts
```

**Within US1 after shared types exist:**

```text
Task T014: Reference-value tests in tests/unit/decimalTime.test.ts
Task T016: Local-day tests in tests/unit/localDay.test.ts
Task T017: DST boundary tests in tests/unit/localDay.test.ts
Task T018: Snapshot same-instant tests in tests/unit/localDay.test.ts
```

**Within US2 after domain contracts are stable:**

```text
Task T030: Timezone catalog tests in tests/unit/timezones.test.ts
Task T031: Persistence tests in tests/unit/persistence.test.ts
Task T032: Settings drawer tests in tests/component/SettingsDrawer.test.tsx
```

**Within US3 after US1/US2 integration is available:**

```text
Task T041: Browser capability contract tests in tests/contracts/browser-contracts.test.ts
Task T042: Install guidance tests in tests/component/InstallGuidanceDialog.test.tsx
Task T043: Offline/PWA browser tests in tests/e2e/offline.spec.ts
Task T046: PWA manifest in public/manifest.webmanifest
Task T047: PWA icons in public/icons/
Task T049: Install control in src/components/InstallControl.tsx
Task T050: iPhone guidance dialog in src/components/InstallGuidanceDialog.tsx
```

**Within US4 after integrated UI surfaces exist:**

```text
Task T054: Responsive browser checks in tests/e2e/responsive.spec.ts
Task T055: Accessibility browser checks in tests/e2e/accessibility.spec.ts
Task T056: Component accessibility assertions in tests/component/App.test.tsx
```

---

## Independent Test Criteria

- **US1**: At controlled instants, decimal output matches `0:00:00`, `2:50:00`, `5:00:00`, `7:50:00`, and next-day `0:00:00`; exact rounding/carry, midnight rollover, same-instant conventional time, DST day duration, and stable rendering all pass.
- **US2**: Search and select London, New York, and Tokyo; both clocks, local date, labels, and day boundary update together; automatic mode, malformed/unavailable records, reload retention, and storage failure behavior pass.
- **US3**: Manifest and service worker are present; install control visibility follows installed state; iPhone guidance shows Share then Add to Home Screen then Add and restores focus; offline reload retains clocks, settings, search, and saved timezone.
- **US4**: Phone portrait/landscape, tablet, and desktop checks show no clipping, overlap, or avoidable digit shift; keyboard reaches every action; axe reports no serious/critical violations; accessible names, states, focus, and clock values are understandable.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup and Phase 2 Foundational.
2. Write and pass the decimal reference, rounding, local-day, DST, and snapshot tests.
3. Implement domain logic, scheduler, and the primary/secondary clock view.
4. Stop at the Phase 3 checkpoint and validate the MVP independently against the quickstart reference values.

### Incremental Delivery

1. Add US2 timezone search, automatic mode, local persistence, and settings drawer; validate it without network dependency.
2. Add US3 manifest, service worker, install detection, iPhone guidance, and offline browser validation.
3. Add US4 responsive and accessibility hardening across the integrated experience.
4. Run Phase 7 quickstart, production-build, PWA, accessibility, and constitutional checks.

### Implementation Agent Guidance

- Execute tasks in numeric order unless a listed `[P]` example proves the files and dependencies are independent.
- Keep domain modules free of React and browser rendering concerns; keep platform adapters behind the interfaces established in Phase 2.
- Do not begin a UI rendering task until the required domain tests and timezone/DST implementation tasks have passed.
- Do not treat a passing browser install prompt as proof of iPhone installation; retain the manual Safari check required by `quickstart.md`.

---

## Notes

- Every task is a strict checkbox with a sequential `T###` identifier.
- `[P]` appears only on tasks that can touch different files without an incomplete dependency.
- `[US#]` appears only in user-story phases; setup, foundational, and polish tasks intentionally omit story labels.
- Each task description includes an exact repository path from the approved project structure, with `public/icons/` used for the manifest's planned icon directory.
