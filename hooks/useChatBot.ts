import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient'; // Pastikan import Supabase


interface ChatMessage {
  type: 'user' | 'bot';
  message: string;
}

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Tambahkan effect untuk mendapatkan user ID asli
  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
      }
    };

    fetchUserId();
  }, []);

  const sendMessage = async (message: string) => {
    // Pastikan userId sudah tersedia sebelum mengirim pesan
    if (!userId) {
      console.error('User ID tidak tersedia');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `${process.env.CHATBOT_BASE_URL}/api/v1/chat`, 
        {
          user_id: userId,
          message: message,
          mode: 'ai'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.MUSICMATE_API_KEY
          }
        }
      );

      // Add user message
      setMessages(prev => [...prev, { 
        type: 'user', 
        message: message 
      }]);

      // Add bot response
      setMessages(prev => [...prev, { 
        type: 'bot', 
        message: response.data.message 
      }]);

      return response.data;
    } catch (error) {
      console.error('Chat API Error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        message: 'Sorry, something went wrong.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
};