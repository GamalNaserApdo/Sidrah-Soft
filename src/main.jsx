import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { I18nProvider } from './i18n/I18nProvider.jsx';
import { persistAttribution } from './services/trainingApi';
import './styles/tokens.css';
import './styles/typography.css';
import './styles/motion.css';
import './styles/background.css';
import './styles/hero.css';
import './styles/cards.css';
import './styles/global.css';
import './styles/sections.css';
import './styles/training.css';
import './styles/offers.css';
import './styles/courseLanding.css';
import './styles/ai-automation.css';
import './styles/services.css';
import './styles/primitives.css';
import './styles/leads.css';
import './styles/workflow.css';
import './styles/cms/cms.css';

// Capture first-touch campaign attribution before React Router navigation can
// drop the landing URL's query string.
persistAttribution();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <App />
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>
);
