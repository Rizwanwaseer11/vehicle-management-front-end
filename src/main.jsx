

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import './index.css'
import App from './App.jsx'

import GoogleMapProvider from "./components/GoogleMaps/GoogleMapProvider";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <GoogleMapProvider>
 <App />
    </GoogleMapProvider>
    
    </BrowserRouter>
  </StrictMode>,
)
