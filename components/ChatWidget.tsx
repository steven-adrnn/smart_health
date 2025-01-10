'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatbot } from '@/hooks/useChatBot';
import { Button } from './ui/button';
import { Send, MessageCircle, X } from 'lucide-react';

export function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const { messages, sendMessage, isLoading } = useChatbot();

    const handleSendMessage = async () => {
        if (inputMessage.trim()) {
            await sendMessage(inputMessage);
            setInputMessage('');
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chatbot Trigger Button */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="shadow-lg"
            >
                <Button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-primary-foreground text-primary flex items-center"
                >
                    {isOpen ? <X className="mr-2" /> : <MessageCircle className="mr-2" />}
                    CHATBOT
                </Button>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="absolute bottom-16 right-0 w-80 bg-white rounded-xl shadow-2xl border border-primary/20"
                    >
                        {/* Chat Header */}
                        <div className="bg-primary text-white p-3 rounded-t-xl flex justify-between items-center">
                            <h3 className="font-bold">Smart Health AI</h3>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-white hover:bg-primary-600"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Chat Messages */}
                        <div className="h-96 overflow-y-auto p-4 space-y-2">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: msg.type === 'user' ? 10 : -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`
                                        p-2 rounded-lg max-w-[80%]
                                        ${msg.type === 'user' 
                                            ? 'bg-primary/10 text-primary self-end ml-auto' 
                                            : 'bg-gray-100 text-gray-800 self-start mr-auto'}
                                    `}
                                >
                                    {msg.message}
                                </motion.div>
                            ))}
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t flex items-center space-x-2">
                            <input 
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Tanya sesuatu..."
                                className="flex-grow p-2 border rounded-lg focus:outline-primary"
                            />
                            <Button 
                                onClick={handleSendMessage} 
                                disabled={isLoading}
                                size="icon"
                                className="bg-primary"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}