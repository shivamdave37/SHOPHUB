import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { CompareProvider } from './context/CompareContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CompareProvider>
          <App />
        </CompareProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
