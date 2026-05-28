import React, { useState, useEffect } from 'react';
import { Search, Send, Image as ImageIcon, ArrowLeft, User, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocation} from 'react-router-dom';
import { User as AuthUser } from '@/lib/auth';

interface ChatProps {
  user: AuthUser | null;
}

const Chat: React.FC<ChatProps> = ({ user }) => {

  const [conversations, setConversations] = useState<any[]>(() => {
    const saved = localStorage.getItem('wibite_conversations');
    return saved ? JSON.parse(saved) : [];
  });

  // Cleanup previously seeded dummies from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wibite_conversations');
    if (saved) {
      const convs = JSON.parse(saved);
      const cleaned = convs.filter((c: any) => 
        c.id !== 1 && 
        c.id !== 2 && 
        c.id !== 3 && 
        c.donor_id !== 1 &&
        c.name !== 'Test Donor' &&
        c.name !== 'Donatur' &&
        c.name !== 'Aria Sutedja' &&
        c.name !== 'Budi Hartono' &&
        !c.name.toLowerCase().includes('dummy') &&
        !c.name.toLowerCase().includes('test')
      );
      
      // Remove messages associated with removed conversations
      convs.forEach((c: any) => {
        if (!cleaned.some((cl: any) => cl.id === c.id)) {
          localStorage.removeItem(`wibite_msgs_${c.id}`);
        }
      });

      if (cleaned.length !== convs.length) {
        localStorage.setItem('wibite_conversations', JSON.stringify(cleaned));
        setConversations(cleaned);
        
        // Reset active chat if it was one of the dummies
        const searchParams = new URLSearchParams(window.location.search);
        const idParam = searchParams.get('id');
        const defaultActive = idParam ? parseInt(idParam) : (cleaned.length > 0 ? cleaned[0].id : null);
        setActiveChat(defaultActive);
      }
    }
  }, []);

  const [activeChat, setActiveChat] = useState<number | null>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const idParam = searchParams.get('id');
    if (idParam) {
      return parseInt(idParam);
    }
    const saved = localStorage.getItem('wibite_conversations');
    if (saved) {
      const convs = JSON.parse(saved);
      if (convs.length > 0) return convs[0].id;
    }
    return null;
  });

  const [activeFilter, setActiveFilter] = useState<'semua' | 'unread' | 'donasi'>('semua');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsgText, setNewMsgText] = useState('');

  // Sync messages when activeChat changes
  useEffect(() => {
    if (activeChat) {
      const savedMsgs = localStorage.getItem(`wibite_msgs_${activeChat}`);
      setMessages(savedMsgs ? JSON.parse(savedMsgs) : []);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim() || !activeChat) return;

    const newMsg = {
      id: Date.now(),
      senderId: 'me',
      text: newMsgText.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    const updatedMsgs = [...messages, newMsg];
    setMessages(updatedMsgs);
    localStorage.setItem(`wibite_msgs_${activeChat}`, JSON.stringify(updatedMsgs));

    const updatedConvs = conversations.map(c => {
      if (c.id === activeChat) {
        return { ...c, lastMsg: newMsgText.trim(), time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) };
      }
      return c;
    });
    setConversations(updatedConvs);
    localStorage.setItem('wibite_conversations', JSON.stringify(updatedConvs));
    setNewMsgText('');
  };

  const activeChatDetails = conversations.find(c => c.id === activeChat);

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
    if (incomingData) {
      // 1. Paksa ID menjadi NUMBER murni agar sinkron dengan state activeChat Anda
      const targetChatId = Number(incomingData.donatorId);

      // Antisipasi jika id yang dikirim bukan angka valid
      if (isNaN(targetChatId)) return;

      // 2. Cek kesamaan menggunakan tipe number
      const isChatExist = conversations.some(conv => conv.id === targetChatId);

      if (!isChatExist) {
        // 3. Buat objek obrolan baru dengan format tipe data yang sesuai
        const newConversationStub = {
          id: targetChatId, // Berupa number
          name: incomingData.donatorName,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          lastMsg: 'Memulai percakapan baru...',
          online: true,
          unread: 0,
          foodName: incomingData.foodName || '10 Bungkus Nasi Padang',
          foodImage: incomingData.foodImage
        };

        const updatedConversations = [newConversationStub, ...conversations];
        
        // Update state dan amankan ke localStorage agar tidak hilang saat di-refresh
        setConversations(updatedConversations);
        localStorage.setItem('wibite_conversations', JSON.stringify(updatedConversations));
      }

      // 4. Buka ruangan obrolan di sisi kanan secara otomatis (Sekarang aman karena sama-sama number!)
      setActiveChat(targetChatId);

      // 5. Bersihkan state router agar saat halaman di-refresh tidak melakukan looping data stub
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [incomingData, conversations, navigate, location.pathname]);

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
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conv => (
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
                  {/* Avatar with Online Badge */}
                  <div className="relative shrink-0">
                    <img src={conv.avatar} alt={conv.name} className="w-12 h-12 rounded-full object-cover" />
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold truncate text-sm text-slate-800">{conv.name}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0 ml-2">{conv.time}</span>
                    </div>
                    <p className="text-xs truncate text-slate-500 font-medium">
                      {conv.lastMsg}
                    </p>
                  </div>
                </div>
              ))
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
              {activeChatDetails.foodName && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl flex items-center justify-between gap-4 mx-6 mt-6 mb-2 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-emerald-100/50">
                      <img
                        src={activeChatDetails.foodImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=150'}
                        className="w-full h-full object-cover"
                        alt="Food thumbnail"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-emerald-600 block uppercase tracking-wider">
                        Percakapan tentang donasi:
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-800 leading-tight">
                        {activeChatDetails.foodName}
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

                {messages.map(msg => (
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
                ))}
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
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="w-10 h-10 bg-emerald-800 hover:bg-emerald-950 text-white rounded-full flex items-center justify-center transition-all shadow-md shrink-0"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
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
