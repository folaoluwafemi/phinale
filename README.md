# Phinale — New-Tab Infinite Canvas for Ideas

> Local-first browser extension that replaces Chrome's New Tab with an infinite canvas (Miro / Figma-like) for dumping links, text, and context. No cloud. Export everything as JSON.

## 1. Idea Analysis

### Problem
Lots of random ideas come from links seen online or texted, plus copy-pasted snippets and stuff already in your head. Current options are fragmented:
- Bookmarks → die, no context
- Notes apps → require switching context, not at point of capture
- Miro / Figma / whiteboards → cloud-locked, heavy, overkill for quick dump
- New Tab page → wasted space (shortcuts you never use)

### Insight
The New Tab page is the highest-frequency surface you own. Every `Ctrl+T` (`Cmd+T` on macOS) is an intent to start something. Hijacking it turns capture from a deliberate action into a default behavior.

### Solution: Phinale
Override Chrome New Tab with a persistent, infinite canvas:
1. Open new tab → you're home
2. Paste whatever you found (URL, text, image, snippet)
3. Optionally add context (why it matters, where it came from, what to do with it)
4. It stays there as an artifact on the canvas, spatially arranged
5. No account, no sync, no server — stored locally in the browser
6. Export all to JSON anytime

### Core Loop
```
see something → Ctrl+T (Cmd+T on macOS) → paste → add context (optional) → drag to place → close, it's saved
```

## 2. Product Definition

### What it is
- Chrome Extension (Manifest V3) with `newtab` override — cross-platform by design (Windows, macOS, Linux, ChromeOS; any Chromium browser: Chrome, Edge, Brave, Arc)
- Full-page React app: infinite pan/zoom canvas
- Artifact-based: every paste creates a card/node on canvas
- Dev environment: Windows-first (PowerShell), but all scripts cross-platform via Vite/npm (no bash-only or macOS-only tooling)

### What it is NOT (v1)
- No cloud sync, no accounts, no collaboration
- No AI auto-organization (future)
- No mobile app (future — import JSON)

### Artifact Types (v1)
1. **Link** — URL + auto-fetched title / og:image / favicon + user note
2. **Text / Snippet** — raw pasted text + optional source URL
3. **Note** — free-written context / idea from head

Future types: image, file drop, tweet/thread embed, todo checkbox.

### Data Model
```ts
type Artifact = {
  id: string; // nanoid / uuid
  type: 'link' | 'text' | 'note';
  content: string; // raw text or URL
  context?: string; // user-added "why this matters"
  source?: string; // where it came from (optional URL)
  meta?: {
    title?: string;
    favicon?: string;
    ogImage?: string;
  };
  position: { x: number; y: number };
  size?: { w: number; h: number };
  color?: string;
  createdAt: number;
  updatedAt: number;
};

type CanvasState = {
  artifacts: Artifact[];
  viewport: { x: number; y: number; zoom: number };
  version: 1;
};
```

## 3. UX Design

### Layout
- Full-viewport infinite canvas, subtle dot grid
- Minimal top bar: search, `+ Add` / `Paste`, Export JSON, zoom controls
- Bottom hint: `Paste anywhere to create • Drag to pan • Scroll to zoom`
- No onboarding wall — empty state shows 3 ghost cards as example

### Interactions
- **Paste anywhere** (`Ctrl+V` on Windows/Linux, `Cmd+V` on macOS): if clipboard is URL → link card, else → text card. Focused input fields exempt.
- **Quick add**: `+` button or `N` key → empty note focused at viewport center
- **Context**: click card → expand to add/edit `context` field
- **Canvas**: drag empty space to pan, wheel to zoom, drag card to move
- **Actions per card**: edit context, change color, duplicate, delete, copy, open link
- **Search**: filter by content / context (`/` to focus)

### Infinite Canvas Approach
Don't build pan/zoom from scratch. Use:
- Option A: `@xyflow/react` (React Flow) — nodes + viewport + minimap for free, easiest
- Option B: `tldraw` SDK — full whiteboard primitives, heavier
- Option C: custom `<canvas>` + transform matrix — max control, most work

Recommendation for v1: **React Flow**. Artifacts = custom nodes. You get pan/zoom, minimap, serialization for free.

## 4. Technical Architecture

### Stack
- **Manifest V3**, Vite + React + TypeScript + Tailwind
- Canvas: `@xyflow/react`
- Persistence: `IndexedDB` via `dexie` (handles large canvas better than `chrome.storage.local` 5-10MB quota)
- Fallback mirror to `chrome.storage.local` for viewport only if needed
- Export: client-side `Blob` download `phinale-export-YYYY-MM-DD.json`

### Extension Files (feature-based, file-based routes)
```
phinale/
  newtab.html                 # route entry -> src/main.tsx -> src/routes/canvas.tsx
  public/manifest.json        # chrome_url_overrides.newtab + background service worker
  src/
    main.tsx                  # newtab entry (fonts, styles, route)
    background.ts             # context-menu "Send to Phinale" inbox
    routes/canvas.tsx         # file-based route: full canvas page + shortcuts
    features/
      artifacts/              # artifact domain
        types.ts              # Artifact, Viewport, ExportPayload
        components/ArtifactNode.tsx
      board/                  # infinite canvas surface
        BoardCanvas.tsx       # React Flow, pan/zoom, drop, viewport persist
        components/TopBar.tsx # search, +Add, Import/Export
        components/EmptyState.tsx
      capture/                # paste + image intake
        lib/paste.ts          # clipboard image/text/URL handling
        lib/images.ts         # webp compress, blob object-URL cache
      io/                     # local export/import
        lib/export.ts         # JSON with inline image dataURLs
    stores/useBoardStore.ts   # zustand + dexie autosave
    lib/db.ts                 # dexie: artifacts, blobs, viewport
    styles/tokens.css         # Clay + Cohere merged tokens
  DESIGN.cohere.md / clay/DESIGN.md  # design references
```

Key manifest (no `<all_urls>` — local-only privacy story):
```json
{
  "manifest_version": 3,
  "name": "Phinale",
  "version": "0.1.0",
  "chrome_url_overrides": { "newtab": "newtab.html" },
  "background": { "service_worker": "background.js" },
  "permissions": ["storage", "contextMenus"]
}
```

### Images — Local Only (no OS folder)
Extensions can't write to an arbitrary OS folder, so screenshots live in IndexedDB (`blobs` table, webp-compressed max 1600px) and render via lazily-created object URLs. Export inlines them as `imageDataUrl` in the JSON; Import rehydrates them back to blobs. No cloud, no server.

### Storage — Local Only
- No backend. All in IndexedDB (`phinale` DB, `artifacts` store).
- Autosave debounced (~300ms) on drag/edit/paste.
- Quota: IndexedDB ~ large (browser-managed), far better than `chrome.storage.local`.
- Export format:
```json
{
  "version": 1,
  "exportedAt": "2026-09-13T...",
  "artifacts": [...]
}
```
- Import (v1.1): file input restores same schema.

### Privacy
State explicitly in store listing: no network calls, no analytics in v1. Link unfurling must be local-only (no proxy) or deferred to v2 to keep this promise.

## 5. MVP Scope

**Done in v0.1:**
- [x] Newtab override renders canvas
- [x] Paste-to-create (image vs URL vs text) + drag-drop screenshots
- [x] Image artifacts: local IndexedDB blob store, webp compress, lazy object URLs
- [x] Add context to any artifact
- [x] Drag, pan, zoom, persists across restarts (viewport in Dexie meta)
- [x] Delete / duplicate / edit
- [x] Export JSON (images inline) + Import JSON restore
- [x] Search filter (`/`), quick-add (`N`), Clay + Cohere theme (Manrope + Spline Sans)

**Explicitly out of v0.1:**
- Link preview fetching, tags, folders, AI grouping, sync, sharing

### Build Order
1. Scaffold Vite + MV3 + newtab.html
2. React Flow canvas + viewport persistence
3. ArtifactNode UI + zustand store + Dexie
4. Global paste handler + quick-add
5. Export JSON (+ Import)
6. Polish: search, empty state, shortcuts

## 6. Future Ideas
- `Import JSON` restore, tags + color filters, minimap
- Right-click → "Send to Phinale" context menu
- `P` capture popup for copying without opening tab
- Local AI clustering ("group similar ideas") via on-device model
- Optional encrypted file sync (Drive/Dropbox as JSON, still no server)

## 7. Reference Commands

> Windows-first: use PowerShell. These commands work as-is on Windows, macOS, and Linux (npm/Vite are cross-platform). Don't use bash-only syntax in scripts.

```powershell
npm install
npm run build   # tsc + vite -> dist/
# chrome://extensions -> Developer mode -> Load unpacked -> select dist/
# Ctrl+T -> new tab shows Phinale canvas
```

### Try it
1. `Ctrl+T` → canvas loads (empty state shows 3 ghost cards)
2. Paste text or a URL → card appears at viewport center
3. Screenshot with `Win+Shift+S`, then `Ctrl+V` on the tab → image card
4. Click a card → add context; drag to arrange; reload → everything persists
5. Export JSON → `phinale-export-YYYY-MM-DD.json` (images inline as dataURLs)

### Compatibility Notes
- Extension runs anywhere Chromium runs (Windows / macOS / Linux / ChromeOS; Chrome, Edge, Brave, Arc).
- Storage (IndexedDB via Dexie) and export (`Blob` download) use web-standard APIs — no OS-specific code.
- Path handling: use `node:path` `join`/`resolve` and forward slashes in imports so builds work on Windows and Unix.
- Line endings: keep `LF`, let Git handle `CRLF` on Windows (`core.autocrlf=true`).
- Shortcuts: show `Ctrl` on Windows/Linux, `Cmd` on macOS (`navigator.platform` check).

---
Local-first, infinite, forgettable-in-the-best-way: open tab, dump brain, close tab.
