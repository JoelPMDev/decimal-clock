# Data Model: Metric Clock

## Current Instant

- **Fields**: `instant: Date` or epoch milliseconds; one sampled value shared by decimal and conventional formatting.
- **Validation**: finite epoch milliseconds; test fixtures may inject controlled instants.
- **Transitions**: replaced on each visible scheduler publication; never incremented from the previous value.

## Local Day Window

- **Fields**: `timeZone: IANA identifier`, `localDate: YYYY-MM-DD`, `start: Date`, `end: Date`, `durationMilliseconds`.
- **Validation**: supported IANA zone; `start < end`; duration is positive and may differ from 24 hours because of DST or other offset changes.
- **Transitions**: recomputed when the instant crosses local midnight or when the selected timezone changes. Start and end are resolved from local calendar dates, not by adding 24 hours to the start.

## Decimal Day Position

- **Fields**: `elapsedMilliseconds`, `proportion`, `totalDecimalTicks` (fractional), `displayHour`, `displayMinute`, `displaySecond`, optional `fractionalSecond` for future display.
- **Validation**: for an instant inside the window, proportion is in `[0, 1)`; displayed hour is `0..9`, minute and second are `0..99`. At the end boundary, transition to the next window and display zero.
- **Transitions**: derived anew from `Current Instant` and `Local Day Window` on every snapshot. Convert one total tick value, round only the display-second unit, then carry through minute and hour.

## Timezone Preference

- **Fields**: `mode: 'automatic' | 'named'`; `timeZone?: IANA identifier`; `alwaysOn: boolean`; `showStandardTime: boolean`; `separator: ':' | '.' | '-' | '/'`; `persistenceVersion: 1`.
- **Validation**: automatic mode has no required named zone; named mode requires a valid supported IANA identifier. Missing `showStandardTime` values default to visible and missing or invalid `separator` values default to `:` for backwards compatibility. Invalid records fall back to automatic mode.
- **Transitions**: initial state is automatic device timezone with standard time visible and colon separators; selecting a named zone or changing display settings updates immediately and persists best effort; selecting automatic clears the named choice and persists; storage failure leaves the current session state usable.

## Display Snapshot

- **Fields**: `instant`, `timeZone`, friendly `timeZoneLabel`, `localDate`, `conventionalTimeLabel`, `decimalTimeLabel`, `dayStart`, `dayEnd`, and the underlying fractional decimal position.
- **Validation**: both labels are generated from the same instant and active timezone; decimal format is `H:MM:SS` with fixed-width minute/second fields.
- **Transitions**: produced by a pure domain function. Any instant or timezone preference change produces a new snapshot; components do not calculate or mutate time values themselves.

## Install Context

- **Fields**: `isInstalled`, `canPrompt`, deferred install prompt reference, `isIOS`, `guidanceOpen`.
- **Validation**: installed is true for standalone display mode or iOS `navigator.standalone`; prompt reference is used only after a user gesture.
- **Transitions**: browser `beforeinstallprompt` makes the native prompt available; accepting or dismissing it clears the deferred prompt and refreshes installed state. iOS control opens guidance instead. Closing guidance returns focus to its trigger. Installed contexts hide the control.

## Settings Drawer State

- **Fields**: `open`, `selectedPreference`, `searchQuery`, `filteredTimeZones`, `activeDescendant`, `returnFocusTarget`.
- **Validation**: search results are derived from the supported catalog and friendly names; empty results preserve the current selection and show a no-results status. Drawer exposes timezone mode, named search, standard-time visibility, and Always On mode.
- **Transitions**: settings trigger opens drawer and records focus target; Escape, close button, or selection completion closes it as designed; open state traps focus within the drawer while active and returns focus on close. Selecting a zone updates preference, snapshot, labels, and persistence; search changes only the filtered list.

## Relationships

`Timezone Preference` determines the timezone used to construct `Local Day Window`. `Current Instant` plus that window produces `Decimal Day Position` and a `Display Snapshot`. `Display Snapshot` is rendered by the clock UI. `Install Context` controls the install control and guidance dialog independently of clock calculations. `Settings Drawer State` edits `Timezone Preference` and consumes the supported timezone catalog.
