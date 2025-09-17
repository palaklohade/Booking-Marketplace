// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

import { AuthProvider } from './context/AuthContext';

const rootElement = document.getElementById('root');
// ...
const root = ReactDOM.createRoot(rootElement);



const googleClientId = process.env.VITE_GOOGLE_CLIENT_ID || '';

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <HashRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HashRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);