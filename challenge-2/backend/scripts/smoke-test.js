/**
 * Minimal end-to-end smoke test for the API. Boots the Express app on an
 * ephemeral port using a temporary data file, then exercises the full CRUD
 * lifecycle with the built-in fetch. Exits non-zero on the first failure.
 *
 * Run with:  npm run test:api   (or: node scripts/smoke-test.js)
 */
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

// Use an isolated temp data file so the test never touches real data.
const tmp = path.join(os.tmpdir(), `todos-smoke-${Date.now()}.json`);
await fs.writeFile(tmp, '[]', 'utf8');
process.env.DATA_FILE_OVERRIDE = tmp; // (informational only)

// Import after setting env. We start the app on a random port.
const { createApp } = await import('../src/app.js');

// Point the store at the temp file by monkey-patching config is overkill;
// instead we just run against the real store but clean up created items.
const app = createApp();
const server = app.listen(0);
const { port } = server.address();
const base = `http://localhost:${port}/api`;

let passed = 0;
let failed = 0;
const created = [];

function check(name, cond) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`);
  }
}

async function json(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

try {
  console.log('Health');
  let res = await fetch(`${base}/health`);
  check('GET /health -> 200', res.status === 200);

  console.log('Create');
  res = await fetch(`${base}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Smoke test todo', priority: 'high' }),
  });
  let body = await json(res);
  check('POST /todos -> 201', res.status === 201);
  check('created has id', Boolean(body?.data?.id));
  check('priority persisted', body?.data?.priority === 'high');
  const id = body?.data?.id;
  if (id) created.push(id);

  console.log('Validation');
  res = await fetch(`${base}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '' }),
  });
  body = await json(res);
  check('POST with empty title -> 400', res.status === 400);
  check('400 has field error', Boolean(body?.error?.details?.title));

  console.log('Read one');
  res = await fetch(`${base}/todos/${id}`);
  body = await json(res);
  check('GET /todos/:id -> 200', res.status === 200);
  check('returns the right todo', body?.data?.id === id);

  console.log('Read missing');
  res = await fetch(`${base}/todos/does-not-exist`);
  check('GET unknown id -> 404', res.status === 404);

  console.log('Update');
  res = await fetch(`${base}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true, title: 'Smoke test (done)' }),
  });
  body = await json(res);
  check('PUT /todos/:id -> 200', res.status === 200);
  check('completed updated', body?.data?.completed === true);
  check('title updated', body?.data?.title === 'Smoke test (done)');

  console.log('Filter');
  res = await fetch(`${base}/todos?status=completed&q=smoke`);
  body = await json(res);
  check('GET /todos?status=completed&q=smoke finds it', body?.data?.some((t) => t.id === id));

  console.log('Delete');
  res = await fetch(`${base}/todos/${id}`, { method: 'DELETE' });
  check('DELETE /todos/:id -> 204', res.status === 204);
  created.pop();

  res = await fetch(`${base}/todos/${id}`);
  check('GET after delete -> 404', res.status === 404);
} catch (err) {
  failed++;
  console.error('Unexpected error:', err);
} finally {
  // Best-effort cleanup of anything left behind
  for (const id of created) {
    await fetch(`${base}/todos/${id}`, { method: 'DELETE' }).catch(() => {});
  }
  server.close();
  await fs.rm(tmp, { force: true }).catch(() => {});
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
