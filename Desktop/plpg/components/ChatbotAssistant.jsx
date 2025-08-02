import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ChatbotAssistant = ({ isOpen, onClose, currentPath = null }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: '👋 Hi! I\'m your learning assistant. I can help you with questions about your learning path, explain concepts, or provide study tips. What would you like to know?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const generateResponse = async (userMessage) => {
        try {
            const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
            if (!apiKey) {
                throw new Error('Google AI API key not configured');
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

            let contextPrompt = `You are a helpful learning assistant for a personalized learning path generator app. `;
            
            if (currentPath) {
                contextPrompt += `The user is currently working on learning "${currentPath.skill}" at a ${currentPath.proficiency} level. `;
                if (currentPath.generatedPath && currentPath.generatedPath.length > 0) {
                    const moduleTopics = currentPath.generatedPath.map(module => 
                        `${module.moduleTitle}: ${module.subTopics ? module.subTopics.join(', ') : 'N/A'}`
                    ).join('; ');
                    contextPrompt += `Their learning path includes these modules: ${moduleTopics}. `;
                }
            }
            
            contextPrompt += `Please provide helpful, encouraging, and educational responses. Keep answers concise but informative. If asked about specific topics, provide clear explanations with examples when helpful. User's question: "${userMessage}"`;

            const result = await model.generateContent(contextPrompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating response:', error);
            return 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or feel free to continue with your learning path!';
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const botResponse = await generateResponse(userMessage.content);
            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: botResponse,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: 'Sorry, I encountered an error. Please try again!',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                id: 1,
                type: 'bot',
                content: '👋 Hi! I\'m your learning assistant. I can help you with questions about your learning path, explain concepts, or provide study tips. What would you like to know?',
                timestamp: new Date()
            }
        ]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] mx-4 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-indigo-50 rounded-t-lg">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">🤖</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Learning Assistant</h3>
                            {currentPath && (
                                <p className="text-xs text-gray-600">Helping with: {currentPath.skill}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={clearChat}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                            title="Clear chat"
                        >
                            🗑️
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
                            title="Close chat"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                    message.type === 'user'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                    message.type === 'user' ? 'text-indigo-200' : 'text-gray-500'
                                }`}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                    <span className="text-sm">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                        <textarea
                            ref={inputRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything about your learning path..."
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            rows="2"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                !inputMessage.trim() || isLoading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                        >
                            {isLoading ? '⏳' : '📤'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        💡 Try asking: "Explain this concept", "Give me study tips", or "What should I focus on next?"
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatbotAssistant;