# Features

A complete list of what the todo application does. (The brief notes that
undocumented features won't be considered, so everything implemented is listed
here.)

## Frontend (multi-page React)

### Architecture
- **True multi-page app**, not a SPA. Two separate HTML documents:
  - `index.html` → **Todos list page**
  - `todo.html` → **Single todo page**
- Navigation between pages is a **full browser page load** (real `<a href>`
  links and `window.location`), built with Vite's multi-page configuration.

### Todos list page (`/` → `index.html`)
- **Create a todo** via a form with: title (required), description, priority
  (low / medium / high), and due date.
- **List all todos**, each showing title, priority badge, due date, and a
  description snippet.
- **Toggle complete/incomplete** with a checkbox (optimistic UI update).
- **Delete a todo** with a confirmation prompt (optimistic, with rollback on
  error).
- **Open a todo's detail page** via the title link or the "Open" button
  (navigates to `todo.html?id=<id>`).
- **Filter** by status: All / Active / Completed (segmented control).
- **Search** todos by title or description (debounced, server-side).
- **Sort** by newest, oldest, or priority (high → low).
- **Live stats**: "*N* shown · *M* remaining".
- **Overdue indicator**: incomplete todos past their due date are highlighted.
- **Empty / loading / error states**, including a clear message when the API is
  unreachable.
- **Inline validation errors** surfaced from the API (e.g. empty title).

### Single todo page (`todo.html?id=<id>`)
- **Reads the todo id from the `?id=` query parameter** and fetches that todo.
- **Read-only details panel**: id, created timestamp, last-updated timestamp.
- **Edit form** for title, description, priority, due date, and completed.
- **Save changes** (`PUT`) with a "Saved ✓" confirmation and inline field
  errors.
- **Delete** the todo, then redirect back to the list.
- **Back to all todos** link.
- **Graceful handling** of a missing/invalid id or a not-found todo.

### Cross-cutting
- Responsive, dark-themed UI shared via one stylesheet.
- Centralised API client with friendly network-error messages.
- Configurable API base URL via `VITE_API_BASE`.

## Backend (Express REST API)

### CRUD endpoints (see [API.md](API.md) for full details)
- `GET    /api/todos` — list, with **filtering** (`status`), **search** (`q`),
  and **sorting** (`sort`).
- `GET    /api/todos/:id` — fetch one.
- `POST   /api/todos` — create.
- `PUT    /api/todos/:id` — update (**partial** updates supported).
- `DELETE /api/todos/:id` — delete.
- `GET    /api/health` — liveness check.

### Data & persistence
- **File-based storage** in `data/todos.json` (no database required to run).
- **Serialised writes** through a promise queue so concurrent read-modify-write
  requests cannot corrupt the data file.
- Server-managed **UUID ids** and **`createdAt` / `updatedAt` timestamps**.
- Ships with **seed data** so the app is non-empty on first run.

### Validation & errors
- Request **validation** with a per-field error map (`title` required, length
  limits, `priority` enum, `dueDate` parseable, `completed` boolean).
- Consistent **error envelope** (`{ error: { message, details } }`).
- Proper status codes: `200 / 201 / 204 / 400 / 404 / 500`.
- Handles **malformed JSON** bodies and **unknown routes** cleanly.

### Operational
- **CORS** enabled for the frontend.
- **Request logging** (method, URL, status, duration).
- **Async error handling** wrapper so rejected promises never crash the process.
- **Smoke test** (`npm run test:api`) exercising the full lifecycle (15 checks).
- Configurable **port** via the `PORT` env var (default `4000`).
