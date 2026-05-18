import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import { supabase } from '../lib/supabase';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { apiFetch } from '../lib/api';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hi! I'm your AI financial assistant. Ask me anything about your finances!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        if (sessionUser) {
          const displayName = sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User';
          const photoURL = sessionUser.user_metadata?.avatar_url || sessionUser.user_metadata?.picture;
          setUser({
            name: displayName,
            email: sessionUser.email,
            avatar: photoURL
          });
          // Update the first bot message with the user's name
          const firstName = displayName.split(' ')[0];
          setMessages([
            {
              id: 1,
              sender: 'bot',
              text: `Hi ${firstName}! I'm your AI financial assistant. Ask me anything about your finances!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUserData();
  }, []);

  const quickSuggestions = [
    "How much did I spend on food last month?",
    "Am I on track with my budget?",
    "When can I afford a new laptop?",
    "Show my biggest expenses"
  ];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await apiFetch('/ai/chat/', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage.text })
      });

      const botResponse = {
        id: messages.length + 2,
        sender: 'bot',
        text: response.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorResponse = {
        id: messages.length + 2,
        sender: 'bot',
        text: "I'm sorry, I'm having trouble connecting to my brain right now. " + error.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fixed Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url("/dashboard-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      ></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header user={user} />
        
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            AI Financial Assistant
          </h1>

          {/* Chat Messages Container */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl mb-4 flex flex-col border border-white/10" style={{ height: 'calc(100vh - 350px)', minHeight: '400px' }}>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                      message.sender === 'bot' 
                        ? 'bg-gradient-to-br from-emerald-500/30 to-teal-600/30 border-emerald-500/50' 
                        : 'bg-gradient-to-br from-white/10 to-white/5 border-white/30'
                    }`}>
                      {message.sender === 'bot' ? (
                        <Bot size={20} className="text-emerald-300" />
                      ) : (
                        <User size={20} className="text-gray-300" />
                      )}
                    </div>
                    <div>
                      <div className={`rounded-2xl p-3 sm:p-4 backdrop-blur-sm ${
                        message.sender === 'bot' 
                          ? 'bg-white/10 text-white border border-white/10' 
                          : 'bg-gradient-to-r from-emerald-500/90 to-teal-600/90 text-white border border-emerald-400/30'
                      }`}>
                        <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 px-2">{message.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3 max-w-[80%]">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 bg-gradient-to-br from-emerald-500/30 to-teal-600/30 border-emerald-500/50">
                      <Bot size={20} className="text-emerald-300" />
                    </div>
                    <div>
                      <div className="rounded-2xl p-3 sm:p-4 backdrop-blur-sm bg-white/10 text-white border border-white/10 flex space-x-2">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestions */}
            {messages.length === 1 && (
              <div className="p-4 sm:p-6 border-t border-white/10">
                <p className="text-sm text-gray-300 mb-4 font-medium">Quick suggestions:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quickSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left text-sm p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 text-gray-200 backdrop-blur-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-3 sm:p-4 border border-white/10">
            <div className="flex space-x-2 sm:space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about your finances..."
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/10 text-sm sm:text-base"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2 border border-emerald-400/20 hover:scale-105 disabled:hover:scale-100"
              >
                {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                <span className="hidden sm:inline font-medium">Send</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;