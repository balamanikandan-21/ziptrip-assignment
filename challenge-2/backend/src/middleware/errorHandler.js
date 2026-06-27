import { HttpError } from '../lib/HttpError.js';

// 404 handler for unmatched routes
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
}

// Central error handler. Must keep the 4-arg signature for Express to treat
// it as an error middleware.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Malformed JSON body produced by express.json()
  if (err.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ error: { message: 'Request body is not valid JSON.' } });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // Anything else is an unexpected server error
  console.error('[unhandled error]', err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}
