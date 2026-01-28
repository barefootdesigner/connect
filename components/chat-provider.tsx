'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ChatBubble } from './chat-bubble';

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chatEnabled, setChatEnabled] = useState(false);
  const [chatUrl, setChatUrl] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    fetchChatSettings();
  }, []);

  async function fetchChatSettings() {
    const { data, error } = await supabase
      .from('icare_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching chat settings:', error);
      return;
    }

    if (data) {
      setChatEnabled(data.enabled);
      setChatUrl(data.chat_url);
      setWelcomeMessage(data.welcome_message);
    }
  }

  return (
    <>
      {children}
      {chatEnabled && chatUrl && (
        <ChatBubble chatUrl={chatUrl} welcomeMessage={welcomeMessage} />
      )}
    </>
  );
}
