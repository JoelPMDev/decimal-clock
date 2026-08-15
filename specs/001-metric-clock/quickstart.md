# Quickstart Validation: Metric Clock

## Prerequisites

- Node.js 22 LTS and npm.
- A Chromium-based browser for install/offline checks; Safari is required for the iPhone manual check.
- From the repository root, implementation creates a standard Vite project with `package.json` scripts.

## Install, Run, Test, Build

```powershell
npm ci
npm run dev
npm run test
npm run test:e2e
npm run build
npm run preview
```

Expected outcomes: the development server opens the clock; unit/component tests pass; Playwright completes responsive, offline, and accessibility scenarios; the production build completes without TypeScript errors; preview serves the built app and registers the service worker on a secure or localhost origin.

## Reference Conversion Checks

Run the Vitest domain suite:

```powershell
npm run test -- decimalTime localDay
```

At controlled instants in a 24-hour day, verify:

- `00:00:00` -> `0:00:00`
- `06:00:00` -> `2:50:00`
- `12:00:00` -> `5:00:00`
- `18:00:00` -> `7:50:00`
- the next local midnight -> `0:00:00` for the new date

Also verify exact start, exact half-day, rounding/carry near a displayed-second boundary, and the absence of invalid `H:100:00` or `H:MM:100` values.

## Timezone and DST Checks

Use deterministic instants and named IANA zones in unit tests and the settings UI:

1. Start in automatic mode and confirm the device zone is used.
2. Select `Europe/London`, `America/New_York`, and `Asia/Tokyo`; confirm friendly labels, conventional time, local date, and decimal day position all change together.
3. Select a zone near local midnight and confirm the selected zone, not the previous zone, determines the day window.
4. Exercise a spring-forward day and a fall-back day in a DST zone. Assert that the day window duration is 23 or 25 hours as appropriate, and that decimal position is based on elapsed duration rather than a fixed 24-hour assumption.
5. Exercise a zone/date boundary where the selected local date differs from the device date.

Expected outcome: all values match the selected zone's actual local calendar day and no test relies on a hand-maintained offset.

## Responsive and Accessibility Checks

```powershell
npx playwright test tests/e2e/responsive.spec.ts tests/e2e/accessibility.spec.ts
```

Run at representative phone portrait, phone landscape, tablet, and desktop viewports. Confirm the fixed top `Metric Clock` region, centered dominant decimal display, conventional display, bottom-left install control, and bottom-right settings control do not overlap or clip. Use keyboard-only navigation to open/close the drawer and dialog, select a timezone, dismiss overlays, and observe visible focus. Axe checks must report no serious or critical violations.

## Offline and PWA Checks

```powershell
npx playwright test tests/e2e/offline.spec.ts
```

Load the production preview once, verify the manifest and service worker, select a timezone, then emulate offline and reload. Expected outcome: both clocks continue updating, timezone search data and saved preference remain available, and the UI has no required network request. In an installed/standalone context the install control is hidden.

For supported Chromium, activate the install control and verify the deferred native prompt path. For iPhone Safari, verify manually that the control opens an accessible guide in the order **Share -> Add to Home Screen -> Add** and that dismissal restores focus and leaves the clock usable. Browser automation cannot fully automate Apple's native Share sheet, home-screen confirmation, or the resulting standalone launch; those steps require a physical-device or Safari manual check.

Environment note: the local unit suite, production build, and Playwright browser suites passed after installing Chromium with `npx playwright install chromium`. The iPhone Safari Share -> Add to Home Screen -> Add flow and standalone relaunch remain manual checks because Apple does not expose those native actions to browser automation.
