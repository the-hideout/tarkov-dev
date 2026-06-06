# Map Marker Builders

This directory contains marker builder modules extracted from `index.jsx` to keep map logic readable and reviewable.

## Modules

- `spawns.js` -> `buildSpawnMarkers(...)`
- `hazards.js` -> `buildHazardMarkers(...)`
- `tasks.js` -> `buildTaskMarkers(...)`
- `loot.js` -> `buildLockAndLooseLootMarkers(...)`

## Builder contract

Each builder should:

- be pure relative to map state (no hidden globals),
- receive all dependencies via arguments,
- add layers/markers through passed callbacks,
- avoid importing app-specific hooks or Redux state directly,
- keep behavior parity with previous inline implementation.

## Shared dependencies passed from `index.jsx`

Commonly passed helpers:

- `createMapMarker`
- `finalizeMarker`
- `addElevation`
- `positionIsInBounds`
- `checkMarkerBounds`
- `addLayer`

Leaflet helpers passed when needed:

- `outlineToPoly`
- `bindDynamicOutline`
- `mouseHoverOutline`
- `toggleForceOutline`

## Notes for contributors

- Prefer extending an existing builder over re-growing `index.jsx`.
- Keep marker popup content and filtering options backward-compatible.
- If a builder needs new dependencies, pass them explicitly from `index.jsx` instead of importing cross-module state.
