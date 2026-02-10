import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

// Import Global CSS
import './css/variables.css'
import './css/global.css'

import { NotificationProvider } from './components/Notification/Notification.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <NotificationProvider>
                <App />
            </NotificationProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
