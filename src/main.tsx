import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/spline-sans/500.css';
import '@fontsource/spline-sans/600.css';
import '@fontsource/spline-sans/700.css';
import './styles/index.css';
import CanvasRoute from './routes/canvas';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CanvasRoute />
  </React.StrictMode>,
);
