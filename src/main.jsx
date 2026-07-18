import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { I18nProvider } from './i18n/I18nProvider.jsx';
import './styles/tokens.css';
import './styles/typography.css';
import './styles/motion.css';
import './styles/cinematic.css';
import './styles/hero.css';
import './styles/cards.css';
import './styles/global.css';
import './styles/sections.css';
import './styles/primitives.css';
import './styles/leads.css';
import './styles/workflow.css';
import './styles/cms/cms.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </I18nProvider>
  </React.StrictMode>
);
