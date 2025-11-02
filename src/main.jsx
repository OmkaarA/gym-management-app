import React from 'react'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { TransitionProvider } from './context/TransitionContext'
import { AuthProvider } from './context/AuthContext.jsx'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { ThemeProvider } from './context/ThemeContext.jsx';


const root = createRoot(document.getElementById('root'))

root.render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TransitionProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </TransitionProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)