import React, { useState, useEffect } from 'react';
import { Search, Send, Image as ImageIcon, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { User } from '@/lib/auth';

interface ChatProps {
  user: User | null;
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  const [conversations, setConversations] = useState<any[]>(() => {
    const saved = localStorage.getItem('wibite_conversations');
    return saved ? JSON.parse(saved) : [];
  });

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
        return { ...c, lastMsg: newMsgText.trim(), time: 'Baru' };
      }
      return c;
    });
    setConversations(updatedConvs);
    localStorage.setItem('wibite_conversations', JSON.stringify(updatedConvs));
    setNewMsgText('');
  };

  const activeChatDetails = conversations.find(c => c.id === activeChat);

  return (
    <div className="pt-24 pb-8 px-4 lg:px-12 max-w-[1440px] mx-auto h-[calc(100vh-80px)] flex flex-col w-full">
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm flex-1 flex overflow-hidden min-h-[600px]">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50 shrink-0">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-800 mb-5">
              Semua Obrolan <span className="text-emerald-500 text-xs ml-1">({conversations.length})</span>
            </h2>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Pesan atau pengguna" 
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:font-normal" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
            {conversations.length > 0 ? (
              conversations.map(conv => (
                <div key={conv.id} onClick={() => setActiveChat(conv.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-start gap-3 ${activeChat === conv.id ? 'bg-white shadow-sm border border-slate-100' : 'hover:bg-slate-100/80 border border-transparent'}`}>
                  <div className="relative shrink-0">
                    <img src={conv.avatar} alt={conv.name} className="w-11 h-11 rounded-full object-cover" />
                    {conv.unread > 0 ? (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {conv.unread}
                      </span>
                    ) : (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`font-bold truncate text-sm ${activeChat === conv.id ? 'text-slate-900' : 'text-slate-700'}`}>{conv.name}</h4>
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0 ml-2">{conv.time}</span>
                    </div>
                    <p className={`text-[11px] truncate leading-relaxed ${activeChat === conv.id ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
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
              {/* Header */}
              <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm z-10 sticky top-0">
                <div className="flex items-center gap-4">
                  <img src={activeChatDetails.avatar} alt={activeChatDetails.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-50" />
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight">{activeChatDetails.name}</h3>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">{activeChatDetails.role}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"><Phone className="w-5 h-5" /></button>
                  <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"><Video className="w-5 h-5" /></button>
                  <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-4 max-w-[80%] ${msg.isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                    {!msg.isMe && (
                      <img src={activeChatDetails.avatar} alt="Avatar" className="w-8 h-8 rounded-full shrink-0 mt-1" />
                    )}
                    {msg.isMe && (
                      <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Me'}&background=10b981&color=fff`} alt="My Avatar" className="w-8 h-8 rounded-full shrink-0 mt-1" />
                    )}
                    <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <span className="text-[11px] font-bold text-slate-600">{msg.isMe ? (user?.name || 'Anda') : activeChatDetails.name}</span>
                        <span className="text-[10px] font-semibold text-slate-400">{msg.time}</span>
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.isMe 
                        ? 'bg-blue-600 text-white rounded-tr-sm shadow-md shadow-blue-600/20' 
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100">
                <div className="flex items-end gap-3">
                  <div className="flex gap-1 pb-1 shrink-0">
                    <button type="button" className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"><Paperclip className="w-5 h-5" /></button>
                    <button type="button" className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"><ImageIcon className="w-5 h-5" /></button>
                  </div>
                  <div className="flex-1 relative">
                    <textarea 
                      placeholder="Ketik pesan Anda di sini..." 
                      value={newMsgText}
                      onChange={e => setNewMsgText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 pr-14 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none min-h-[52px] max-h-32 placeholder:font-normal"
                      rows={1}
                    ></textarea>
                    <button type="submit" className="absolute right-1.5 bottom-1.5 w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20">
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
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
