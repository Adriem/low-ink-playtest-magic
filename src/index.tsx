import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initialiseConfig } from './config';
import './i18n';
import './index.css';
import App from './App';

initialiseConfig();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
