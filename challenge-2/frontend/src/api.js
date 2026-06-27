/**
 * Thin client for the todo REST API.
 *
 * In development/preview, Vite proxies "/api" to the Express server (see
 * vite.config.js), so the default base of "/api" works same-origin. You can
 * override it at build time with VITE_API_BASE (e.g. a deployed API URL).
 */
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (networkErr) {
    throw new Error(
      'Cannot reach the API. Is the backend running on port 4000? ' +
        `(${networkErr.message})`
    );
  }

  if (res.status === 204) return null;

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body?.error?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.details = body?.error?.details;
    throw err;
  }
  return body;
}

export const todosApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString();
    return request(`/todos${qs ? `?${qs}` : ''}`).then((r) => r.data);
  },
  get: (id) => request(`/todos/${id}`).then((r) => r.data),
  create: (payload) =>
    request('/todos', { method: 'POST', body: JSON.stringify(payload) }).then(
      (r) => r.data
    ),
  update: (id, payload) =>
    request(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }).then((r) => r.data),
  remove: (id) => request(`/todos/${id}`, { method: 'DELETE' }),
};
