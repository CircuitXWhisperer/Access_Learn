declare module '@n8n/chat' {
  type ChatOptions = Record<string, unknown> & {
    webhookUrl: string;
    target?: string;
    mode?: 'window' | 'fullscreen';
  };

  export function createChat(options: ChatOptions): {
    unmount?: () => void;
  };
}
