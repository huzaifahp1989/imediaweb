import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getFirebase } from "@/api/firebase";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Assistant() {
  const [mode, setMode] = useState("chat"); // chat | admin
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I’m your AI assistant. Ask me anything or request edits." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  const send = async () => {
    setError("");
    const text = input.trim();
    if (!text) return;
    setInput("");
    setLoading(true);
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
              messages: [...messages, { role: 'user', content: text }],
            }),
          });
          if (res.ok) break;
        } catch (_) {
          // Continue to next endpoint
        }
      }
      if (!res || !res.ok) throw new Error(`Assistant error: ${res ? res.status : 'no response'}`);
      const data = await res.json();
      const reply = String(data.reply || '');
      const updated = [...messages, { role: 'user', content: text }, { role: 'assistant', content: reply }];
      setMessages(updated);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      setError(err?.message || 'Failed to contact assistant');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Edit Stories', page: 'AdminStories' },
    { label: 'Edit Banners', page: 'AdminBanners' },
    { label: 'Manage Users', page: 'AdminUsers' },
    { label: 'Quiz Manager', page: 'AdminQuizManager' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-6 px-3">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle className="flex items-center justify-between">
              <span>AI Agent / ChatGPT</span>
              <div className="flex gap-2">
                <Button variant={mode === 'chat' ? 'default' : 'outline'} size="sm" onClick={() => setMode('chat')}>ChatGPT</Button>
                <Button variant={mode === 'admin' ? 'default' : 'outline'} size="sm" onClick={() => setMode('admin')}>Admin Agent</Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {error && <div className="mb-3 text-red-600">{error}</div>}

            <div ref={listRef} className="h-[50vh] overflow-y-auto bg-white rounded-lg p-3 border">
              {messages.map((m, i) => (
                <div key={i} className={`mb-3 ${m.role === 'assistant' ? 'text-gray-800' : 'text-gray-900'}`}>
                  <Badge variant={m.role === 'assistant' ? 'secondary' : 'outline'} className="mr-2">
                    {m.role === 'assistant' ? 'Assistant' : 'You'}
                  </Badge>
                  <span className="whitespace-pre-wrap">{m.content}</span>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <Textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a question or request an edit…" rows={3} className="w-full" />
              <div className="flex items-center justify-between mt-2">
                <div className="flex flex-wrap gap-2">
                  {quickActions.map(a => (
                    <Button key={a.page} variant="outline" size="sm" onClick={() => navigate(createPageUrl(a.page))}>{a.label}</Button>
                  ))}
                </div>
                <Button onClick={send} disabled={loading}>
                  {loading ? 'Sending…' : 'Send'}
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {mode === 'admin'
                  ? 'Admin Agent suggests exact pages and steps for edits. For full control, use the quick links.'
                  : 'ChatGPT mode answers general questions. Switch to Admin Agent for site edits.'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
