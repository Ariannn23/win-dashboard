import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app/App';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { CrmProvider } from '@/app/providers/CrmProvider';
import { ToastProvider } from '@/shared/ui/Toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CrmProvider>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </CrmProvider>
  </React.StrictMode>,
);
