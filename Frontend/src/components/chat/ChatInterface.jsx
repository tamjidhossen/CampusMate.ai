import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  Bell, 
  BellOff, 
  MessageSquare, 
  HelpCircle, 
  Trophy,
  Menu,
  X
} from 'lucide-react';
import TextShimmerWave from '../ui/TextShimmerWave';
import NoticePanel from './NoticePanel';
import HelpRequestSection from './HelpRequestSection';
import VolunteerLeaderboard from './VolunteerLeaderboard';

const ChatInterface = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your CampusMate AI assistant. How can I help you today?',
      timestamp: new Date(Date.now() - 5 * 60000)
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isNoticePanelOpen, setIsNoticePanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Dummy loading message for shimmer effect
  const loadingMessage = {
    id: 'loading',
    type: 'bot',
    content: 'I\'m thinking about your question...',
    timestamp: new Date(),
    isLoading: true
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add loading message
    setMessages(prev => [...prev, loadingMessage]);

    // Simulate API call
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: getDummyResponse(),
        timestamp: new Date()
      };

      setMessages(prev => prev.filter(msg => msg.id !== 'loading').concat(botResponse));
      setIsLoading(false);
    }, 2000);
  };

  const getDummyResponse = () => {
    const responses = [
      "I understand your question about university matters. Let me help you with that information.",
      "Based on university policies, here's what I can tell you...",
      "That's a great question! From the university database, I found...",
      "I can help you with that. According to the latest university guidelines...",
      "Here's the information you need about campus services and facilities..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const tabs = [
    { id: 'chat', label: 'Information Chat', icon: MessageSquare },
    { id: 'help', label: 'Help Requests', icon: HelpCircle },
    { id: 'leaderboard', label: 'Volunteer Leaderboard', icon: Trophy }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header with Navigation */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                CampusMate
                <span className="font-light text-orange-400">.ai</span>
              </span>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Notice Panel Toggle & Mobile Menu */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsNoticePanelOpen(!isNoticePanelOpen)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isNoticePanelOpen
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {isNoticePanelOpen ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-4 border-t border-gray-700"
              >
                <div className="flex flex-col space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-orange-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          isNoticePanelOpen ? 'lg:mr-80' : ''
        }`}>
          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col">
                {/* Messages Area */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/30"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}
                >
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.type === 'user' 
                              ? 'bg-orange-600' 
                              : 'bg-blue-600'
                          }`}>
                            {message.type === 'user' ? (
                              <User className="w-4 h-4 text-white" />
                            ) : (
                              <Bot className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>

                        {/* Message Content */}
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.type === 'user'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-800 text-gray-100'
                        }`}>
                          {message.isLoading ? (
                            <TextShimmerWave className="text-gray-300">
                              {message.content}
                            </TextShimmerWave>
                          ) : (
                            <p className="text-sm">{message.content}</p>
                          )}
                          <div className={`text-xs mt-1 opacity-70 ${
                            message.type === 'user' ? 'text-orange-100' : 'text-gray-400'
                          }`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-gray-900/50 backdrop-blur-sm border-t border-gray-700">
                  <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                    <div className="relative">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask me anything about the university..."
                        disabled={isLoading}
                        className="w-full bg-gray-800/80 border border-gray-600 rounded-2xl px-6 py-4 pr-14 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-gray-800 transition-all duration-200 disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim() || isLoading}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all duration-200"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'help' && <HelpRequestSection />}
            {activeTab === 'leaderboard' && <VolunteerLeaderboard />}
          </div>
        </div>

        {/* Notice Panel */}
        <NoticePanel 
          isOpen={isNoticePanelOpen} 
          onClose={() => setIsNoticePanelOpen(false)} 
        />
      </div>
    </div>
  );
};

export default ChatInterface;
