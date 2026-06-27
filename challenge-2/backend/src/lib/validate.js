import { PRIORITIES } from '../config.js';
import { HttpError } from './HttpError.js';

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 2000;

const isString = (v) => typeof v === 'string';
const isBoolean = (v) => typeof v === 'boolean';

/**
 * Validate + normalise the body for CREATE.
 * `title` is required; everything else has a sensible default.
 * Throws HttpError(400, ...) with a field->message map when invalid.
 */
export function validateCreate(body = {}) {
  const errors = {};
  const value = {};

  // title (required)
  if (!isString(body.title) || body.title.trim() === '') {
    errors.title = 'Title is required and must be a non-empty string.';
  } else if (body.title.trim().length > MAX_TITLE) {
    errors.title = `Title must be at most ${MAX_TITLE} characters.`;
  } else {
    value.title = body.title.trim();
  }

  // description (optional)
  if (body.description === undefined || body.description === null) {
    value.description = '';
  } else if (!isString(body.description)) {
    errors.description = 'Description must be a string.';
  } else if (body.description.length > MAX_DESCRIPTION) {
    errors.description = `Description must be at most ${MAX_DESCRIPTION} characters.`;
  } else {
    value.description = body.description.trim();
  }

  // completed (optional)
  if (body.completed === undefined) {
    value.completed = false;
  } else if (!isBoolean(body.completed)) {
    errors.completed = 'Completed must be a boolean.';
  } else {
    value.completed = body.completed;
  }

  // priority (optional)
  if (body.priority === undefined || body.priority === null) {
    value.priority = 'medium';
  } else if (!PRIORITIES.includes(body.priority)) {
    errors.priority = `Priority must be one of: ${PRIORITIES.join(', ')}.`;
  } else {
    value.priority = body.priority;
  }

  // dueDate (optional) — accept null or a parseable date string
  if (body.dueDate === undefined || body.dueDate === null || body.dueDate === '') {
    value.dueDate = null;
  } else if (!isString(body.dueDate) || Number.isNaN(Date.parse(body.dueDate))) {
    errors.dueDate = 'Due date must be null or a valid date string (e.g. 2026-06-29).';
  } else {
    value.dueDate = body.dueDate;
  }

  if (Object.keys(errors).length > 0) {
    throw HttpError.badRequest('Validation failed', errors);
  }
  return value;
}

/**
 * Validate + normalise the body for UPDATE (partial).
 * Only the provided fields are validated; at least one known field is required.
 */
export function validateUpdate(body = {}) {
  const errors = {};
  const value = {};

  if ('title' in body) {
    if (!isString(body.title) || body.title.trim() === '') {
      errors.title = 'Title must be a non-empty string.';
    } else if (body.title.trim().length > MAX_TITLE) {
      errors.title = `Title must be at most ${MAX_TITLE} characters.`;
    } else {
      value.title = body.title.trim();
    }
  }

  if ('description' in body) {
    if (body.description === null) {
      value.description = '';
    } else if (!isString(body.description)) {
      errors.description = 'Description must be a string.';
    } else if (body.description.length > MAX_DESCRIPTION) {
      errors.description = `Description must be at most ${MAX_DESCRIPTION} characters.`;
    } else {
      value.description = body.description.trim();
    }
  }

  if ('completed' in body) {
    if (!isBoolean(body.completed)) {
      errors.completed = 'Completed must be a boolean.';
    } else {
      value.completed = body.completed;
    }
  }

  if ('priority' in body) {
    if (!PRIORITIES.includes(body.priority)) {
      errors.priority = `Priority must be one of: ${PRIORITIES.join(', ')}.`;
    } else {
      value.priority = body.priority;
    }
  }

  if ('dueDate' in body) {
    if (body.dueDate === null || body.dueDate === '') {
      value.dueDate = null;
    } else if (!isString(body.dueDate) || Number.isNaN(Date.parse(body.dueDate))) {
      errors.dueDate = 'Due date must be null or a valid date string.';
    } else {
      value.dueDate = body.dueDate;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw HttpError.badRequest('Validation failed', errors);
  }
  if (Object.keys(value).length === 0) {
    throw HttpError.badRequest(
      'No updatable fields provided. Send at least one of: title, description, completed, priority, dueDate.'
    );
  }
  return value;
}
