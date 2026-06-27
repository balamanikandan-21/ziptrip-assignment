import * as store from '../store/todoStore.js';
import { HttpError } from '../lib/HttpError.js';
import { validateCreate, validateUpdate } from '../lib/validate.js';

// GET /api/todos?status=&q=&sort=
export async function listTodos(req, res) {
  const { status, q, sort } = req.query;
  const todos = await store.list({ status, q, sort });
  res.json({ data: todos, count: todos.length });
}

// GET /api/todos/:id
export async function getTodo(req, res) {
  const todo = await store.getById(req.params.id);
  if (!todo) throw HttpError.notFound(`Todo ${req.params.id} not found`);
  res.json({ data: todo });
}

// POST /api/todos
export async function createTodo(req, res) {
  const value = validateCreate(req.body);
  const todo = await store.create(value);
  res.status(201).json({ data: todo });
}

// PUT /api/todos/:id  (partial update accepted)
export async function updateTodo(req, res) {
  const value = validateUpdate(req.body);
  const updated = await store.update(req.params.id, value);
  if (!updated) throw HttpError.notFound(`Todo ${req.params.id} not found`);
  res.json({ data: updated });
}

// DELETE /api/todos/:id
export async function deleteTodo(req, res) {
  const ok = await store.remove(req.params.id);
  if (!ok) throw HttpError.notFound(`Todo ${req.params.id} not found`);
  res.status(204).end();
}
