import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { Toaster as SonnerToaster } from 'sonner'

import App from './App.jsx'
import { store } from './store/store.js'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <TooltipProvider delayDuration={100}>
          <App />
          <SonnerToaster theme="dark" position="top-center" />
          <Toaster position="top-right" />
        </TooltipProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)

