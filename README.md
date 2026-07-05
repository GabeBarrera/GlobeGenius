# Globe Genius

An interactive 3D globe (and flat-map) framework for authoring and presenting
geographic flow data — trade routes, migrations, supply chains, historical
networks. Countries are colored by role, connections are drawn as curved bands
whose thickness scales with value, and each globe can carry markers, guided
"scenes", a write-up, and cited sources.

Four example globes ship with it: **Global Coffee Supply Chain**, **The
Atlantic Triangle Trade**, **World War II: A Global Conflict**, and **A History
of Cyber Attacks**. All four come with pre-filled write-ups; new built-in
globes are merged into older saved databases automatically.

---

## Quick start

### Option A — with the local server (full editing)

Lets you manage the library and edit globes in the browser, with changes saved
back to disk.

```bash
node server.js
```

Then open **http://localhost:8000**. Requires Node.js (no npm install — it uses
only built-in modules). The header shows a green **Server Online** badge and
every add / edit / delete is written to `data/globe_data.json`.

Change the port with an env var:

```bash
PORT=9000 node server.js
```

### Option B — static hosting (GitHub Pages, Netlify, any static host)

Just serve the folder. This is **viewer mode with personal notes**: there is no
badge and no library management —

- The Globes drawer lets you browse, search, and switch globes, but the
  **+ New globe / Duplicate / Export JSON / Import JSON / Delete** actions are
  hidden (they require the server).
- The editor is reduced to **Markers** and a personal **Notes** tab (see
  below). The Countries, Connections, Scenes, Info, and Write-up tabs are
  server-only.
- Any changes you can make are kept in the browser's local storage only.

> Open it through a web server, not by double-clicking the file. A `file://`
> URL can't `fetch()` the data file. `node server.js`, `python3 -m http.server`,
> or any static host all work.

---

## What you need to host it

| File | Required | Purpose |
|------|----------|---------|
| `index.html` | yes | The app |
| `support.js` | yes | Runtime the app is built on |
| `data/globe_data.json` | yes | All globe data (the source of truth) |
| `server.js` | only for Option A | Local server + save API |

The globe rendering library (amCharts 5) loads from a CDN at runtime, so an
internet connection is needed to draw the map.

---

## Where data lives

`data/globe_data.json` holds the full database: `{ docs: [...], currentId, dark }`.

- **Server running:** the file is the source of truth. The app loads from it and
  writes back to it on every change.
- **No server:** the app loads initial content from the file, then any edits you
  make are stored only in your browser's local storage. Your local edits take
  precedence over the shipped file on reload, so nothing is lost.
- **Personal notes** (static hosting) are stored separately in local storage
  (`globe-studio-notes-v1`), keyed per globe — they never touch the JSON file.

With the server running you can also **Export JSON** / **Import JSON** from the
Globes drawer to move a single globe between machines.

---

## Using the app

Top-left:
- **Globes** — open the library drawer to search and switch globes. With the
  server running it also offers **+ New globe, Duplicate, Export JSON,
  Import JSON,** and **Delete this globe**.
- A green **Server Online** badge appears when the Node server is detected;
  when hosted statically no badge is shown.

Top-right:
- **Rotation** — start/stop auto-spin (globe mode).
- **☰ menu** — Edit globe, Data table, Flat map ⇄ Globe, and Dark mode.

Right edge (view mode):
- **About** pull-out tab — the globe's write-up, sources, and archive stamp.
- **Notes** pull-out tab (static hosting only) — appears just below About once
  you've written a note for the current globe.
- Selecting either tab slides the panel out and both tabs travel with its edge;
  the active tab is highlighted, and clicking the other tab switches the panel
  to that content. The ✕ (or the active tab) closes it.

Viewing extras:
- **Deep links** — the URL hash tracks the current globe, scene and projection;
  menu → **Copy link to view** also captures the exact camera angle so a pasted
  link reopens precisely that view.
- **Scene auto-play** — the ▶ button in the scene stepper advances scenes on a
  9-second timer with a progress bar; stop with ■, Esc, or by dragging the globe.
- **Timeline** — when a globe's connections carry years (WWII and Cyber Attacks
  do out of the box), a scrubber appears above the scene bar; drag it to reveal
  connections cumulatively by year. Set a connection's year in the editor's
  Connections tab.
- **Export image (PNG)** — in the ☰ menu, downloads the current view.
- **Keyboard** — ← → step scenes, Space toggles rotation, Esc closes/cancels.
- A first-run welcome card introduces the controls (shown once per browser),
  and a loading / "map could not load" screen covers CDN startup.

Auto-rotation:
- Dragging the globe (or stepping through scenes) pauses the spin; it
  **resumes automatically after 20 seconds** without interaction.
- Pausing with the **Rotation** button is explicit — it stays paused until you
  press it again.

### Editing with the server (menu → **Edit globe**)

Opens a side panel with **Save** and **Discard**:
- Changes stay in memory while you edit.
- **Save** writes them to `data/globe_data.json` and shows a **Changes saved**
  confirmation.
- **Discard** reverts to the state before you started editing (and removes a
  brand-new globe entirely).
- Deleting a globe shows a **Globe deleted** confirmation once written.

The editor's tabs cover countries/roles, connections (with draggable
from/to pins on the map), markers, scenes, catalogue metadata, and a rich-text
write-up. Each connection's **Path** setting offers *shortest path*, *optimal
route (cross date line)* — for Pacific-crossing routes that would otherwise
circle the globe the long way — or forcing the band to head *east*/*west*.

### Editing without the server (static hosting)

**Edit globe** opens the same panel with two tabs:
- **Markers** — add/move/delete pins, dots, and labels (saved to this browser).
- **Notes** — a personal rich-text scratchpad for the current globe, with the
  same formatting toolbar as the write-up editor (headings, lists, alignment,
  fonts, pictures). Notes are private to this browser, saved per globe, and
  surface through the **Notes** pull-out tab in view mode.

---

## Mobile / small screens

Below 640px wide the UI adapts automatically: the role legend moves to a strip
directly under the top toolbar (above the globe), the globe title shrinks and
wraps clear of the bottom controls, the subtitle and on-screen zoom buttons are
hidden (pinch to zoom), the About/Notes panels open full-width (their edge tabs
hide while open; close with ✕), and the editor panel fits the screen width. It
re-lays-out live as the window resizes.

---

## The server API

`server.js` serves the static files and exposes three endpoints:

| Method & path | Purpose |
|---------------|---------|
| `GET /api/health` | Liveness probe the app uses to detect the server |
| `GET /api/globes` | Returns the contents of `data/globe_data.json` |
| `POST /api/globes` | Writes the posted `{ docs, ... }` back to the file |

`POST` validates that the body contains a `docs` array before writing and caps
the request size at 25 MB.

---

## Project structure

```
index.html            The app
support.js            Runtime
server.js             Local server + save API (Node, no dependencies)
data/
  globe_data.json     All globe data
```
