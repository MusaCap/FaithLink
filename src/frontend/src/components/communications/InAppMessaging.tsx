'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Check, CheckCheck, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export default function InAppMessaging() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [newMsg, setNewMsg] = useState({ to: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMsg.to || !newMsg.body) return;
    setSending(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newMsg)
      });
      const data = await res.json();
      if (data.success) {
        setShowCompose(false);
        setNewMsg({ to: '', subject: '', body: '' });
        await fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`${API_URL}/api/messages/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
          Messages
        </h3>
        <div className="flex space-x-2">
          <button onClick={fetchMessages} className="p-2 rounded-md hover:bg-gray-100">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowCompose(true)} className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Compose
          </button>
        </div>
      </div>

      {showCompose && (
        <div className="p-4 bg-blue-50 border-b border-blue-100 space-y-3">
          <input type="text" placeholder="To (user ID or email)" value={newMsg.to} onChange={e => setNewMsg(p => ({ ...p, to: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input type="text" placeholder="Subject (optional)" value={newMsg.subject} onChange={e => setNewMsg(p => ({ ...p, subject: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <textarea placeholder="Message body..." value={newMsg.body} onChange={e => setNewMsg(p => ({ ...p, body: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <div className="flex space-x-2">
            <button onClick={handleSend} disabled={sending || !newMsg.to || !newMsg.body} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center">
              <Send className="w-4 h-4 mr-1" /> {sending ? 'Sending...' : 'Send'}
            </button>
            <button onClick={() => setShowCompose(false)} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No messages yet</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {messages.map(msg => (
            <div key={msg.id} onClick={() => !msg.read && markRead(msg.id)} className={`p-4 hover:bg-gray-50 cursor-pointer ${!msg.read ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${!msg.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {msg.subject || '(No subject)'}
                </p>
                <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">{msg.body}</p>
              <div className="flex items-center mt-1 text-xs text-gray-400">
                {msg.read ? <CheckCheck className="w-3 h-3 mr-1 text-blue-500" /> : <Check className="w-3 h-3 mr-1" />}
                From: {msg.from}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
