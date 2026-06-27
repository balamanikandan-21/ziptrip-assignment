import { useEffect, useState, useCallback, useRef } from 'react';
import { todosApi } from '../../api.js';
import { PRIORITIES, formatDate, isOverdue } from '../../utils.js';
import PriorityBadge from '../../components/PriorityBadge.jsx';

const EMPTY_FORM = { title: '', description: '', priority: 'medium', dueDate: '' };

export default function ListApp() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // toolbar state
  const [status, setStatus] = useState('all'); // all | active | completed
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('-createdAt');

  // add-form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load todos from the API for the current filters.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await todosApi.list({
        status: status === 'all' ? '' : status,
        q,
        sort,
      });
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, q, sort]);

  // Debounce the search box; refetch immediately on status/sort changes.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      load();
      return;
    }
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function handleAdd(e) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await todosApi.create({
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate || null,
      });
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setFormError(err.details?.title || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleComplete(todo) {
    // optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
    );
    try {
      await todosApi.update(todo.id, { completed: !todo.completed });
      // If a status filter is active, the item may need to drop out of view.
      if (status !== 'all') load();
    } catch (err) {
      setError(err.message);
      load(); // resync on failure
    }
  }

  async function remove(todo) {
    if (!window.confirm(`Delete "${todo.title}"?`)) return;
    const prev = todos;
    setTodos((t) => t.filter((x) => x.id !== todo.id)); // optimistic
    try {
      await todosApi.remove(todo.id);
    } catch (err) {
      setError(err.message);
      setTodos(prev); // rollback
    }
  }

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <div className="container">
      <header className="app-header">
        <div>
          <h1>✅ Todos</h1>
          <div className="subtitle">Ziptrrip assignment — multi-page React + Express</div>
        </div>
      </header>

      {/* Add form */}
      <form className="card" onSubmit={handleAdd}>
        <div className="field">
          <label htmlFor="title">New todo *</label>
          <input
            id="title"
            type="text"
            placeholder="What needs to be done?"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            autoComplete="off"
          />
          {formError && <div className="field-error">{formError}</div>}
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Optional details"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
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
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add todo'}
            </button>
          </div>
        </div>
      </form>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="segmented">
          {['all', 'active', 'completed'].map((s) => (
            <button
              key={s}
              className={status === s ? 'active' : ''}
              onClick={() => setStatus(s)}
              type="button"
            >
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <input
          className="search"
          type="text"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 'auto' }}>
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="priority">Priority (high→low)</option>
        </select>
      </div>

      <div className="stats">
        {loading ? 'Loading…' : `${todos.length} shown · ${remaining} remaining`}
      </div>

      {error && <div className="error">{error}</div>}

      {!loading && !error && todos.length === 0 && (
        <div className="empty">
          {q || status !== 'all'
            ? 'No todos match your filters.'
            : 'No todos yet — add your first one above!'}
        </div>
      )}

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              className="checkbox"
              checked={todo.completed}
              onChange={() => toggleComplete(todo)}
              aria-label={`Mark "${todo.title}" ${todo.completed ? 'incomplete' : 'complete'}`}
            />
            <div className="body">
              <a className="title" href={`/todo.html?id=${todo.id}`}>
                {todo.title}
              </a>
              <div className="meta">
                <PriorityBadge priority={todo.priority} />
                {todo.dueDate && (
                  <span className={isOverdue(todo) ? 'overdue' : ''}>
                    Due {formatDate(todo.dueDate)}
                    {isOverdue(todo) ? ' (overdue)' : ''}
                  </span>
                )}
                {todo.description && <span>· {todo.description.slice(0, 60)}</span>}
              </div>
            </div>
            <a className="btn-ghost btn-sm" href={`/todo.html?id=${todo.id}`} style={{ textDecoration: 'none' }}>
              Open
            </a>
            <button className="btn-danger btn-sm" onClick={() => remove(todo)} type="button">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
