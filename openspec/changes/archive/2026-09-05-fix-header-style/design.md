# Fix Header Style — Design

## Overview

Fix three visual bugs in `assets/css/custom.css` with three targeted edits. No layout restructuring, no new classes, no JavaScript changes.

## Edits

### Edit 1 — `.site-brand`: `sticky` → `fixed` + background

| Before | After |
|---|---|
| `position: sticky;` | `position: fixed;` |
| *(no background)* | `background: #fff;` |
| *(no border)* | `border-bottom: 1px solid #eaeef2;` |

- `position: fixed` keeps the header in the viewport during overscroll bounce, matching the sidebar's `position: fixed` behavior.
- `background: #fff` and `border-bottom: 1px solid #eaeef2` provide visual containment so scrolling content does not bleed through.

### Edit 2 — Mobile sidebar: hide container completely

In the `@media (max-width: 899px)` block:

| Before | After |
|---|---|
| `.site-sidebar nav { display: none; }` | `.site-sidebar { display: none; }` |

This removes the sidebar entirely (including its `border-bottom`) on mobile, not just its nav content.

### No change needed for `.main`

`.main { padding-top: var(--header-h); }` already correct — with `position: fixed`, the header is out of the document flow at all breakpoints, so the padding is needed universally. No scoping required.

## Visual comparison

- **Desktop**: Header now has a white background and border. During overscroll, header stays fixed at top, sidebar stays fixed below header — no desync.
- **Mobile (<900px)**: No sidebar shown at all. Header has background. No extra gap below header.
