# Persistence and PWA Contract

## Preferences Record

Storage key: `metric-clock:preferences:v1`

JSON shape:

```json
{
  "version": 1,
  "mode": "automatic",
  "timeZone": "America/New_York"
}
```

`mode` is required and is either `automatic` or `named`. `timeZone` is required only for `named` and must be an available IANA identifier. Unknown, malformed, or inaccessible records are ignored and produce automatic mode for the current session. Writes are best effort and must never block clock rendering.

## Manifest and Service Worker

The app publishes a manifest with a name, temporary Metric Clock branding, standalone display mode, suitable icons, and a start URL. The service worker uses cache-first behavior for the versioned application shell and bundled timezone catalog. A new build uses a new cache name and removes obsolete caches during activation. Runtime clock calculation, settings interaction, and localStorage do not require network access.

## Install Detection

Installed mode is true when `matchMedia('(display-mode: standalone)')` matches or iOS `navigator.standalone` is true. `beforeinstallprompt` is captured when available and consumed only after the install control is activated. The control is hidden when installed; unsupported browsers may keep it visible and use the informational/iPhone path.

The web contract cannot automate iOS native Share, Add to Home Screen, Add confirmation, or physical standalone relaunch. Those are manual acceptance checks documented in `quickstart.md`.
