import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../shared.css';
import ListApp from './ListApp.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ListApp />
  </React.StrictMode>
);
