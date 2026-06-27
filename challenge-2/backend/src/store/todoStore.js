import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { DATA_DIR, DATA_FILE } from '../config.js';

/**
 * File-based persistence for todos.
 *
 * The data lives in `data/todos.json` as a JSON array. Writes are serialised
 * through a single promise chain (`writeQueue`) so two concurrent requests can
 * never interleave a read-modify-write and corrupt the file.
 */

let writeQueue = Promise.resolve();

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf8');
  }
}

async function readAll() {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // If the file is somehow corrupt, fail safe with an empty list rather
    // than crashing every request.
    return [];
  }
}

async function persist(todos) {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2), 'utf8');
}

/**
 * Run a read-modify-write transaction with exclusive access to the file.
 * `mutator(todos)` may mutate/replace the array and return any result; the
 * (possibly) changed array is then written back.
 */
function transaction(mutator) {
  const run = async () => {
    const todos = await readAll();
    const result = await mutator(todos);
    await persist(todos);
    return result;
  };
  // chain onto the queue so transactions run one at a time
  const next = writeQueue.then(run, run);
  // keep the queue alive even if this transaction rejects
  writeQueue = next.catch(() => {});
  return next;
}

// ---- Public API ----------------------------------------------------------

export async function list({ status, q, sort } = {}) {
  let todos = await readAll();

  if (status === 'active') todos = todos.filter((t) => !t.completed);
  if (status === 'completed') todos = todos.filter((t) => t.completed);

  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    todos = todos.filter(
      (t) =>
        t.title.toLowerCase().includes(needle) ||
        (t.description || '').toLowerCase().includes(needle)
    );
  }

  if (sort === 'createdAt') {
    todos = [...todos].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } else if (sort === '-createdAt') {
    todos = [...todos].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } else if (sort === 'priority') {
    const rank = { high: 0, medium: 1, low: 2 };
    todos = [...todos].sort((a, b) => rank[a.priority] - rank[b.priority]);
  }

  return todos;
}

export async function getById(id) {
  const todos = await readAll();
  return todos.find((t) => t.id === id) || null;
}

export async function create(data) {
  const now = new Date().toISOString();
  const todo = {
    id: randomUUID(),
    title: data.title,
    description: data.description ?? '',
    completed: data.completed ?? false,
    priority: data.priority ?? 'medium',
    dueDate: data.dueDate ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await transaction((todos) => {
    todos.push(todo);
  });
  return todo;
}

export async function update(id, patch) {
  return transaction((todos) => {
    const idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    todos[idx] = {
      ...todos[idx],
      ...patch,
      id: todos[idx].id, // never allow id to change
      createdAt: todos[idx].createdAt, // preserve creation time
      updatedAt: new Date().toISOString(),
    };
    return todos[idx];
  });
}

export async function remove(id) {
  return transaction((todos) => {
    const idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    todos.splice(idx, 1);
    return true;
  });
}
