/**
 * A small Error subclass that carries an HTTP status code (and optional
 * field-level details). Throw it anywhere in a controller/service and the
 * central error handler will turn it into a proper JSON response.
 */
export class HttpError extends Error {
  constructor(status, message, details = undefined) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    if (details) this.details = details;
  }

  static badRequest(message, details) {
    return new HttpError(400, message, details);
  }

  static notFound(message = 'Resource not found') {
    return new HttpError(404, message);
  }
}
