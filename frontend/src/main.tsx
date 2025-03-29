import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import * as React from "react";

import { NotificationProvider } from './shared/NotificationContext'
import {StyledEngineProvider} from "@mui/material";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <StyledEngineProvider injectFirst>
          <NotificationProvider>
                  <App />
          </NotificationProvider>
      </StyledEngineProvider>

  </StrictMode>
)
