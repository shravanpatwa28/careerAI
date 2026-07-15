import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, X, Send } from 'lucide-react';
import axios from 'axios';

const SUGGESTIONS = [
  'What courses should I take?',
  'What skills do I need?',
  'Show me a learning roadmap',
  'What is my salary potential?',
];

const TypingDots = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px 12px 12px 4px', width: 'fit-content' }}>
    {[0, 1, 2].map(i => (
      <motion.span
        key={i}
        style={{ width: 7, height: 7, borderRadius: '50%', background: '#00d4ff', display: 'block' }}
        animate={{ scale: [0.7, 1, 0.7], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
  </div>
);

const BotAvatar = () => (
  <motion.div
    animate={{ boxShadow: ['0 0 8px rgba(0,212,255,0.4)', '0 0 20px rgba(0,212,255,0.7)', '0 0 8px rgba(0,212,255,0.4)'] }}
    transition={{ duration: 2, repeat: Infinity }}
    style={{
      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.8rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif',
    }}
  >
    AI
  </motion.div>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your **AI Career Counselor** powered by LLaMA 3.3.\n\nAsk me anything about your career path, skills, or next steps!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msgText = text || input;
    if (!msgText.trim()) return;
    setShowSuggestions(false);
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: msgText }]);
    setLoading(true);

    try {
      // Use Render's dynamically provided VITE_API_URL if it exists, otherwise default to local dev
      const API_BASE = import.meta.env.VITE_API_URL ? `https://${import.meta.env.VITE_API_URL}` : 'http://localhost:5000';
      
      const res = await axios.post(`${API_BASE}/api/chat`, { message: msgText });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting. Please make sure the backend is running.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
          border: 'none', cursor: 'pointer', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(0,212,255,0.5)',
        }}
        animate={{ boxShadow: isOpen ? '0 4px 24px rgba(124,58,237,0.6)' : ['0 4px 24px rgba(0,212,255,0.4)', '0 4px 32px rgba(0,212,255,0.7)', '0 4px 24px rgba(0,212,255,0.4)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isOpen ? <X color="#fff" size={22} /> : <MessageCircle color="#fff" size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 96, right: 24,
              width: 380, height: 520, zIndex: 1000,
              display: 'flex', flexDirection: 'column',
              background: 'rgba(5, 15, 35, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 20,
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(0,212,255,0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(0,0,0,0.2)',
            }}>
              <BotAvatar />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#e2e8f0' }}>
                  AI Career Counselor
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  Online · LLaMA 3.3 via Groq
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', color: '#64748b', borderRadius: 8 }}>
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: 4 }}
                >
                  {msg.sender === 'bot' && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <BotAvatar />
                      <div style={{
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '4px 12px 12px 12px',
                        padding: '10px 14px',
                        maxWidth: '80%',
                        fontSize: '0.88rem',
                        lineHeight: 1.6,
                        color: '#e2e8f0',
                      }}>
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p style={{ margin: '0 0 6px' }}>{children}</p>,
                            strong: ({ children }) => <strong style={{ color: '#00d4ff' }}>{children}</strong>,
                            ul: ({ children }) => <ul style={{ paddingLeft: 16, margin: '6px 0' }}>{children}</ul>,
                            li: ({ children }) => <li style={{ marginBottom: 3 }}>{children}</li>,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                  {msg.sender === 'user' && (
                    <div style={{
                      background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                      borderRadius: '12px 12px 4px 12px',
                      padding: '10px 14px',
                      maxWidth: '80%',
                      fontSize: '0.88rem',
                      color: '#fff',
                      fontWeight: 500,
                    }}>
                      {msg.text}
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <BotAvatar />
                  <TypingDots />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            {showSuggestions && (
              <div style={{ padding: '8px 16px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)} className="chip" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10, background: 'rgba(0,0,0,0.2)' }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
                placeholder="Ask me anything..."
                style={{ flex: 1, margin: 0, padding: '10px 14px', borderRadius: 10, fontSize: '0.88rem', background: 'rgba(255,255,255,0.05)' }}
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{ padding: '10px 14px', borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}
              >
                <Send size={16} color="#fff" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
