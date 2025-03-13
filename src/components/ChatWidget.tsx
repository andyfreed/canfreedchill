import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Loader2, GitBranch as BrandTelegram } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  created_at: string;
  is_admin: boolean;
  user_email: string;
  telegram_chat_id?: string;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && hasStartedChat) {
      const channel = supabase
        .channel('chat_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `user_email=eq.${email}`,
          },
          (payload) => {
            setMessages((current) => [...current, payload.new as Message]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, hasStartedChat, email]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (userEmail: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Set user email in session
      const { error: claimError } = await supabase.rpc('set_user_email', {
        email: userEmail
      });

      if (claimError) throw claimError;

      // Load existing messages
      const { data, error: loadError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: true });

      if (loadError) throw loadError;

      setMessages(data || []);
      
      // Check if user has Telegram connected
      const hasTelegram = data?.some(msg => msg.telegram_chat_id);
      setTelegramConnected(hasTelegram);
      
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      await loadMessages(email);
      setHasStartedChat(true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !email) return;

    setError(null);
    const newMessage = {
      content: message.trim(),
      user_email: email,
      is_admin: false,
      is_read: false
    };

    try {
      const { error: sendError } = await supabase
        .from('chat_messages')
        .insert([newMessage]);

      if (sendError) throw sendError;

      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const connectTelegram = () => {
    window.open(`https://t.me/CanFreedChillBot?start=${btoa(email)}`, '_blank');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-cyber-primary text-cyber-black p-4 rounded-full shadow-neon hover:shadow-neon-strong transition-all duration-300"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-cyber-darker border-2 border-cyber-primary/30 rounded-lg shadow-neon overflow-hidden">
          {/* Header */}
          <div className="bg-cyber-dark p-4 flex items-center justify-between border-b border-cyber-primary/30">
            <h3 className="text-cyber-primary font-bold">Chat with Freed</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-cyber-text hover:text-cyber-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="h-96 flex flex-col">
            {!hasStartedChat ? (
              // Email Form
              <form onSubmit={handleStartChat} className="p-4 flex-1 flex flex-col justify-center">
                <p className="text-cyber-text mb-4 text-center">Enter your email to start chatting</p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-2 mb-4 bg-cyber-dark border border-cyber-primary/30 rounded text-cyber-text focus:border-cyber-primary focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="bg-cyber-primary text-cyber-black px-4 py-2 rounded font-medium hover:shadow-neon transition-all duration-300"
                >
                  Start Chat
                </button>
              </form>
            ) : (
              <>
                {/* Telegram Connect Banner */}
                {!telegramConnected && (
                  <div className="p-4 bg-cyber-dark border-b border-cyber-primary/30">
                    <button
                      onClick={connectTelegram}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0088cc] text-white rounded hover:bg-[#0088cc]/80 transition-colors"
                    >
                      <BrandTelegram className="w-5 h-5" />
                      Connect with Telegram to get mobile notifications
                    </button>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 text-cyber-primary animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="text-cyber-text/50 text-center">No messages yet</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.is_admin
                              ? 'bg-cyber-dark text-cyber-text'
                              : 'bg-cyber-primary text-cyber-black'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-cyber-primary/30">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 p-2 bg-cyber-dark border border-cyber-primary/30 rounded text-cyber-text focus:border-cyber-primary focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="bg-cyber-primary text-cyber-black p-2 rounded hover:shadow-neon disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};