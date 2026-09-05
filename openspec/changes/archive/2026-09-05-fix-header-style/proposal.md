## Why

The site header (`.site-brand`) has no background, so text overlaps scrolling content. On mobile an extra `padding-top` on `.main` creates a visible gap. During overscroll bounce, the sticky header and fixed sidebar desynchronize — header scrolls away while the sidebar stays put. The sidebar's border also remains visible on mobile even after its navigation is hidden.

## What Changes

1. **Header background**: Add `background: #fff` (and `border-bottom`) to `.site-brand` so content does not show through when scrolling.
2. **Header position**: Change `.site-brand` from `position: sticky` to `position: fixed` so the header and sidebar (both `position: fixed`) stay synchronised during overscroll bounce.
3. **Mobile sidebar**: Replace `.site-sidebar nav { display: none }` with `.site-sidebar { display: none }` to hide the sidebar container (including its border) on screens <900px.
4. **Remove `.main` padding-top scoping**: The existing `.main { padding-top: var(--header-h) }` is correct and unscoped — with a `fixed` header it applies at all breakpoints, so leave it unchanged.

## Capabilities

### New Capabilities
*(none — this is a pure CSS visual fix)*

### Modified Capabilities
*(none — no spec-level behavior changes)*

*Note: This change sets `skip_specs: true` in `.openspec.yaml` because no capabilities or behavioral requirements are being introduced or modified.*

## Impact

- **File changed**: `assets/css/custom.css` only
- **No markup changes**: `_layouts/default.html`, `_includes/head-custom.html`, and JS files are untouched
- **No dependency changes**: Same fonts, same theme
