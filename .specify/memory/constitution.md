<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles: template principles replaced with five Metric Clock principles
- Added sections: Product and Architecture Constraints; Design and Platform Standards;
	Development Workflow and Decision Rules
- Removed sections: none; template placeholders were replaced
- Templates requiring updates: .specify/templates/plan-template.md (reviewed, no update needed);
	.specify/templates/spec-template.md (reviewed, no update needed);
	.specify/templates/tasks-template.md (reviewed, no update needed)
- Command files requiring updates: none; installed Spec Kit commands use generic constitution guidance
- Follow-up TODO: confirm the historical ratification date
-->

# Metric Clock Constitution

## Core Principles

### I. Simplicity First
Metric Clock MUST remain focused on one job-to-be-done: helping a user know the
current decimal time. Every proposed feature MUST identify a direct improvement to
that job and MUST be rejected or deferred when it adds complexity without clear user
value. Version 1 MUST exclude accounts, authentication, cloud sync, social features,
decimal calendars, tutorials, analytics, advertising, and backend infrastructure.

### II. Accuracy Above All
The application MUST divide each standard 24-hour day into 10 decimal hours, each
decimal hour into 100 decimal minutes, and each decimal minute into 100 decimal
seconds. The displayed decimal format MUST be `H:MM:SS`, with hours from 0 through 9
and minutes and seconds zero-padded from 00 through 99.

Decimal time MUST be derived from the current instant and the selected timezone's
local day boundary. The implementation MUST document and test its treatment of
timezone offsets, daylight-saving transitions, midnight rollover, and rounding or
carry behavior. Conventional time MUST represent the same instant as the decimal
time, not an independently sampled moment.

### III. Performance and Continuity
The clock MUST feel immediate, update continuously, and avoid visible drift or
jitter. Rendering updates MUST be scheduled efficiently and MUST recalculate from a
current time source rather than accumulating prior display increments. Core clock
functionality MUST use minimal CPU, memory, and battery resources, especially on
mobile devices.

### IV. Client-Side and Offline by Default
Version 1 MUST run entirely in the browser without a backend, database, account, or
API dependency for core functionality. Time conversion and display logic MUST remain
usable after the initial application load when network connectivity is unavailable.
The architecture MUST keep the clock domain logic independent from hosting concerns so
that PWA installation and native iOS experiences can be added later without changing
the product's core behavior.

### V. Accessible Clarity
The primary decimal clock MUST be the dominant visual element. Conventional time MUST
appear beneath it as secondary information with a smaller visual treatment. The
interface MUST prioritize legibility, high contrast, responsive sizing, keyboard
access, meaningful semantic structure, and screen-reader-compatible labels. New work
MUST preserve applicable WCAG compliance and MUST include an accessibility check when
it changes user-facing interaction or presentation.

## Product and Architecture Constraints

- Version 1 MUST be a responsive web application usable on mobile, tablet, and desktop
	screen sizes.
- The default timezone MUST be the device timezone. Users MUST be able to select a
	different timezone, and that selection MUST be applied consistently to both clock
	displays and all related labels.
- Timezone handling MUST use reliable platform or library timezone data rather than a
	hand-maintained offset table.
- The clock domain MUST be separated from the UI so that decimal conversion can be
	tested independently and reused by future PWA or iOS clients.
- The application MUST avoid collecting or transmitting user data for core clock
	functionality. Any future data-related feature requires an explicit amendment to
	this constitution and a privacy review.

## Design and Platform Standards

- Visual design MUST be minimalist and content-led, with clarity favored over
	decoration and no unnecessary educational explanation in the primary experience.
- Layouts MUST remain stable while digits change; updates MUST NOT cause avoidable
	shifting, overlap, or loss of readability.
- Responsive behavior MUST be verified at representative narrow mobile, tablet, and
	desktop widths before release.
- The product MAY add PWA capabilities, additional clock functions, or native iOS
	clients only when those additions preserve the single-purpose experience and do not
	require a complete redesign.
- Analytics, advertising, social features, and cloud services MUST NOT be introduced
	as incidental dependencies.

## Development Workflow and Decision Rules

- Every feature specification, implementation plan, and task list MUST include a
	Constitution Check against the rules in this document.
- Changes to decimal conversion, timezone behavior, update scheduling, or display
	formatting MUST include focused automated tests for the affected boundary cases.
- User-facing changes MUST be reviewed for accuracy, performance, responsive layout,
	and accessibility before implementation is considered complete.
- When requirements conflict, contributors MUST prioritize accuracy, accessibility,
	and the core clock experience in that order, then choose the least complex design
	that satisfies the remaining requirements.
- Technical complexity MUST be justified in the implementation plan. Contributors
	MUST prefer platform capabilities and existing project patterns over new services or
	dependencies.
- A release MUST not knowingly ship a broken core clock, incorrect timezone result,
	inaccessible primary display, or offline failure caused by an avoidable network
	dependency.

## Governance

This constitution is the highest-level product and engineering guidance for Metric
Clock. It supersedes conflicting local conventions unless a later amendment explicitly
changes the rule. All feature specs, plans, tasks, code reviews, and release checks
MUST verify compliance with the applicable principles.

Amendments MUST describe the motivation, affected principles, compatibility impact,
and required migration or follow-up work. A constitution amendment requires review by
the project owner before implementation work that depends on the changed rule begins.
The constitution version follows semantic versioning: MAJOR for incompatible changes
or removals, MINOR for new principles or materially expanded requirements, and PATCH
for clarifications or non-semantic corrections. The last-amended date MUST be updated
for every accepted amendment.

Compliance MUST be reviewed at planning, implementation, and release checkpoints.
Unresolved violations MUST be recorded as explicit risks or tasks; they MUST NOT be
silently ignored. The constitution and its dependent templates MUST be checked when
Spec Kit workflows are upgraded.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date | **Last Amended**: 2026-08-15
