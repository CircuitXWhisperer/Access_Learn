import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';
import { env } from '../lib/env';

export function N8nChatWidget() {
  useEffect(() => {
    if (!env.VITE_N8N_CHAT_WEBHOOK_URL) return undefined;

    const chat = createChat({
      webhookUrl: env.VITE_N8N_CHAT_WEBHOOK_URL,
      target: '#accesslearn-chat',
      mode: 'window',
      showWelcomeScreen: true,
      initialMessages: ['Hello! How can I help you learn today?'],
      i18n: {
        en: {
          title: 'AI Learning Assistant',
          subtitle: 'Ask about your lessons, reading, or study plan.',
          getStarted: 'Start conversation',
          inputPlaceholder: 'Type your question...',
        },
      },
    });

    return () => {
      chat.unmount?.();
      const target = document.querySelector('#accesslearn-chat');
      if (target) target.innerHTML = '';
    };
  }, []);

  return <div id="accesslearn-chat" aria-label="AI Learning Assistant" />;
}
