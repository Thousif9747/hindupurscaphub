import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './context/AppContext';
import { CalculatorProvider } from './context/CalculatorContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <CalculatorProvider>
          <App />
        </CalculatorProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
