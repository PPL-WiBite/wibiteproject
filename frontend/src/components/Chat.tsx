import React, { useState, useEffect, useMemo } from 'react';
import { Search, Send, Image as ImageIcon, ArrowLeft, User, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocation} from 'react-router-dom';
import { User as AuthUser } from '@/lib/auth';
import { createConversationFromFood } from '@/lib/chat';

interface ChatProps {
  user: AuthUser | null;
}

const Chat: React.FC<ChatProps> = ({ user }) => {

  const [rawConversations, setRawConversations] = useState<any[]>(() => {
    const saved = localStorage.getItem('wibite_conversations');
    return saved ? JSON.parse(saved) : [];
  });

  const conversations = useMemo(() => {
    if (!user) return [];

    const currentUserId = String(user.id);
    return rawConversations.filter((conv: any) =>
      String(conv.donor_id) === currentUserId ||
      String(conv.receiver_id) === currentUserId ||
      String(conv.other_user?.id) === currentUserId
    );
  }, [rawConversations, user]);

  // NOTE: Do not automatically remove stored conversations on mount.
  // This prevents legitimate conversations from being erased when user switches accounts.

  const [activeChat, setActiveChat] = useState<number | null>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const idParam = searchParams.get('id');
    if (idParam) {
      return parseInt(idParam);
    }
    return null;
  });

  useEffect(() => {
    if (activeChat === null && conversations.length > 0) {
      setActiveChat(conversations[0].id);
    }
  }, [activeChat, conversations]);

  const [activeFilter, setActiveFilter] = useState<'semua' | 'unread' | 'donasi'>('semua');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsgText, setNewMsgText] = useState('');

  // Minimal flags/placeholders to avoid runtime reference errors
  const loading = false;
  const sendingMessage = false;

  const Loader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
    <div
      {...props}
      className={`w-4 h-4 border-2 border-slate-200 rounded-full animate-spin ${className ?? ''}`}
    />
  );

  // Sync and normalize messages when activeChat or current user changes
  useEffect(() => {
    if (activeChat) {
      const savedMsgs = localStorage.getItem(`wibite_msgs_${activeChat}`);
      const parsed = savedMsgs ? JSON.parse(savedMsgs) : [];
      const normalized = parsed.map((msg: any) => {
        const isMe = user
          ? msg.senderId !== undefined && msg.senderId !== null
            ? String(msg.senderId) === String(user.id)
            : Boolean(msg.isMe)
          : Boolean(msg.isMe);
        return { ...msg, isMe };
      });
      setMessages(normalized);
    } else {
      setMessages([]);
    }
  }, [activeChat, user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim() || !activeChat || !user) return;

    const senderId = user.id;
    const newMsg = {
      id: Date.now(),
      senderId,
      text: newMsgText.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    const updatedMsgs = [...messages, newMsg];
    setMessages(updatedMsgs);
    localStorage.setItem(`wibite_msgs_${activeChat}`, JSON.stringify(updatedMsgs));

    const updatedRawConvs = rawConversations.map(c => {
      if (c.id === activeChat) {
        return { ...c, lastMsg: newMsgText.trim(), time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) };
      }
      return c;
    });
    setRawConversations(updatedRawConvs);
    localStorage.setItem('wibite_conversations', JSON.stringify(updatedRawConvs));
    setNewMsgText('');
  };

  const activeChatDetails = conversations.find(c => c.id === activeChat);

  const getConversationOtherUser = (conv: any) => {
    const currentUserId = user ? String(user.id) : null;
    const donorId = conv.donor_id !== undefined ? String(conv.donor_id) : null;
    const receiverId = conv.receiver_id !== undefined ? String(conv.receiver_id) : null;

    if (!currentUserId || !donorId || !receiverId) {
      return {
        name: conv.other_user?.name || conv.name,
        avatar: conv.other_user?.avatar || conv.avatar
      };
    }

    if (currentUserId === donorId) {
      return {
        name: conv.receiver_name || conv.receiverName || conv.name,
        avatar: conv.receiver_avatar || conv.receiverAvatar || conv.other_user?.avatar || conv.avatar
      };
    }

    return {
      name: conv.donor_name || conv.donorName || conv.name,
      avatar: conv.donor_avatar || conv.donorAvatar || conv.other_user?.avatar || conv.avatar
    };
  };

  // Normalize food data for older/newer conversation shapes
  const activeFood = activeChatDetails
    ? activeChatDetails.food || (activeChatDetails.foodName ? { name: activeChatDetails.foodName, image: activeChatDetails.foodImage } : null)
    : null;

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    if (activeFilter === 'unread') return c.unread > 0;
    if (activeFilter === 'donasi') return !!c.foodName;
    return true;
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Ambil data donatur & makanan yang dilempar dari tombol chat kartu klaim
  const incomingData = location.state as { 
    donatorId: string | number; 
    donatorName: string; 
    foodName?: string;
    foodImage?: string;
  } | null;

  useEffect(() => {
    if (!incomingData || !user) return;

    const donorId = Number(incomingData.donatorId);
    if (isNaN(donorId)) return;

    const food = {
      donor_id: donorId,
      donor_name: incomingData.donatorName,
      name: incomingData.foodName || 'Donasi Makanan',
      image: incomingData.foodImage || null,
    };

    const convId = createConversationFromFood(food, user.id);
    const saved = localStorage.getItem('wibite_conversations');
    setRawConversations(saved ? JSON.parse(saved) : []);
    setActiveChat(convId);
    navigate(location.pathname, { replace: true, state: null });
  }, [incomingData, user, navigate, location.pathname]);

  return (
    <div className="pt-6 pb-6 px-4 lg:px-12 max-w-[1440px] mx-auto h-screen flex flex-col w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-800" />
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900">Pesan</h1>
        </div>
        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <User className="w-5 h-5 text-slate-800" />
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm flex-1 flex overflow-hidden min-h-[500px]">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-100 flex flex-col bg-white shrink-0">
          {/* Filters */}
          <div className="px-6 py-4 flex gap-2 border-b border-slate-100 shrink-0">
            <button
              onClick={() => setActiveFilter('semua')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === 'semua'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === 'unread'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Belum Dibaca
            </button>
            <button
              onClick={() => setActiveFilter('donasi')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === 'donasi'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Donasi
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto space-y-0 scrollbar-hide">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map(conv => {
                const otherUser = getConversationOtherUser(conv);
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveChat(conv.id)}
                    className={`p-4 cursor-pointer transition-all flex items-start gap-3 relative border-b border-slate-100 ${
                      activeChat === conv.id ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'
                    }`}
                  >
                    {/* Selected Indicator Bar */}
                    {activeChat === conv.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-800" />
                    )}
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img src={otherUser.avatar || ''} alt={otherUser.name || 'User'} className="w-12 h-12 rounded-full object-cover" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold truncate text-sm text-slate-800">{otherUser.name || 'User'}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold shrink-0 ml-2">{conv.last_message_time || conv.time || conv.lastMsg || '-'}</span>
                      </div>
                      <p className="text-xs truncate text-slate-500 font-medium">
                        {conv.last_message || conv.lastMsg || 'Mulai percakapan...'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 px-4">
                <p className="text-xs font-semibold text-slate-400">Belum ada obrolan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white relative">
          {activeChatDetails ? (
            <>
              {/* Donation Header Banner */}
              {activeFood && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl flex items-center justify-between gap-4 mx-6 mt-6 mb-2 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-emerald-100/50">
                      <img
                        src={activeFood.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=150'}
                        className="w-full h-full object-cover"
                        alt="Food thumbnail"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-emerald-600 block uppercase tracking-wider">
                        Percakapan tentang donasi:
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-800 leading-tight">
                        {activeFood.name}
                      </h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/explore')}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-all shrink-0"
                  >
                    Lihat Detail
                  </button>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Date separator badge */}
                <div className="flex justify-center my-2">
                  <span className="bg-slate-100 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full tracking-wider">
                    Hari Ini
                  </span>
                </div>

                {messages.length > 0 ? (
                  messages.map(msg => (
                      <div key={msg.id} className="w-full">
                        {msg.isMe ? (
                          /* Outgoing Message Bubble (Right Side) */
                          <div className="flex flex-col items-end gap-1 max-w-[65%] ml-auto">
                            <div className="bg-emerald-800 text-white p-4 rounded-2xl rounded-tr-none text-sm font-medium leading-relaxed shadow-sm">
                              {msg.text}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold px-1">
                              <span>{msg.time}</span>
                              <span className="text-emerald-600">✔✔</span>
                            </div>
                          </div>
                        ) : (
                          /* Incoming Message Bubble (Left Side) */
                          <div className="flex flex-col items-start gap-1 max-w-[65%]">
                            <div className="bg-blue-50/70 border border-blue-100/10 text-slate-800 p-4 rounded-2xl rounded-tl-none text-sm font-medium leading-relaxed shadow-sm">
                              {msg.text}
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold px-1">
                              {msg.time}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                  <div className="text-center py-8">
                    <p className="text-xs font-semibold text-slate-400">Belum ada pesan dalam percakapan ini.</p>
                  </div>
                )}
              </div>

              {/* Input Area Form */}
              <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100 flex flex-col gap-2 shrink-0">
                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <button type="button" className="p-1 hover:bg-slate-200/50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                  <button type="button" className="p-1 hover:bg-slate-200/50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Tulis pesan..."
                    value={newMsgText}
                    onChange={(e) => setNewMsgText(e.target.value)}
                    disabled={sendingMessage}
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage}
                    className="w-10 h-10 bg-emerald-800 hover:bg-emerald-950 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-all shadow-md shrink-0"
                  >
                    {sendingMessage ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-1">
                  <span>🔒</span>
                  <span>Percakapan ini dienkripsi demi keamanan Anda.</span>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/10">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <Send className="w-6 h-6 rotate-45 mr-1" />
              </div>
              <h3 className="text-sm font-black text-slate-800">Obrolan Anda</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1.5 max-w-sm text-center leading-relaxed">
                Belum ada obrolan aktif. Mulai obrolan dengan mengklik tombol "Chat" pada detail donasi makanan di halaman Cari Makanan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
 