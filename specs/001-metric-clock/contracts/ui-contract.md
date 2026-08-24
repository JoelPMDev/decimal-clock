# UI Contract

## Main Clock View

The application exposes one primary view with:

- A fixed top logo region showing temporary text `Metric Clock`.
- A primary `DECIMAL TIME` display in `H:MM:SS` format.
- A secondary `LOCAL TIME` display representing the same instant.
- A friendly active timezone label and mode state.
- A bottom-left install control when not installed.
- A bottom-right settings button with an accessible name and pressed/open state.

The clock values are rendered from one `Display Snapshot`; components do not independently sample the system clock.

## Settings Drawer

The settings button opens a right-side semantic `aside` or dialog drawer. V1 contains only:

- Automatic device timezone option.
- Search input with an accessible label.
- Searchable named timezone options, including recognizable London, New York, and Tokyo labels.
- Show Standard Time toggle, enabled by default.
- Decimal separator selector with colon, decimal point, hyphen, and slash options.
- Always On Mode toggle.
- Selected state, empty-result state, close button, and keyboard Escape handling.

Opening records the invoking control; closing returns focus to it. Selection updates both clock labels and values immediately.

## Install Guidance

The install control is hidden in standalone/installed mode. On supported browsers it invokes the deferred native install prompt from a user gesture. On iPhone it opens a dismissible accessible dialog whose ordered steps are Share, Add to Home Screen, and Add. Closing returns focus to the install control and does not interrupt the clock.

## Accessibility Requirements

All controls have accessible names, current selection/state, visible focus indication, and keyboard operation. Clock values have readable semantic text independent of styling. Rapid clock changes must not create an assertive live-region announcement on every frame.
