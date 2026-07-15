import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme.css'
import './index.css'

// ─── Registry Bootstrap ───────────────────────────────────────────────────
// MUST be imported before App renders — registers all 9 portfolio components
import './core/registry/index'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
