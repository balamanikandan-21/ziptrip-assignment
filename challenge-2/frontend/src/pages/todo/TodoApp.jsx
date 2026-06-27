import { useEffect, useState } from 'react';
import { todosApi } from '../../api.js';
import {
  PRIORITIES,
  formatDateTime,
  toDateInputValue,
} from '../../utils.js';
import PriorityBadge from '../../components/PriorityBadge.jsx';

// Read the todo id from the page's query string: todo.html?id=<uuid>
function getIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

export default function TodoApp() {
  const id = getIdFromUrl();

  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // edit form
  const [form, setForm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('No todo id was provided in the URL (expected ?id=…).');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await todosApi.get(id);
        if (cancelled) return;
        setTodo(data);
        setForm({
          title: data.title,
          description: data.description || '',
          priority: data.priority,
          dueDate: toDateInputValue(data.dueDate),
          completed: data.completed,
        });
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setSavedAt(null);
    try {
      const updated = await todosApi.update(id, {
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate || null,
        completed: form.completed,
      });
      setTodo(updated);
      setSavedAt(new Date());
    } catch (err) {
      if (err.details) setFieldErrors(err.details);
      else setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this todo? This cannot be undone.')) return;
    try {
      await todosApi.remove(id);
      // Full-page navigation back to the list (this is an MPA).
      window.location.href = '/index.html';
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <a className="back-link" href="/index.html">
        ← Back to all todos
      </a>

      {loading && <div className="loading">Loading…</div>}

      {error && !loading && (
        <div className="error">
          {error}
          <div style={{ marginTop: 12 }}>
            <a className="btn-ghost btn-sm" href="/index.html" style={{ textDecoration: 'none' }}>
              Go to list
            </a>
          </div>
        </div>
      )}

      {!loading && !error && todo && form && (
        <>
          <header className="app-header">
            <div>
              <h1>{todo.completed ? '✅ ' : '📝 '}{todo.title}</h1>
              <div className="subtitle">
                <PriorityBadge priority={todo.priority} /> &nbsp;
                {todo.completed ? 'Completed' : 'In progress'}
              </div>
            </div>
          </header>

          {/* Read-only details */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="detail-row">
              <span className="key">ID</span>
              <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{todo.id}</span>
            </div>
            <div className="detail-row">
              <span className="key">Created</span>
              <span>{formatDateTime(todo.createdAt)}</span>
            </div>
            <div className="detail-row">
              <span className="key">Last updated</span>
              <span>{formatDateTime(todo.updatedAt)}</span>
            </div>
          </div>

          {/* Edit form */}
          <form className="card" onSubmit={handleSave}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Edit</h2>

            <div className="field">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              {fieldErrors.title && <div className="field-error">{fieldErrors.title}</div>}
            </div>

            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              {fieldErrors.description && (
                <div className="field-error">{fieldErrors.description}</div>
              )}
            </div>

            <div className="row">
              <div className="field">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="dueDate">Due date</label>
                <input
                  id="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
                {fieldErrors.dueDate && <div className="field-error">{fieldErrors.dueDate}</div>}
              </div>
            </div>

            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.completed}
                  onChange={(e) => setForm({ ...form, completed: e.target.checked })}
                  style={{ width: 18, height: 18 }}
                />
                Mark as completed
              </label>
            </div>

            <div className="detail-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              {savedAt && (
                <span style={{ color: 'var(--success)', alignSelf: 'center', fontSize: 13 }}>
                  Saved ✓
                </span>
              )}
              <span className="spacer" />
              <button type="button" className="btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
