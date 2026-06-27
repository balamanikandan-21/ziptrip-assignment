# API Reference

Base URL (local): `http://localhost:4000/api`

All request and response bodies are JSON. Successful resource responses are
wrapped in a `data` envelope; list responses also include a `count`. Errors are
returned as `{ "error": { "message": ..., "details"?: {...} } }`.

CORS is enabled for all origins.

---

## The Todo object

```jsonc
{
  "id": "11111111-1111-4111-8111-111111111111", // UUID, server-generated
  "title": "Read the assignment brief",          // string, required, 1–200 chars
  "description": "Go through both challenges.",   // string, default ""
  "completed": false,                             // boolean, default false
  "priority": "high",                             // "low" | "medium" | "high"
  "dueDate": "2026-06-29",                         // date string or null
  "createdAt": "2026-06-25T09:00:00.000Z",        // ISO, server-managed
  "updatedAt": "2026-06-25T09:00:00.000Z"         // ISO, server-managed
}
```

---

## Endpoints

### `GET /api/health`
Liveness check.

```json
{ "status": "ok", "uptime": 12.34 }
```

---

### `GET /api/todos`
List todos. Supports optional query parameters:

| Param    | Values                                   | Description                          |
|----------|------------------------------------------|--------------------------------------|
| `status` | `active` \| `completed`                  | filter by completion state           |
| `q`      | any string                               | case-insensitive search (title+desc) |
| `sort`   | `createdAt` \| `-createdAt` \| `priority`| sort order (`-` = descending)        |

**Example**

```bash
curl "http://localhost:4000/api/todos?status=active&q=build&sort=priority"
```

**Response `200`**

```json
{
  "data": [ { "id": "…", "title": "Build the todo backend", "...": "..." } ],
  "count": 1
}
```

---

### `GET /api/todos/:id`
Fetch a single todo (used by the single-todo page).

- **`200`** → `{ "data": { ...todo } }`
- **`404`** → `{ "error": { "message": "Todo <id> not found" } }`

```bash
curl http://localhost:4000/api/todos/11111111-1111-4111-8111-111111111111
```

---

### `POST /api/todos`
Create a todo. Only `title` is required.

**Request**

```json
{
  "title": "Write the docs",
  "description": "All in .md",
  "priority": "low",
  "dueDate": "2026-06-29"
}
```

- **`201`** → `{ "data": { ...createdTodo } }`
- **`400`** → validation failed:

```json
{ "error": { "message": "Validation failed", "details": { "title": "Title is required and must be a non-empty string." } } }
```

```bash
curl -X POST http://localhost:4000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Write the docs","priority":"low"}'
```

---

### `PUT /api/todos/:id`
Update a todo. **Partial updates are accepted** — send any subset of
`title`, `description`, `completed`, `priority`, `dueDate`. `id`, `createdAt`
are immutable; `updatedAt` is refreshed automatically.

**Request**

```json
{ "completed": true }
```

- **`200`** → `{ "data": { ...updatedTodo } }`
- **`400`** → validation failed / no updatable fields provided
- **`404`** → todo not found

```bash
curl -X PUT http://localhost:4000/api/todos/<id> \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

---

### `DELETE /api/todos/:id`
Delete a todo.

- **`204`** → no content (success)
- **`404`** → todo not found

```bash
curl -X DELETE http://localhost:4000/api/todos/<id>
```

---

## Status codes summary

| Code  | Meaning                                            |
|-------|----------------------------------------------------|
| `200` | OK (read / update)                                 |
| `201` | Created                                            |
| `204` | No Content (delete)                                |
| `400` | Bad request — validation error or malformed JSON   |
| `404` | Route or todo not found                            |
| `500` | Unexpected server error                            |
