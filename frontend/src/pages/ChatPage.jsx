import React, { useEffect, useState } from 'react';
import { Bot, Loader2, Send, User } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import PageHeader from '../components/layout/PageHeader';
import Reveal from '../components/motion/Reveal';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { apiFetch } from '../lib/api';
import { useHeaderUser } from '../hooks/useHeaderUser';

const ChatPage = () => {
  const user = useHeaderUser();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hi! I'm your financial assistant. Ask me anything about your spending, budgets, bills, or goals.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!user?.name) return;
    const firstName = user.name.split(' ')[0];
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: `Hi ${firstName}! I'm your financial assistant. Ask me anything about your spending, budgets, bills, or goals.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [user?.name]);

  const quickSuggestions = [
    'Where did my money go this month?',
    'Am I likely to cross my budget?',
    'Which subscriptions should I review?',
    'Summarize my biggest expenses',
  ];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await apiFetch('/ai/chat/', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage.text }),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'bot',
          text: response.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'bot',
          text: `I'm having trouble connecting right now. ${error.message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AppShell user={user} narrow className="min-h-screen">
      <PageHeader
        eyebrow="Messages"
        title="Financial Chat"
        subtitle="Ask questions about your spending, budgets, and financial goals."
      />

      <Card className="flex min-h-[580px] flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.map((message) => {
            const isUser = message.sender === 'user';
            return (
              <Reveal key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[82%] items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg overflow-hidden border ${isUser ? 'border-white/15 bg-white/8' : 'border-emerald-300/20 bg-emerald-300/10'}`}>
                    {isUser ? (
                      user?.avatar ? (
                        <img src={user.avatar} alt="Me" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-emerald-400 text-xs font-bold text-slate-950">
                          {(user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )
                    ) : (
                      <Bot size={18} className="text-emerald-200" />
                    )}
                  </div>
                  <div>
                    <div className={`rounded-xl px-4 py-3 text-sm leading-6 ${isUser ? 'bg-emerald-300 text-slate-950' : 'border border-white/10 bg-white/[0.05] text-slate-100'}`}>
                      <p className="whitespace-pre-line">{message.text}</p>
                    </div>
                    <p className={`mt-1 text-xs text-slate-500 ${isUser ? 'text-right' : ''}`}>{message.time}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-300/20 bg-emerald-300/10">
                <Bot size={18} className="text-emerald-200" />
              </div>
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-200" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-200 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-200 [animation-delay:240ms]" />
              </span>
            </div>
          )}
        </div>

        {messages.length === 1 && (
          <div className="border-t border-white/10 p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {quickSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInputMessage(suggestion)}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="border-t border-white/10 p-3 sm:p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about your finances..."
              className="h-12 flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-4 text-sm text-white outline-none transition focus:border-emerald-300/40"
            />
            <Button type="submit" disabled={!inputMessage.trim() || isTyping} className="h-12">
              {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
};

export default ChatPage;
