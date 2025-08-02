import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Add custom CSS animations
const styles = `
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { 
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }
    to { 
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
}

.animate-slideUp {
    animation: slideUp 0.4s ease-out;
}
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('chatbot-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'chatbot-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

const ChatbotAssistant = ({ isOpen, onClose, currentPath = null, user = null }) => {
    const getPersonalizedGreeting = () => {
        const userName = user?.displayName || user?.email?.split('@')[0] || 'there';
        return `👋 Hi ${userName}! I'm your learning assistant. I can help you with questions about your learning path, explain concepts, or provide study tips. What would you like to know?`;
    };

    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: getPersonalizedGreeting(),
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
                content: getPersonalizedGreeting(),
                timestamp: new Date()
            }
        ]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[650px] mx-4 flex flex-col transform animate-slideUp border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg">🤖</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                                <span>Learning Assistant</span>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            </h3>
                            {currentPath && (
                                <p className="text-sm text-indigo-600 font-medium">📚 Helping with: {currentPath.skill}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={clearChat}
                            className="text-gray-400 hover:text-red-500 transition-all duration-200 p-2 rounded-lg hover:bg-white hover:shadow-md"
                            title="Clear chat"
                        >
                            <span className="text-lg">🗑️</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-700 transition-all duration-200 p-2 rounded-lg hover:bg-white hover:shadow-md"
                            title="Close chat"
                        >
                            <span className="text-lg font-bold">✕</span>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                        >
                            <div className={`flex items-start space-x-3 max-w-[85%] ${
                                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                            }`}>
                                {message.type === 'bot' && (
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                                        <span className="text-white text-sm">🤖</span>
                                    </div>
                                )}
                                <div
                                    className={`p-4 rounded-2xl shadow-md ${
                                        message.type === 'user'
                                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white'
                                            : 'bg-white text-gray-800 border border-gray-200'
                                    }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    <p className={`text-xs mt-2 ${
                                        message.type === 'user' ? 'text-indigo-200' : 'text-gray-500'
                                    }`}>
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {message.type === 'user' && (
                                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                                        <span className="text-white text-sm">👤</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex justify-start animate-fadeIn">
                            <div className="flex items-start space-x-3 max-w-[85%]">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                                    <span className="text-white text-sm">🤖</span>
                                </div>
                                <div className="bg-white text-gray-800 border border-gray-200 p-4 rounded-2xl shadow-md">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                        </div>
                                        <span className="text-sm text-gray-600">Assistant is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-6 border-t border-gray-200 bg-white rounded-b-2xl">
                    <div className="flex space-x-3">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about your learning path... 💭"
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-200 shadow-sm hover:shadow-md"
                                rows="2"
                                disabled={isLoading}
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                Press Enter to send
                            </div>
                        </div>
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                !inputMessage.trim() || isLoading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                            }`}
                        >
                            <span className="text-lg">{isLoading ? '⏳' : '🚀'}</span>
                        </button>
                    </div>
                    <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-indigo-700 font-medium mb-1">💡 Quick suggestions:</p>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => setInputMessage('Explain this concept in simple terms')}
                                className="text-xs bg-white text-indigo-600 px-3 py-1 rounded-full border border-indigo-200 hover:bg-indigo-50 transition-colors"
                                disabled={isLoading}
                            >
                                Explain concept
                            </button>
                            <button 
                                onClick={() => setInputMessage('Give me study tips for this topic')}
                                className="text-xs bg-white text-indigo-600 px-3 py-1 rounded-full border border-indigo-200 hover:bg-indigo-50 transition-colors"
                                disabled={isLoading}
                            >
                                Study tips
                            </button>
                            <button 
                                onClick={() => setInputMessage('What should I focus on next?')}
                                className="text-xs bg-white text-indigo-600 px-3 py-1 rounded-full border border-indigo-200 hover:bg-indigo-50 transition-colors"
                                disabled={isLoading}
                            >
                                Next steps
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatbotAssistant;