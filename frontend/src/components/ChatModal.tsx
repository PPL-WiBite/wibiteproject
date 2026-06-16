import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Send, Clock, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import type { User } from '@/lib/auth';

interface Message {
  id: number;
  claim_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  sender?: { id: number; name: string; role: string };
}

interface ChatContext {
  claimId: number;
  foodName: string;
  counterpartName: string;
  portions?: number;
}

interface Props {
  user: User;
  context: ChatContext;
  onClose: () => void;
}

export default function ChatModal({ user, context, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/claims/${context.claimId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error('Gagal memuat pesan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Polling cepat supaya chat terasa 2 arah untuk donor dan receiver.
    const interval = setInterval(fetchMessages, 2500);
    const onFocus = () => fetchMessages();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.claimId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || sending) return;

    setSending(true);
    try {
      const res = await api.post(`/claims/${context.claimId}/messages`, { content });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Gagal kirim pesan:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        className="bg-white w-full max-w-xl rounded-t-[2rem] md:rounded-[2rem] shadow-2xl relative z-10 flex flex-col h-[85vh] md:h-[600px] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chat dengan</p>
              <h3 className="text-base font-black text-slate-900 truncate">{context.counterpartName}</h3>
              <p className="text-xs text-slate-500 truncate">
                {context.foodName}
                {context.portions ? ` - ${context.portions} porsi` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400"
            aria-label="Tutup chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-slate-50/60 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <Clock className="w-5 h-5 animate-spin mr-2" /> Memuat pesan...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold text-sm">Belum ada pesan.</p>
              <p className="text-slate-400 text-xs mt-1">
                Mulai percakapan untuk koordinasi penjemputan.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.sender_id === user.id;
              return (
                <div
                  key={m.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      isMine
                        ? 'bg-emerald-500 text-white rounded-br-md'
                        : 'bg-white border border-slate-100 text-slate-900 rounded-bl-md'
                    }`}
                  >
                    {!isMine && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        {m.sender?.name || 'Pengguna'}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{m.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isMine ? 'text-emerald-100/80' : 'text-slate-400'
                      }`}
                    >
                      {new Date(m.created_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="px-4 py-4 border-t border-slate-100 bg-white flex items-center gap-3"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Kirim"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}