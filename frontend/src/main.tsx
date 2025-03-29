import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import * as React from "react";

import { NotificationProvider } from './shared/components/NotificationContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <NotificationProvider>
        <App />
      </NotificationProvider>
  </StrictMode>
)
