import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ModalProvider } from './context/ModalContext';
import GlobalModal from './components/GlobalModal';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ModalProvider>
      <App />
      <GlobalModal />
    </ModalProvider>
  </React.StrictMode>
);

