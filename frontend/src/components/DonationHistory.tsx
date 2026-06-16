import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Clock, X, MapPin, MessageSquare, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type User } from '@/lib/auth';
import api from '@/lib/api';
import MapPreview from './MapPreview';
import { createConversation } from '@/lib/chat';

interface DonationHistoryProps {
  user: User;
}

export default function DonationHistory({ user }: DonationHistoryProps) {
  const [foods, setFoods] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyTab, setHistoryTab] = useState<'active' | 'claimed' | 'completed'>('active');
  const [selectedFoodDetail, setSelectedFoodDetail] = useState<any>(null);
  const [activeKelolaId, setActiveKelolaId] = useState<number | null>(null);
  const [verifyingCodeClaimId, setVerifyingCodeClaimId] = useState<number | null>(null);
  const [enteredCode, setEnteredCode] = useState<string>('');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resFood, resClaims] = await Promise.all([
        api.get('/food'),
        api.get('/donor/claims')
      ]);
      const myFood = resFood.data.filter((f: any) => Number(f.donor_id) === Number(user.id));
      setFoods(myFood);
      setClaims(resClaims.data);
    } catch (e) {
      console.error('Error fetching donation history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus donasi ini?')) return;
    try {
      await api.delete(`/food/${id}`);
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus donasi.');
    }
  };

  const handleEditClick = (food: any) => {
    navigate('/dashboard?edit=' + food.id);
  };

  const handleCompleteClaim = async (claimId: number, code: string) => {
    if (!code) return alert('Silakan masukkan kode verifikasi terlebih dahulu.');
    try {
      await api.post(`/claims/${claimId}/complete`, { code });
      alert('Klaim berhasil diselesaikan!');
      setVerifyingCodeClaimId(null);
      setEnteredCode('');
      fetchData();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.error || 'Gagal menyelesaikan klaim. Pastikan kode verifikasi benar.');
    }
  };

  const handleConfirmClaim = async (claimId: number) => {
    if (!confirm('Apakah Anda yakin ingin mengonfirmasi/menyetujui klaim ini?')) return;
    try {
      await api.post(`/claims/${claimId}/confirm`);
      alert('Klaim berhasil dikonfirmasi!');
      fetchData();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.error || 'Gagal mengonfirmasi klaim.');
    }
  };

  const handleRejectClaim = async (claimId: number) => {
    if (!confirm('Apakah Anda yakin ingin menolak klaim ini? Sisa porsi akan dikembalikan ke donasi aktif.')) return;
    try {
      await api.post(`/claims/${claimId}/reject`);
      alert('Klaim berhasil ditolak!');
      fetchData();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.error || 'Gagal menolak klaim.');
    }
  };

  const handleChatReceiver = (receiver: any, food: any) => {
    if (!receiver) return;

    const stub = {
      donor_id: food?.donor_id || food?.donor?.id || 1,
      receiver_id: receiver.id,
      name: receiver.name || 'Penerima',
      role: 'Penerima',
      time: 'Baru',
      lastMsg: `Tanya tentang klaim donasi "${food?.name || 'Makanan'}"`,
      unread: 0,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(receiver.name || 'Penerima')}&background=3b82f6&color=fff`,
      foodName: food?.name || 'Makanan'
    };

    const welcomeMsgs = [
      { id: 1, senderId: receiver.id, text: `Halo! Saya ingin mengambil donasi "${food?.name || 'Makanan'}". Kapan saya bisa menjemputnya?`, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), isMe: false }
    ];

    const convId = createConversation(stub, welcomeMsgs);
    navigate(`/chat?id=${convId}`);
  };

  const activeItems = foods.filter(f =>
    Number(f.portions ?? 0) - Number(f.claimed_portions ?? 0) > 0 &&
    String(f.status ?? '').toLowerCase() !== 'completed'
  );
  const claimedItems = claims.filter(c => c.status === 'active' || c.status === 'confirmed');
  const completedItems = claims.filter(c => c.status === 'completed');

  return (
    <div className="pt-28 pb-20 min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Riwayat Donasi</h1>
          <p className="text-slate-500 font-medium text-base mt-2 max-w-lg">
            Pantau kontribusi Anda dalam menekan limbah pangan dan membantu sesama.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-10 border-b border-slate-200">
          <button
            onClick={() => setHistoryTab('active')}
            className={`pb-3.5 text-sm font-semibold transition-all relative ${
              historyTab === 'active' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Aktif ({activeItems.length})
            {historyTab === 'active' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => setHistoryTab('claimed')}
            className={`pb-3.5 text-sm font-semibold transition-all relative ${
              historyTab === 'claimed' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Di Klaim ({claimedItems.length})
            {historyTab === 'claimed' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setHistoryTab('completed')}
            className={`pb-3.5 text-sm font-semibold transition-all relative ${
              historyTab === 'completed' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Selesai ({completedItems.length})
            {historyTab === 'completed' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Card Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map(i => <div key={i} className="h-[420px] bg-white/60 animate-pulse rounded-3xl" />)}
          </div>
        ) : historyTab === 'active' ? (
          activeItems.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {activeItems.map(food => (
                <div key={food.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-300">
                  {/* Image */}
                  <div className="relative h-56 w-full bg-slate-100 overflow-hidden shrink-0">
                    {food.image ? (
                      <img src={food.image} className="w-full h-full object-cover" alt={food.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                        <Heart className="w-8 h-8" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-emerald-650 text-white bg-emerald-600">
                        Tersedia
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* 1. Nama Makanan*/}
                    <h4 className="text-xl font-bold text-slate-900 leading-tight mb-1">
                      {food.name}
                    </h4>

                    {/* 2. Kategori Makanan */}
                    <span className="text-emerald-650 font-semibold text-sm mb-4 text-emerald-600">
                      {food.category || 'Makanan Matang'}
                    </span>

                    {/* Info rows */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                       
                        <span>{food.portions - food.claimed_portions} Porsi Tersedia / {food.portions} Porsi Asli</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                       
                        <span>Diposting: {new Date(food.created_at || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-auto relative">
                      <div className="flex-1 relative">
                        <button
                          onClick={() => setActiveKelolaId(activeKelolaId === food.id ? null : food.id)}
                          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors text-center"
                        >
                          Kelola
                        </button>

                        {activeKelolaId === food.id && (
                          <div className="absolute bottom-full left-0 mb-2 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 w-44 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <button
                              onClick={() => {
                                setActiveKelolaId(null);
                                handleEditClick(food);
                              }}
                              className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                            >
                              ✏️ Ubah Donasi
                            </button>
                            <button
                              onClick={() => {
                                setActiveKelolaId(null);
                                handleDelete(food.id);
                              }}
                              className="w-full text-left px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                            >
                              🗑️ Hapus Donasi
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedFoodDetail(food)}
                        className="flex-1 py-3.5 border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-center"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-semibold text-sm">Tidak ada donasi aktif</p>
            </div>
          )
        ) : historyTab === 'claimed' ? (
          claimedItems.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {claimedItems.map(claim => (
                <div key={claim.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-300">
                  {/* Image */}
                  <div className="relative h-56 w-full bg-slate-100 overflow-hidden shrink-0">
                    {claim.food?.image ? (
                      <img src={claim.food.image} className="w-full h-full object-cover" alt={claim.food.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                        <Heart className="w-8 h-8" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      {claim.status === 'active' ? (
                        <span className="text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-amber-500 text-white shadow-sm">
                          Menunggu Konfirmasi
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-emerald-600 text-white shadow-sm">
                          Disetujui
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* 1. Nama Makanan  */}
                    <h4 className="text-xl font-bold text-slate-900 leading-tight mb-1">
                      {claim.food?.name}
                    </h4>

                    {/* 2. Kategori Makanan */}
                    <span className="text-amber-600 font-semibold text-sm mb-4">
                      {claim.food?.category || 'Makanan Matang'}
                    </span>
                    
                    {/* Receiver Info */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-full bg-blue-100 overflow-hidden shrink-0">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(claim.receiver?.name || 'Penerima')}&background=dbeafe&color=2563eb`} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-semibold">Diklaim Oleh</p>
                        <p className="text-sm font-bold text-slate-800">{claim.receiver?.name || 'Penerima'}</p>
                      </div>
                    </div>

                    {/* Info rows */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                        
                        <span>{claim.portions} Porsi Diklaim</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                        
                        <span className="font-bold text-amber-600">Rencana Ambil: {new Date(claim.pickup_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {claim.status === 'active' ? (
                      <div className="flex gap-2.5 mt-auto">
                        <button
                          onClick={() => handleChatReceiver(claim.receiver, claim.food)}
                          className="p-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all flex items-center justify-center shrink-0"
                          title="Chat Penerima"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleRejectClaim(claim.id)}
                          className="flex-1 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <X className="w-4 h-4" />
                          Tolak
                        </button>

                        <button
                          onClick={() => handleConfirmClaim(claim.id)}
                          className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          Terima
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 mt-auto w-full">
                        {verifyingCodeClaimId === claim.id ? (
                          <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 animate-fadeIn">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Masukkan Kode dari Penerima</p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="6 digit kode"
                                value={enteredCode}
                                onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-center tracking-[0.2em] focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30"
                              />
                              <button
                                onClick={() => handleCompleteClaim(claim.id, enteredCode)}
                                className="px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all"
                              >
                                Verifikasi
                              </button>
                              <button
                                onClick={() => {
                                  setVerifyingCodeClaimId(null);
                                  setEnteredCode('');
                                }}
                                className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold text-xs rounded-xl transition-all"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3 w-full">
                            <button
                              onClick={() => handleChatReceiver(claim.receiver, claim.food)}
                              className="flex-1 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Chat Penerima
                            </button>

                            <button
                              onClick={() => {
                                setVerifyingCodeClaimId(claim.id);
                                setEnteredCode('');
                              }}
                              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Selesaikan
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-semibold text-sm">Tidak ada makanan yang sedang diklaim</p>
            </div>
          )
        ) : (
          completedItems.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {completedItems.map(claim => (
                <div key={claim.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-300">
                  {/* Image */}
                  <div className="relative h-56 w-full bg-slate-100 overflow-hidden shrink-0">
                    {claim.food?.image ? (
                      <img src={claim.food.image} className="w-full h-full object-cover" alt={claim.food.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                        <Heart className="w-8 h-8" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-slate-650 text-white bg-slate-600">
                        Selesai
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* 1. Nama Makanan*/}
                    <h4 className="text-xl font-bold text-slate-900 leading-tight mb-1">
                      {claim.food?.name}
                    </h4>

                    {/* 2. Kategori Makanan */}
                    <span className="text-slate-500 font-semibold text-sm mb-4">
                      {claim.food?.category || 'Makanan Matang'}
                    </span>
                    
                    {/* Info Rows */}
                    <div className="space-y-2 mb-4">
                      {/* 3. Jumlah Porsi */}
                      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                    
                        <span>{claim.portions} Porsi Selesai Diambil</span>
                      </div>
                      {/* 4. Waktu Selesai */}
                      <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                        
                        <span>Selesai pada: {new Date(claim.updated_at || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* 5. Nama Penerima  */}
                    <div className="text-sm font-medium text-slate-600 mb-4 border-t border-slate-100 pt-3">
                      Diterima oleh: <span className="font-bold text-slate-800">{claim.receiver?.name || 'Penerima'}</span>
                    </div>

                    {/* 6. Button Detail  */}
                    <div className="flex justify-end mt-auto">
                      <button
                        onClick={() => setSelectedFoodDetail(claim.food)}
                        className="px-5 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-center"
                      >
                        Detail Makanan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-semibold text-sm">Belum ada donasi yang selesai</p>
            </div>
          )
        )}
      </div>

      {/* Food Detail Modal */}
      <AnimatePresence>
        {selectedFoodDetail && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedFoodDetail(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto flex flex-col">
              <button onClick={() => setSelectedFoodDetail(null)} className="absolute top-4 right-4 p-2 bg-white/85 backdrop-blur-md rounded-full text-slate-900 z-20 hover:bg-slate-100 transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>

              <div className="h-56 relative bg-slate-100 shrink-0">
                {selectedFoodDetail.image ? (
                  <img src={selectedFoodDetail.image} alt={selectedFoodDetail.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><Heart className="w-8 h-8" /></div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-emerald-600 text-white">
                    Tersedia
                  </span>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <span className="text-emerald-600 font-semibold text-sm mb-1">
                  {selectedFoodDetail.category || 'Makanan Matang'}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedFoodDetail.name}</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-xs text-slate-400 font-semibold block mb-1">Jumlah Porsi</span>
                    <span className="text-sm font-bold text-slate-800">{selectedFoodDetail.portions} Porsi</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-xs text-slate-400 font-semibold block mb-1">Berat Makanan</span>
                    <span className="text-sm font-bold text-slate-800">{selectedFoodDetail.weight_kg} kg</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block mb-1">Batas Waktu Pengambilan</span>
                    <span className="text-sm font-bold text-slate-700">
                      {selectedFoodDetail.expired_date ? new Date(selectedFoodDetail.expired_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                    </span>
                  </div>
                  {selectedFoodDetail.description && (
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block mb-1">Deskripsi</span>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed italic">"{selectedFoodDetail.description}"</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block mb-1">Alamat Penjemputan</span>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">{selectedFoodDetail.pickup_address}</p>
                    </div>
                  </div>
                </div>

                {selectedFoodDetail.lat && selectedFoodDetail.lng && (
                  <div className="rounded-2xl overflow-hidden border border-slate-100 h-36 relative mb-6">
                    <MapPreview lat={parseFloat(selectedFoodDetail.lat)} lng={parseFloat(selectedFoodDetail.lng)} label={selectedFoodDetail.name} />
                  </div>
                )}

                <button
                  onClick={() => setSelectedFoodDetail(null)}
                  className="mt-auto w-full py-3.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
