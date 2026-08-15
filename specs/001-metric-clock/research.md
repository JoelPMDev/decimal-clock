# Phase 0 Research: Metric Clock

## React, TypeScript, and Vite

**Decision**: Use React 19.1 with TypeScript 5.8 strict mode and Vite 7 on Node.js 22 LTS.

**Rationale**: This is a greenfield browser UI with one screen and a small interaction surface. Vite provides fast development and static output, React provides predictable component state and accessibility composition, and strict TypeScript makes the domain/UI boundary explicit. The versions are concrete implementation targets and should be pinned in the initial package manifest.

**Alternatives considered**: Vanilla TypeScript would reduce dependencies but would make drawer, dialog, and focus state less cohesive. Next.js would add server and routing concerns that conflict with the client-only, offline-first scope.

## Timezone and Local-Day Calculation

**Decision**: Store IANA identifiers internally and use the platform `Intl.DateTimeFormat` API for local calendar fields and friendly formatting. Build a small timezone adapter that finds the instant at local midnight and the next local midnight, rather than applying a fixed offset. Use `Intl.supportedValuesOf('timeZone')` when available and a bundled fallback catalog of common IANA zones when it is not.

**Rationale**: IANA data handles offset changes and daylight-saving transitions. A local calendar day can be 23, 24, or 25 elapsed hours, so the decimal position must be `elapsedMilliseconds / (nextMidnight - midnight)` for the selected zone. The implementation must never infer the end of day by adding 24 hours to the start. To resolve a local date to an instant, format candidate instants with `Intl.DateTimeFormat(..., { timeZone, ... })`, search around the UTC estimate, and verify the resulting local date/time. For a nonexistent or repeated local midnight, choose the first valid instant that formats as the target date's `00:00:00`; if no exact midnight exists, use the first instant of that local date. The day-end lookup repeats the same procedure for the next local date. This makes DST and date-boundary behavior explicit and testable.

**Alternatives considered**: A hand-maintained offset table is incorrect as zones change. Treating every local day as 86,400,000 ms fails DST tests. A large timezone library would be robust but unnecessary until platform capabilities prove insufficient; the adapter boundary allows a library to be added later without changing domain consumers.

## Decimal Conversion and Refresh

**Decision**: Represent a snapshot with exact `currentInstant`, `dayStart`, `dayEnd`, and fractional elapsed position. Convert proportion to 1,000,000 decimal ticks per day, retain the fractional result internally, round only the displayed decimal second, then carry seconds/minutes/hours. At the exact next local-day boundary, return the new day's zero value before rounding the old day. Schedule a visibility-aware `requestAnimationFrame` loop and publish at most one snapshot per animation frame, while ensuring visible output changes at least 10 times per second.

**Rationale**: Recomputing from the current instant prevents drift from timer delay and keeps conventional and decimal displays tied to the same sample. Decimal time has 10 x 100 x 100 = 100,000 displayed seconds per day; one displayed second is 0.00001 of the day. Fractional internal representation leaves room for future fractional-second display without redesign. `requestAnimationFrame` pauses naturally in hidden documents; a minimum display interval can reduce unnecessary state updates while preserving the 10 Hz target.

**Alternatives considered**: Incrementing a prior value accumulates scheduling drift. `setInterval(100)` is simple but less visibility-aware and can continue doing work in background tabs. Rounding each component independently can produce invalid values such as `9:99:100`, so conversion uses a single total-tick value and carries once.

## Persistence

**Decision**: Use a versioned JSON record in `localStorage`, for example `metric-clock:preferences:v1`, containing `{ mode: 'automatic' | 'named', timeZone?: string }`. Parse and validate on startup; invalid or unavailable storage falls back to automatic mode for the session. Writes are best effort and expose a non-blocking retention status if persistence fails.

**Rationale**: The preference is small, local, and does not need synchronization. A version lets future schema changes migrate or reject old data safely. The core clock remains usable when storage is blocked by privacy mode, quota, or browser policy.

**Alternatives considered**: IndexedDB is unnecessary for one record. Cookies would transmit with requests and are less appropriate for a client-only utility. A backend would violate offline-by-default and no-data-collection constraints.

## PWA and Install Context

**Decision**: Use a web app manifest and a Workbox-backed service worker configured for cache-first static assets. Capture `beforeinstallprompt` when supported, defer it behind the bottom-left install control, and call `prompt()` only from the user gesture. Detect installed mode with `matchMedia('(display-mode: standalone)')` and `navigator.standalone === true` for iOS. On iPhone where the prompt is unavailable, show an accessible dialog with Share, Add to Home Screen, and Add guidance.

**Rationale**: These are the browser-native mechanisms for installability and offline launch. The service worker caches the app shell and timezone catalog, while runtime logic remains local. iOS Safari does not expose the Chromium install prompt, so it must be documented as a manual flow. The install control stays hidden in installed contexts and visible otherwise, subject to browser support.

**Alternatives considered**: A custom download flow cannot install a web app. Network-first caching would make offline launch depend on a failed network request. Automating iPhone system sheets is impossible from web content and would be misleading.

## Accessibility and Verification

**Decision**: Use semantic `main`, `header`, `aside`, `dialog`, labels, live-region updates with restrained announcement behavior, visible `:focus-visible` styles, and focus return to the invoking control. Run Vitest component tests, Playwright keyboard/responsive/offline checks, and axe-core scans.

**Rationale**: The clock changes frequently but should not overwhelm assistive technology; the current values can be available as accessible text while announcements are throttled or marked polite. Automated checks cover repeatable structure and contrast, while manual VoiceOver/iPhone checks remain necessary for the native Share flow.

**Alternatives considered**: Visual-only labels fail non-pointer and screen-reader use. An assertive live region on every frame would be noisy and harmful. Automated tests alone cannot prove the quality of spoken output or iOS system UI.

## Future Extension Boundary

**Decision**: Keep logo token, clock-font token, fractional display precision, animation policy, and native-client integration outside V1 public behavior but behind component/domain interfaces where practical.

**Rationale**: This preserves the fixed logo region and swappable font token requested now without implementing future features. Domain snapshots can carry fractional values without changing the clock calculation contract.

**Alternatives considered**: Implementing branding, animation, native iOS, or additional utilities now would violate the focused V1 scope and increase testing surface.
