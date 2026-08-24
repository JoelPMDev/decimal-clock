# Feature Specification: Metric Clock

**Feature Branch**: `001-metric-clock`

**Created**: 2026-08-15

**Status**: Draft

**Input**: User description: "Metric Clock is a minimalist clock application whose sole primary job is helping users know the current decimal time."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read the current decimal time (Priority: P1)

A person opens Metric Clock and immediately sees the current decimal time as the primary clock. The value represents the proportion of the selected local calendar day that has elapsed, using 10 decimal hours per day, 100 decimal minutes per hour, and 100 decimal seconds per minute. Conventional time remains visible as secondary context.

**Why this priority**: This is the product's single primary job and provides value without any configuration.

**Independent Test**: Open the application at controlled instants across a day and verify the decimal display, conventional display, labels, and stable layout without using any other feature.

**Acceptance Scenarios**:

1. **Given** the device timezone is selected automatically and the current local time is shortly after midnight, **When** the user opens Metric Clock, **Then** the decimal clock begins near `0:00:00`, conventional time is shown below it, and both displays identify the active timezone context.
2. **Given** the selected local day is exactly halfway complete, **When** the clock updates, **Then** the primary display is exactly `5:00:00`.
3. **Given** the selected local day is approaching its end, **When** the local day rolls over at midnight, **Then** the decimal display rolls from the final value of the prior day to `0:00:00` for the new day without accumulating visible drift.
4. **Given** the current instant changes while the application remains open, **When** the display refreshes, **Then** decimal and conventional time continue to represent the same instant and the layout does not shift as digits change.

### User Story 2 - Choose and retain a timezone (Priority: P1)

A person opens settings, searches for and selects a timezone, and sees both clocks and their labels update to that timezone. The selection remains available after closing and reopening the application, and the person can return to automatic device-timezone mode.

**Why this priority**: A consistent alternate timezone is essential for users who need to monitor another location while preserving the same accurate clock behavior.

**Independent Test**: Select a named timezone, verify both displays and labels at a controlled instant, reload without network access, and switch back to automatic mode.

**Acceptance Scenarios**:

1. **Given** settings are open, **When** the user searches for a timezone by a recognizable location name and selects a result, **Then** decimal time, conventional time, and timezone labels all update to the selected timezone.
2. **Given** a named timezone is selected, **When** the user closes and reopens the application, **Then** the same timezone is still selected and both clocks continue to use it.
3. **Given** a named timezone is selected, **When** the user chooses automatic timezone mode, **Then** both clocks and all related labels use the device timezone again and the automatic choice is retained.
4. **Given** a timezone selection is changed near a local midnight or daylight-saving offset change, **When** the selection takes effect, **Then** the day boundary and decimal calculation use the newly selected timezone rather than the previous one.

### User Story 3 - Install and use Metric Clock offline (Priority: P2)

A person using a supported browser can install Metric Clock to the device home screen. On an iPhone, the install control provides concise guidance for Share, Add to Home Screen, and Add. Once initially loaded or installed, the person can launch the application without network access and still use the clocks, settings, and saved timezone.

**Why this priority**: Home-screen access and offline continuity make the focused clock practical as a daily utility, while the core clock remains usable without installation.

**Independent Test**: Exercise the browser install control, the iPhone guidance overlay and dismissal, then launch after network access is unavailable and verify the full core experience.

**Acceptance Scenarios**:

1. **Given** Metric Clock is open in a browser and is not installed, **When** the user views the screen, **Then** an install-app control is visible at the bottom left.
2. **Given** Metric Clock is already installed or launched from its installed home-screen experience, **When** the user views the screen, **Then** the install-app control is hidden.
3. **Given** an iPhone user activates the install-app control, **When** the guidance overlay opens, **Then** it presents the steps Share, Add to Home Screen, and Add in that order.
4. **Given** the iPhone guidance overlay is open, **When** the user dismisses it using the available dismiss action or an accessible equivalent, **Then** the overlay closes and the clock remains usable.
5. **Given** the application has completed its initial load or installation, **When** it is launched without network access, **Then** the decimal clock, conventional clock, settings, searchable timezone choices, and saved timezone remain available.

### User Story 4 - Use the clock comfortably on any supported screen (Priority: P2)

A person uses Metric Clock on a phone, tablet, or desktop with a distraction-free screen. The decimal clock is centered, dominant, high contrast, and readable; conventional time sits immediately below it. The top area reserves space for a future logo, settings are available from a bottom-right icon, and keyboard and assistive technology users can operate the interface.

**Why this priority**: Readability and low-friction access determine whether the clock works as a dependable glanceable tool.

**Independent Test**: Inspect the application at narrow mobile, tablet, and desktop sizes; operate settings and install controls with a keyboard; and verify semantic labels and readable focus states with a screen reader or equivalent accessibility inspection.

**Acceptance Scenarios**:

1. **Given** the application is viewed at narrow mobile, tablet, and desktop widths, **When** the viewport changes, **Then** the centered decimal clock, secondary conventional time, top reserved area, and bottom controls remain visible without overlap or clipped text.
2. **Given** the user activates the bottom-right settings icon, **When** the settings panel opens, **Then** it exposes only automatic timezone mode and a searchable timezone selector for version 1, and the panel can be dismissed.
3. **Given** the user navigates with a keyboard, **When** focus moves through controls and the settings panel, **Then** every actionable control is reachable, has a visible focus indication, and can be operated without a pointer.
4. **Given** a screen-reader user encounters the primary clock, secondary clock, timezone state, settings control, install control, or guidance overlay, **When** those elements are announced, **Then** their purpose, current value, and state are understandable without relying on visual styling alone.

### Edge Cases

- At the exact start of a selected local day, decimal time is `0:00:00`.
- At the exact halfway point of a selected local day, decimal time is `5:00:00`.
- At the end-of-day boundary, the display carries correctly into the next local day and does not show an invalid tenth decimal hour.
- Decimal seconds, minutes, and hours are rounded or carried consistently so displayed values remain in their valid ranges and are derived from the current instant rather than accumulated ticks.
- A timezone selection with a different local date or offset immediately recalculates the selected day's elapsed proportion and conventional time.
- Daylight-saving transitions and other timezone offset changes follow the selected timezone's actual local-day boundaries; the application does not assume every local day has the same elapsed duration.
- An unavailable or empty timezone search returns a clear no-results state without breaking the current selection.
- A saved timezone that is unavailable to the current environment falls back to automatic device timezone and allows the user to choose another timezone.
- Loss of network access after initial load does not remove clock updates, settings, or the saved timezone.
- The install control is not shown when the browser reports that the application is already installed or launched in its installed context.
- The guidance overlay can be dismissed, does not trap focus after closing, and remains readable on small screens.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST present decimal time as the primary clock using 10 decimal hours per standard day, 100 decimal minutes per decimal hour, and 100 decimal seconds per decimal minute.
- **FR-002**: The application MUST display decimal time in `H:MM:SS` format, with the decimal hour in the range 0 through 9 and decimal minutes and seconds zero-padded from 00 through 99.
- **FR-003**: The application MUST derive decimal time from the proportion of the current local day elapsed at the current instant in the selected timezone, rather than independently incrementing a prior displayed value.
- **FR-004**: The application MUST treat the selected timezone's local day boundary as the start and end of the decimal day, including timezone offset and daylight-saving behavior supplied by the selected timezone.
- **FR-005**: The application MUST show conventional time immediately below the decimal clock as secondary information and MUST represent the same current instant.
- **FR-006**: The application MUST default to the device timezone through automatic timezone mode.
- **FR-007**: The application MUST allow users to choose a named timezone through a searchable selector and MUST apply that choice to decimal time, conventional time, and all related labels.
- **FR-008**: The application MUST allow users to return to automatic device-timezone mode.
- **FR-009**: The application MUST save the user's timezone mode and named timezone choice locally and restore it when the application is reopened.
- **FR-010**: Version 1 settings MUST contain automatic timezone mode, the searchable timezone selector, standard-time visibility, and Always On mode.
- **FR-011**: The application MUST update both clocks smoothly and promptly from a current time source, without visible drift, lag, jitter, or dependence on accumulated update intervals.
- **FR-012**: The application MUST reserve space at the top of the screen for a future logo without allowing that reserved space to obscure or displace the clock content unexpectedly.
- **FR-013**: The application MUST center a dominant, high-contrast, stable decimal clock and place the smaller conventional clock immediately beneath it.
- **FR-014**: The application MUST provide a bottom-right settings icon that opens a dismissible settings panel.
- **FR-015**: The application MUST show an install-app control at the bottom left when running in a browser and the application is not installed, and MUST hide that control when the application is already installed or running from its installed context.
- **FR-016**: On iPhone, activating the install-app control MUST show an accessible guidance overlay with the ordered steps Share, Add to Home Screen, and Add.
- **FR-017**: The application MUST remain usable after initial load or installation without network access, including both clocks, settings, timezone search choices, and the saved timezone.
- **FR-018**: The application MUST be installable, launchable from a device home screen, offline capable, and usable on mobile-sized screens.
- **FR-019**: The application MUST provide responsive text sizing and layout behavior for phone, tablet, and desktop widths without overlap, clipping, or avoidable layout shift when digits change.
- **FR-020**: All interactive controls and overlays MUST be keyboard accessible, have understandable accessible names and states, expose meaningful semantic structure, and provide visible focus indication.
- **FR-021**: The application MUST use high-contrast presentation and screen-reader-compatible text for both clock values, timezone state, settings, install control, and iPhone guidance.
- **FR-022**: The application MUST avoid accounts, authentication, social sharing, analytics, advertising, cloud synchronization, decimal calendars, stopwatches, countdown timers, widgets, native iOS implementation, clock animations, charts, educational explanations, and unnecessary decorative content in version 1.
- **FR-023**: The application MUST not require user data collection or transmission for core clock functionality.
- **FR-024**: The decimal clock display SHOULD refresh at least 10 times per second while the application is active and visible, ensuring smooth progression of decimal time while avoiding unnecessary CPU or battery consumption.
- **FR-025**: The application MUST include automated tests validating decimal conversion against these known reference values: `00:00:00 = 0:00:00`, `06:00:00 = 2:50:00`, `12:00:00 = 5:00:00`, `18:00:00 = 7:50:00`, and `24:00:00 = 0:00:00` for the next day. These tests MUST be part of the implementation verification strategy.
- **FR-026**: The application MUST reserve a fixed logo region above the primary clock display. The absence of a logo asset MUST NOT significantly reduce the size, readability, prominence, or visual balance of the decimal clock.

### Key Entities

- **Current Instant**: The moment being displayed by both clocks.
- **Decimal Day Position**: The elapsed proportion of the selected timezone's local day, converted into decimal hours, minutes, and seconds.
- **Timezone Mode**: The user's choice between automatic device timezone and a named timezone.
- **Timezone Selection**: A named location/timezone used to determine local date, day boundary, labels, conventional time, and decimal time.
- **Install Guidance State**: The browser or installed-context state that determines whether the install control is shown and whether iPhone guidance is open or dismissed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In boundary tests covering midnight, exact half-day, end-of-day rollover, timezone changes, and daylight-saving transitions, 100% of displayed decimal values match the selected local-day proportion and remain within the valid `H:MM:SS` ranges.
- **SC-002**: In a side-by-side observation across at least 10 minutes, the decimal and conventional clocks continue to represent the same instant with no visible drift, missed rollover, or recurring lag.
- **SC-003**: At least 95% of first-time users can identify the current decimal time within 5 seconds of opening the application without reading supporting instructions.
- **SC-004**: At least 95% of tested users can select a timezone, see both clocks and labels update, close and reopen the application, and confirm the choice is retained without assistance.
- **SC-005**: After initial load or installation, 100% of core clock, settings, timezone persistence, and install-context checks pass during a network-disabled launch.
- **SC-006**: At least 95% of tested users can complete the iPhone guidance sequence in the displayed order and dismiss the overlay without losing the clock view.
- **SC-007**: Responsive checks at representative phone, tablet, and desktop widths show no clipped clock values, overlapping controls, or avoidable layout shifts during digit changes.
- **SC-008**: Keyboard and screen-reader accessibility checks identify every actionable control and communicate both current clock values and timezone mode without requiring color, position, or visual styling alone.
- **SC-009**: In a 30-minute mobile observation, clock updates remain smooth and the application shows no user-visible interruption attributable to excessive resource use.

## Assumptions

- The device provides a current system time and timezone information; automatic mode uses the device's current timezone setting.
- A standard day means the local calendar day selected by the active timezone. Where local-day duration differs because of a timezone transition, decimal position is based on elapsed time within that actual local day.
- Decimal values are rounded to the nearest displayed second with carry into the next unit handled consistently; the exact rollover instant always takes precedence over a rounded prior value.
- The searchable timezone list uses recognizable location names and includes the timezones supported by the user's environment.
- Local persistence is available in the browser after the initial load; if it is unavailable, the current session remains usable and the application communicates that the choice could not be retained.
- The browser can report whether the application is installed or running in an installed context; unsupported browsers may keep the install control available.
- iPhone installation guidance is informational and does not automate Apple's home-screen actions.
- PWA installation and offline support are part of the version 1 product experience, while a native iOS application remains out of scope.
- Future logo, custom branding, transition animations, native iOS support, and additional decimal utilities remain future considerations and are not required for this feature.
