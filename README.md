# Ziptrrip — Developer Assignment

This repository contains my completed submission for the Ziptrrip developer
assignment. It is split into the two challenges from the brief.

## Repository layout

```
.
├── challenge-1/                 # Challenge 1 — the five questions
│   ├── ANSWERS.md               #   ← all written answers + explanations
│   ├── q1-pattern.js            #   runnable: number pattern (4 ways)
│   ├── q2-reverse.js            #   runnable: reverse a string (5 ways)
│   ├── q3-duplicates.js         #   runnable: remove duplicates (4 ways)
│   └── q5-layout.html           #   open in a browser: 3-box layout (6 ways)
│
└── challenge-2/                 # Challenge 2 — the todo application
    ├── README.md                #   ← how to run, architecture, assumptions
    ├── docs/
    │   ├── API.md               #   REST API reference
    │   └── FEATURES.md          #   full feature list (frontend + backend)
    ├── backend/                 #   Node.js + Express CRUD API (file storage)
    └── frontend/                #   Multi-page React app (Vite)
```

## Challenge 1 — the five questions

All answers, with line-by-line reasoning for the CSS-selector question and
explanations of every approach, are in **[challenge-1/ANSWERS.md](challenge-1/ANSWERS.md)**.

Quick start:

```bash
cd challenge-1
node q1-pattern.js      # prints the pattern + confirms all 4 methods agree
node q2-reverse.js      # Bhaskara -> araksahB (5 methods)
node q3-duplicates.js   # de-dupe (4 methods)
# then open q5-layout.html in any browser
```

## Challenge 2 — the todo application

A full-stack todo app: an **Express** REST API with file-based persistence and
a **multi-page React** frontend (a list page and a single-todo page that reads
an `id` query parameter).

See **[challenge-2/README.md](challenge-2/README.md)** for full setup and run
instructions, **[challenge-2/docs/FEATURES.md](challenge-2/docs/FEATURES.md)**
for the complete feature list, and
**[challenge-2/docs/API.md](challenge-2/docs/API.md)** for the API reference.

TL;DR to run it:

```bash
# terminal 1 — backend (http://localhost:4000)
cd challenge-2/backend && npm install && npm start

# terminal 2 — frontend (http://localhost:5173)
cd challenge-2/frontend && npm install && npm run dev
```

## Assumptions & notes

- **Challenge 1, Q1:** the rows `1, 21, 321, 4321` are countdowns, so the
  pattern implemented is "row *i* = *i, i-1, … , 1*"; the last row therefore has
  *n* digits (what the brief's "*nnnnn (n times)*" hint refers to).
- **Challenge 2, "multiple page instead of SPA":** taken literally — the
  frontend is a true multi-page app (two separate HTML documents with full page
  loads between them), built via Vite's multi-page setup, **not** a single-page
  app with client-side routing. See the frontend README for details.
- Every piece of code here has been run and verified locally (Node 22, Windows).
  The backend ships with a smoke test (`npm run test:api`) and the frontend
  builds cleanly with `npm run build`.
