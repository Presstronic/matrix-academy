/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
