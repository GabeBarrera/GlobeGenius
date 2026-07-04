# Globe Studio

An interactive 3D globe (and flat-map) framework for authoring and presenting
geographic flow data — trade routes, migrations, supply chains, historical
networks. Countries are colored by role, connections are drawn as curved bands
whose thickness scales with value, and each globe can carry markers, guided
"scenes", a write-up, and cited sources.

Two example globes ship with it: **Global Coffee Supply Chain** and **The
Atlantic Triangle Trade**.

---

## Quick start

### Option A — with the local server (recommended)

Lets you edit globes in the browser and have changes saved back to disk.

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

Just serve the folder. There's no server to save changes, so the app shows a
gray **Server Offline** badge and keeps any edits in the browser's local
storage (per-browser, not written to the shared JSON file).

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

You can also **Export JSON** / **Import JSON** from the Globes drawer to move a
single globe between machines.

---

## Using the app

Top-left:
- **Globes** — open the library drawer to search, switch, add, duplicate,
  import, export, or delete globes.
- **Server Online / Offline** badge — whether changes are being saved to disk.

Top-right:
- **Rotation** — start/stop auto-spin (globe mode).
- **☰ menu** — Edit globe, Data table, Flat map ⇄ Globe, and Dark mode.

Editing a globe (menu → **Edit globe**) opens a side panel with **Save** and
**Discard**:
- Changes stay in memory while you edit.
- **Save** writes them to `data/globe_data.json` (or local storage if offline)
  and shows a **Changes saved** confirmation.
- **Discard** reverts to the state before you started editing (and removes a
  brand-new globe entirely).
- Deleting a globe shows a **Globe deleted** confirmation once written.

The editor's tabs cover countries/roles, connections (with draggable
from/to pins on the map), markers, scenes, catalogue metadata, and a rich-text
write-up.

---

## Mobile / small screens

Below 640px wide the UI adapts automatically: the role legend collapses to a
compact strip above the scene stepper, the globe title shrinks and wraps clear
of the bottom controls, the subtitle and on-screen zoom buttons are hidden
(pinch to zoom), and the editor panel fits the screen width. It re-lays-out live
as the window resizes.

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
server.js            Local server + save API (Node, no dependencies)
data/
  globe_data.json     All globe data
```
