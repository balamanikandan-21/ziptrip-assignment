# Challenge 2 — Todo Application

A full-stack todo app:

- **Backend** — Node.js + Express REST API, CRUD for todos, **file-based**
  persistence (`backend/data/todos.json`).
- **Frontend** — a **multi-page** React application (built with Vite): a todos
  **list page** and a **single-todo page** that receives the todo id as a query
  parameter.

> 📄 Related docs: **[docs/FEATURES.md](docs/FEATURES.md)** (full feature list)
> and **[docs/API.md](docs/API.md)** (REST API reference).

---

## Prerequisites

- **Node.js ≥ 18** (developed and tested on Node 22). npm comes with Node.
- Two terminals (one for the API, one for the web app).

---

## Running the app

### 1. Backend (API) — http://localhost:4000

```bash
cd challenge-2/backend
npm install
npm start          # or: npm run dev   (auto-restart on file changes)
```

You should see `✅ Todo API listening on http://localhost:4000`.
Sanity check: open <http://localhost:4000/api/todos> — it returns JSON.

### 2. Frontend (web app) — http://localhost:5173

```bash
cd challenge-2/frontend
npm install
npm run dev
```

Open <http://localhost:5173>. The dev server proxies `/api/*` to the backend on
port 4000, so **both** servers need to be running.

### Production build of the frontend

```bash
cd challenge-2/frontend
npm run build      # outputs static files to dist/
npm run preview    # serves the build on http://localhost:4173 (also proxies /api)
```

---

## How it fits together

```
 Browser ──HTTP──▶  Vite dev server (5173)  ──/api proxy──▶  Express API (4000)
   │                  serves index.html                         │
   │                  & todo.html                               ▼
   └─ full page loads between pages                    data/todos.json (storage)
```

- The frontend talks to the API through a small client in
  [`frontend/src/api.js`](frontend/src/api.js). In dev it uses same-origin
  `/api/...` URLs (proxied by Vite); you can override the base with the
  `VITE_API_BASE` env var for a deployed API.
- The backend enables **CORS**, so the frontend can also call it cross-origin if
  you don't use the proxy.

---

## Project structure

```
challenge-2/
├── docs/
│   ├── API.md                  REST API reference
│   └── FEATURES.md             full feature list (what to evaluate)
│
├── backend/
│   ├── package.json
│   ├── data/todos.json         the persistence file (seeded with demo todos)
│   ├── scripts/smoke-test.js   end-to-end API test (npm run test:api)
│   └── src/
│       ├── server.js           process entry — starts the HTTP server
│       ├── app.js              builds the Express app (middleware + routes)
│       ├── config.js           paths, port, allowed priorities
│       ├── routes/todosRoutes.js
│       ├── controllers/todosController.js
│       ├── store/todoStore.js  file read/modify/write (serialised writes)
│       ├── middleware/errorHandler.js
│       └── lib/                HttpError, asyncHandler, validate
│
└── frontend/
    ├── index.html              entry: todos list page
    ├── todo.html               entry: single todo page  (?id=…)
    ├── vite.config.js          multi-page build + /api dev proxy
    └── src/
        ├── api.js              REST client
        ├── utils.js            date/priority helpers
        ├── shared.css          styling shared by both pages
        ├── components/PriorityBadge.jsx
        └── pages/
            ├── list/           ListApp.jsx  (+ main.jsx entry)
            └── todo/           TodoApp.jsx  (+ main.jsx entry)
```

---

## Design decisions & assumptions

- **"Multiple page instead of SPA" — taken literally.** Each page is a separate
  HTML document (`index.html`, `todo.html`) and navigating between them is a
  **full browser page load**, not client-side routing. This is wired up with
  Vite's multi-page build (two `rollupOptions.input` entries). I deliberately
  did **not** use React Router, because that produces a single-page app — the
  opposite of what the brief asked for.
- **The single-todo page reads `?id=<uuid>`** from the URL
  (`new URLSearchParams(window.location.search)`), exactly as specified, then
  fetches that todo and lets you view/edit/delete it.
- **Persistence is a JSON file** (`data/todos.json`). The brief allowed "a file
  or a database"; a file keeps the project zero-dependency to run (no DB to
  install). Writes are **serialised** through a promise queue so concurrent
  requests can't corrupt the file. The file is committed with a few seed todos
  so the app has demo data on first clone; it changes at runtime as you use the
  app.
- **IDs** are UUIDs (`crypto.randomUUID()`), and **timestamps**
  (`createdAt` / `updatedAt`) are managed server-side.
- **Validation** happens on the server; invalid requests get `400` with a
  per-field error map that the frontend surfaces inline.
- **No auth / multi-user** — out of scope for this assignment; the API is open
  on localhost.

---

## Testing

```bash
cd challenge-2/backend
npm run test:api     # boots the app and exercises the full CRUD lifecycle
```

This runs 15 assertions covering health, create, validation (400), read,
not-found (404), update, filtering, and delete (204). It uses the live store
and cleans up after itself.
