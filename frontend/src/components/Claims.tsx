import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, X, Heart, MessageSquare, Leaf, Utensils, Users, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type User } from '@/lib/auth';
import api from '@/lib/api';
import MapPreview from './MapPreview';
import { createConversationFromFood } from '@/lib/chat';

interface ClaimsPageProps {
  user: User;
}

export default function ClaimsPage({ user }: ClaimsPageProps) {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [selectedClaimDetail, setSelectedClaimDetail] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingClaim, setVerifyingClaim] = useState<any>(null);
  const navigate = useNavigate();

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get('/claims');
      setClaims(res.data);
    } catch (e) {
      console.error('Failed to fetch claims:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleChatDonor = (food: any) => {
    const convId = createConversationFromFood(food, user.id);
    navigate(`/chat?id=${convId}`);
  };

  const handleCompleteClaim = async (foodId: number) => {
    try {
      // Simulate inputting verification code
      if (!verificationCode.trim()) {
        alert('Silakan masukkan kode verifikasi.');
        return;
      }
      await api.post('/claims/complete', { food_id: foodId });
      alert('Klaim selesai! Terima kasih telah menyelamatkan makanan.');
      setSelectedClaimDetail(null);
      setVerifyingClaim(null);
      setVerificationCode('');
      fetchClaims();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Gagal menyelesaikan klaim.');
    }
  };

  // Helper formatting for pickup_time
  const formatPickupTime = (dateStr: string) => {
    if (!dateStr) return 'Waktu belum ditentukan';
    const d = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    if (d.toDateString() === today.toDateString()) {
      return `Hari ini, ${timeStr}`;
    } else if (d.toDateString() === tomorrow.toDateString()) {
      return `Besok, ${timeStr}`;
    } else {
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + `, ${timeStr}`;
    }
  };

  // Statistics calculations based on completed claims
  const completedClaims = claims.filter(c => c.status === 'completed');
  const activeClaims = claims.filter(c => c.status === 'active' || c.status === 'confirmed');

  const totalPortionsSaved = completedClaims.reduce((acc, c) => acc + (c.food?.portions || 0), 0);
  const totalWeightSaved = completedClaims.reduce((acc, c) => acc + parseFloat(c.food?.weight_kg || '0'), 0);
  const totalCO2Reduced = (totalWeightSaved * 2.5).toFixed(1); // 2.5 kg CO2 per kg food saved

  const currentClaims = activeTab === 'active' ? activeClaims : completedClaims;

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Klaim Saya</h1>
          <p className="text-slate-500 font-medium text-sm mt-2">
            Kelola makanan yang Anda klaim untuk mendukung keberlanjutan pangan.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">CO2 Terhindar</p>
              <p className="text-2xl font-black text-emerald-600 leading-none">{totalCO2Reduced} kg</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Makanan Diselamatkan</p>
              <p className="text-2xl font-black text-emerald-600 leading-none">{totalPortionsSaved} Porsi</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Komunitas Terbantu</p>
              <p className="text-2xl font-black text-slate-800 leading-none">SDG 12</p>
            </div>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex gap-8 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === 'active' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Aktif ({activeClaims.length})
            {activeTab === 'active' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-700 rounded-full animate-fadeIn" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === 'completed' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Selesai ({completedClaims.length})
            {activeTab === 'completed' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-700 rounded-full animate-fadeIn" />
            )}
          </button>
        </div>

        {/* Claim Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="h-96 bg-white/60 animate-pulse rounded-3xl border border-slate-100" />
            ))}
          </div>
        ) : currentClaims.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentClaims.map(claim => {
              const food = claim.food || {};
              const pickupLabel = formatPickupTime(claim.pickup_time);
              const isExpired = food.expired_date ? new Date() > new Date(food.expired_date) : false;

              return (
                <motion.div
                  key={claim.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Image Header */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden shrink-0">
                    <img
                      src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'}
                      alt={food.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      {claim.status === 'active' ? (
                        <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm">
                          Menunggu Konfirmasi
                        </span>
                      ) : claim.status === 'confirmed' ? (
                        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                          Menunggu Penjemputan
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm">
                          Selesai
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-2 truncate">
                      {food.name || 'Makanan Tanpa Nama'}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs font-semibold text-slate-500">
                      <p className="flex items-center gap-1">
                        <span className="font-bold text-slate-800">Donatur:</span> {food.donor_name || 'Donatur'}
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="font-bold text-slate-800">Jumlah:</span> {claim.portions || 1} Porsi
                      </p>
                    </div>

                    {/* Clock Banner */}
                    <div className="bg-blue-50/50 border border-blue-100/50 p-3 rounded-2xl flex items-center gap-2 mb-6 text-xs text-blue-900 font-bold">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Batas Jemput: {pickupLabel}</span>
                    </div>

                    {/* Action Bar */}
                    <div className="flex gap-2.5 mt-auto">
                      <button
                        onClick={() => setSelectedClaimDetail(claim)}
                        className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors text-center"
                      >
                        Lihat Detail
                      </button>
                      <button
                        onClick={() => handleChatDonor(food)}
                        className="p-3 bg-white border border-slate-200 hover:border-emerald-600/40 hover:bg-slate-50 text-slate-600 hover:text-emerald-700 rounded-xl transition-colors shadow-sm flex items-center justify-center shrink-0"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-bold">Belum ada klaim makanan.</p>
            <p className="text-slate-300 text-sm mt-1">Cari makanan lezat yang tersedia di menu Cari Makanan.</p>
          </div>
        )}
      </div>

      {/* Claim Detail Modal */}
      <AnimatePresence>
        {selectedClaimDetail && (() => {
          const claim = selectedClaimDetail;
          const food = claim.food || {};
          const lat = food.lat ? parseFloat(food.lat) : -8.6704;
          const lng = food.lng ? parseFloat(food.lng) : 115.2126;

          return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedClaimDetail(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto flex flex-col [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.200)_transparent]"
              >
                {/* Header Close */}
                <button
                  onClick={() => setSelectedClaimDetail(null)}
                  className="absolute top-4 right-4 p-2 bg-white/85 backdrop-blur-md rounded-full text-slate-900 z-20 hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Cover Image */}
                <div className="h-56 relative bg-slate-100 shrink-0">
                  <img
                    src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    {claim.status === 'active' ? (
                      <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm">
                        Menunggu Konfirmasi
                      </span>
                    ) : claim.status === 'confirmed' ? (
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                        Menunggu Penjemputan
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm">
                        Selesai
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex-grow flex flex-col">
                  <span className="text-emerald-600 font-semibold text-sm mb-1">{food.category || 'Makanan Matang'}</span>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{food.name}</h2>
                  <p className="text-sm text-slate-500 mb-6">{food.description || 'Makanan layak konsumsi siap dijemput.'}</p>

                  {/* Portions & Weight */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-xs text-slate-400 font-semibold block mb-1">Porsi Diklaim</span>
                      <span className="text-sm font-bold text-blue-600">{claim.portions || 1} Porsi</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-xs text-slate-400 font-semibold block mb-1">Berat</span>
                      <span className="text-sm font-bold text-slate-800">{food.weight_kg} kg</span>
                    </div>
                  </div>

                  {/* Delivery Location & Map */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Alamat Penjemputan</p>
                        <p className="text-sm text-slate-600 mt-0.5">{food.pickup_address || 'Lokasi belum tersedia'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Waktu Rencana Jemput</p>
                        <p className="text-sm text-slate-600 mt-0.5">{formatPickupTime(claim.pickup_time)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Leaflet Map Preview */}
                  <div className="rounded-xl overflow-hidden border border-slate-100 relative mb-4">
                    <MapPreview lat={lat} lng={lng} label={food.name} />
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 hover:text-slate-800 font-bold text-xs uppercase tracking-widest rounded-xl text-center transition-colors mb-6"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka di Google Maps
                  </a>

                  {/* Donor Card */}
                  <div className="flex items-center justify-between mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-emerald-50">
                        <img src={`https://ui-avatars.com/api/?name=${food.donor_name || 'D'}&background=10b981&color=fff`} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{food.donor_name || 'Donatur'}</p>
                        <p className="text-xs text-slate-400">Pendonor</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleChatDonor(food)}
                      className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-600 transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Chat Donatur
                    </button>
                  </div>

                  {/* Verification Code Section */}
                  {claim.status === 'confirmed' && claim.code && (
                    <div className="border-t border-slate-100 pt-6 mt-auto">
                      <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl text-center">
                        <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2">Kode Penjemputan Anda</h4>
                        <div className="text-3xl font-black text-emerald-700 tracking-[0.25em] pl-[0.25em] py-2 bg-white rounded-2xl border border-emerald-100/50 inline-block px-8 shadow-sm">
                          {claim.code}
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mt-3 leading-relaxed">
                          Berikan kode 6 digit ini kepada Donatur saat mengambil makanan untuk memverifikasi serah terima di lokasi.
                        </p>
                      </div>
                    </div>
                  )}

                  {claim.status === 'active' && (
                    <div className="border-t border-slate-100 pt-6 mt-auto">
                      <div className="bg-amber-50/30 border border-amber-100/50 p-5 rounded-3xl text-center">
                        <p className="text-xs text-amber-700 font-bold leading-relaxed">
                          Menunggu konfirmasi dari donatur. Kode penjemputan unik akan ditampilkan di sini setelah donasi disetujui.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>


    </div>
  );
}
