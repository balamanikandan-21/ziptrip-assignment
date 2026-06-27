import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../shared.css';
import TodoApp from './TodoApp.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TodoApp />
  </React.StrictMode>
);
