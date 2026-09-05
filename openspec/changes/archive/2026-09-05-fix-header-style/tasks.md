# Fix Header Style — Tasks

## Prerequisites

- [x] Change creation complete
- [x] No specs needed (`skip_specs: true`)

## Tasks

### 1. Edit `.site-brand` in `assets/css/custom.css` ✅

**File**: `assets/css/custom.css:39-56`  
**Changes**:
1. `position: sticky` → `position: fixed`
2. Add `background: #fff`
3. Add `border-bottom: 1px solid #eaeef2`

**Verification**: Open a scrollable page (e.g. a long post), scroll down. Header text must not overlap content. On overscroll bounce, header must stay fixed.

### 2. Hide sidebar container on mobile ✅

**File**: `assets/css/custom.css:148-152`  
**Change**: `.site-sidebar nav { display: none; }` → `.site-sidebar { display: none; }`

**Verification**: Resize browser to <900px. Sidebar must be completely invisible (no border, no padding). Only the header and main content should be visible.

### 3. Verify responsive layout ✅

**Test both breakpoints**:
- **≥900px**: Desktop layout — fixed sidebar on the left, fixed header on top, main content starts below header and to the right of sidebar.
- **<900px**: Mobile layout — fixed header at top, main content fills viewport, no sidebar visible.

**Verification**: No layout shifts, no gaps, no visible regressions. Scroll on both sizes and confirm header stays fixed with a solid background.
