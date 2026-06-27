import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project paths
export const ROOT_DIR = path.resolve(__dirname, '..');
export const DATA_DIR = path.join(ROOT_DIR, 'data');
export const DATA_FILE = path.join(DATA_DIR, 'todos.json');

// Server
export const PORT = Number(process.env.PORT) || 4000;

// Allowed values for the `priority` field
export const PRIORITIES = ['low', 'medium', 'high'];
