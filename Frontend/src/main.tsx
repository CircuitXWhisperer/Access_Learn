import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
