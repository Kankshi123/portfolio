import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './site/App.jsx'
import { PortfolioProvider } from './site/usePortfolioData.jsx'
import './motion/tokens.css'
import './motion/preloader.css'
import './styles.css'
import './motion/slices.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <PortfolioProvider>
        <App />
      </PortfolioProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
