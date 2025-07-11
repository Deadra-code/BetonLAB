import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

// PERBAIKAN: Mengembalikan <React.StrictMode> setelah mengganti library
// drag-and-drop ke versi yang kompatibel.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
