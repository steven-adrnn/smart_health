import React, { useState, useRef, useEffect } from 'react';
import { useChatbot } from '@/hooks/useChatBot';




const ChatWidget: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [mode, setMode] = useState<'support' | 'ai'>('support');
  const { messages, sendMessage, isLoading } = useChatbot();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage, mode);
      setInputMessage('');
    }
  };

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <button 
          onClick={() => setMode(mode === 'support' ? 'ai' : 'support')}
        >
          {mode === 'support' ? 'Support Mode' : 'AI Mode'}
        </button>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.type}-message`}
          >
            {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input 
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
        />
        <button 
          onClick={handleSendMessage} 
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;