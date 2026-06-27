import { createApp } from './app.js';
import { PORT } from './config.js';

const app = createApp();

app.listen(PORT, () => {
  console.log(`✅ Todo API listening on http://localhost:${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/api/health`);
  console.log(`   Todos:   http://localhost:${PORT}/api/todos`);
});
