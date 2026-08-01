import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, BookOpen } from 'lucide-react';
import { api } from '../api/client';
import { DocumentUploadResponse, ChatMessage } from '../types';

interface ChatPageProps {
  documentData: DocumentUploadResponse;
}

export const ChatPage: React.FC<ChatPageProps> = ({ documentData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi! I'm ready to answer any questions you have about the syllabus "**${documentData.filename}**". What would you like to know?`,
      }]);
    }
  }, [documentData, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const settings = api.getAISettings();
      const response = await api.askQuestion(documentData.doc_id, userMessage.content, settings.model);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.answer,
        source_chunks: response.source_chunks
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I encountered an error while trying to answer your question."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 sm:px-6">
      
      {/* Header */}
      <div className="bg-paper-surface border-2 border-ink rounded-t-2xl p-6 shadow-paper-sm flex items-start justify-between border-b-0">
        <div>
          <h2 className="font-serif font-bold text-2xl text-ink">Q&A Chatbot</h2>
          <p className="text-sm font-sans text-ink-pencil mt-1">
            Ask questions grounded strictly in <span className="font-mono bg-highlighter/30 px-1 rounded">{documentData.filename}</span>
          </p>
        </div>
      </div>

      {/* Chat History Window */}
      <div className="bg-paper border-2 border-ink h-[500px] overflow-y-auto p-6 space-y-6 flex flex-col custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full border border-ink flex items-center justify-center shadow-paper-sm ${
                  msg.role === 'user' ? 'bg-highlighter text-ink' : 'bg-ink text-paper'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <div className={`p-4 rounded-2xl border border-ink shadow-paper-sm font-sans text-sm ${
                  msg.role === 'user' ? 'bg-paper-surface rounded-tr-none' : 'bg-paper-surface rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                
                {/* Source Citation UI */}
                {msg.source_chunks && msg.source_chunks.length > 0 && msg.source_chunks[0].similarity_score > 0 && (
                  <div className="bg-paper-low border border-ink/20 rounded-xl p-3 shadow-inner">
                    <div className="flex items-center space-x-1.5 mb-1.5 text-sage-dark font-mono text-[10px] uppercase font-bold tracking-wider">
                      <BookOpen className="w-3 h-3" />
                      <span>Syllabus Source (sim: {msg.source_chunks[0].similarity_score})</span>
                    </div>
                    <p className="font-serif text-xs text-ink-muted italic line-clamp-2 border-l-2 border-sage-dark pl-2">
                      "{msg.source_chunks[0].text}"
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex space-x-3">
              <div className="w-8 h-8 rounded-full border border-ink bg-ink text-paper flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-paper-surface border border-ink rounded-2xl rounded-tl-none p-4 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-ink-pencil" />
                <span className="text-sm font-mono text-ink-pencil font-bold">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-paper-surface border-2 border-ink rounded-b-2xl p-4 shadow-paper-sm border-t-0">
        <form onSubmit={handleSend} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 bg-paper border border-ink/40 rounded-xl px-4 py-3 font-sans focus:outline-none focus:ring-2 focus:ring-ink"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="bg-ink text-paper px-6 py-3 rounded-xl border border-ink hover:bg-ink-light transition-all shadow-paper-sm disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
};
