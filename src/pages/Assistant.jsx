import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getFirebase } from "@/api/firebase";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReactMarkdown from "react-markdown";

const STORAGE_KEY = "assistant_chat_history";
const STORAGE_MODE_KEY = "assistant_mode";

export default function Assistant() {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_MODE_KEY) || "chat";
    } catch {
      return "chat";
    }
  });
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore errors
    }
    return [
      { role: "assistant", content: "Hi! I'm your AI assistant for Islam Kids Zone. Ask me anything about Islamic education, or request help with site administration." }
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore errors
    }
  }, [messages]);

  // Save mode to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MODE_KEY, mode);
    } catch {
      // Ignore errors
    }
  }, [mode]);

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  const clearHistory = () => {
    const initialMessage = { 
      role: "assistant", 
      content: "Hi! I'm your AI assistant for Islam Kids Zone. Ask me anything about Islamic education, or request help with site administration." 
    };
    setMessages([initialMessage]);
    setError("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore errors
    }
  };

  const send = async () => {
    setError("");
    const text = input.trim();
    if (!text) return;
    setInput("");
    setLoading(true);
    
    // Add user message immediately for better UX
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setTimeout(scrollToBottom, 50);

    try {
      const { auth } = getFirebase();
      let token = null;
      if (auth?.currentUser) {
        token = await auth.currentUser.getIdToken();
      } else if (!import.meta.env?.DEV) {
        // In production, require login. In dev, allow unauthenticated requests to functions fallback.
        navigate(createPageUrl("Login"));
        return;
      }
      // Prefer functions endpoint in local dev to avoid proxy issues
      const endpoints = import.meta.env?.DEV
        ? ['/.netlify/functions/assistant', '/api/assistant']
        : ['/api/assistant', '/.netlify/functions/assistant'];
      let res;
      for (const url of endpoints) {
        try {
          res = await fetch(url, {
            method: 'POST',
            headers: token
              ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
              : { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode,
              messages: newMessages,
            }),
          });
          if (res.ok) break;
        } catch (_) {
          // Continue to next endpoint
        }
      }
      if (!res || !res.ok) throw new Error(`Assistant error: ${res ? res.status : 'no response'}`);
      const data = await res.json();
      if (data?.error) {
        const code = data.error?.code;
        const type = data.error?.type;
        let banner = String(data.error?.message || 'Assistant error');
        if (code === 429) {
          banner = type === 'quota'
            ? 'OpenAI quota exceeded for this API key. Check plan/billing or use a different key.'
            : 'OpenAI rate limit reached. Please slow down and retry shortly.';
        }
        setError(banner);
      }
      const reply = String(data.reply || '');
      const updated = [...newMessages, { role: 'assistant', content: reply }];
      setMessages(updated);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      setError(err?.message || 'Failed to contact assistant');
      // Remove the user message if request failed
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const quickActions = [
    { label: 'Edit Stories', page: 'AdminStories' },
    { label: 'Edit Banners', page: 'AdminBanners' },
    { label: 'Manage Users', page: 'AdminUsers' },
    { label: 'Quiz Manager', page: 'AdminQuizManager' },
  ];

  const quickPrompts = [
    { label: 'What is this site about?', prompt: 'What is Islam Kids Zone and what features does it offer?' },
    { label: 'How to add content?', prompt: 'How do I add new stories or educational content as an admin?' },
    { label: 'Help with games', prompt: 'What educational games are available and how do they work?' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-6 px-3">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle className="flex items-center justify-between flex-wrap gap-2">
              <span>AI Assistant</span>
              <div className="flex gap-2">
                <Button 
                  variant={mode === 'chat' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setMode('chat')}
                  className={mode === 'chat' ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'}
                >
                  Chat
                </Button>
                <Button 
                  variant={mode === 'admin' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setMode('admin')}
                  className={mode === 'admin' ? 'bg-white text-purple-600 hover:bg-gray-100' : 'bg-purple-600 text-white hover:bg-purple-700'}
                >
                  Admin
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div ref={listRef} className="h-[50vh] overflow-y-auto bg-white rounded-lg p-3 border mb-3">
              {messages.map((m, i) => (
                <div key={i} className={`mb-4 ${m.role === 'assistant' ? 'text-gray-800' : 'text-gray-900'}`}>
                  <Badge variant={m.role === 'assistant' ? 'secondary' : 'outline'} className="mr-2 mb-1">
                    {m.role === 'assistant' ? 'AI Assistant' : 'You'}
                  </Badge>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="mb-4 text-gray-600 flex items-center">
                  <Badge variant="secondary" className="mr-2">AI Assistant</Badge>
                  <span className="flex items-center gap-1">
                    <span className="animate-pulse">Thinking</span>
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                  </span>
                </div>
              )}
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((qp, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(qp.prompt)}
                  className="text-xs"
                >
                  {qp.label}
                </Button>
              ))}
            </div>

            <div>
              <Textarea 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyPress={handleKeyPress}
                placeholder="Ask a question or request help..." 
                rows={3} 
                className="w-full" 
                disabled={loading}
              />
              <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                <div className="flex flex-wrap gap-2">
                  {quickActions.map(a => (
                    <Button 
                      key={a.page} 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(createPageUrl(a.page))}
                    >
                      {a.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={clearHistory} 
                    variant="outline" 
                    size="sm"
                    disabled={loading}
                  >
                    Clear Chat
                  </Button>
                  <Button onClick={send} disabled={loading || !input.trim()}>
                    {loading ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {mode === 'admin'
                  ? 'Admin mode: Get help with site management, content editing, and administrative tasks.'
                  : 'Chat mode: Ask general questions about Islamic education and the website features.'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
