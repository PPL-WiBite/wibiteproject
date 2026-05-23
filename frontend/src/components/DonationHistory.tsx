import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Clock, X, MapPin, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type User } from '@/lib/auth';
import api from '@/lib/api';
import MapPreview from './MapPreview';

interface DonationHistoryProps {
  user: User;
}

export default function DonationHistory({ user }: DonationHistoryProps) {
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyTab, setHistoryTab] = useState<'active' | 'completed'>('active');
  const [selectedFoodDetail, setSelectedFoodDetail] = useState<any>(null);
  const [activeKelolaId, setActiveKelolaId] = useState<number | null>(null);
  const [editingFood, setEditingFood] = useState<any>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/food');
      const myFood = res.data.filter((f: any) => f.donor_id === user.id);
      setFoods(myFood);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user]);

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
    // Navigate to dashboard with edit state
    navigate('/dashboard?edit=' + food.id);
  };

  const activeItems = foods.filter(f => f.status !== 'completed');
  const completedItems = foods.filter(f => f.status === 'completed');
  const currentItems = historyTab === 'active' ? activeItems : completedItems;

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
        ) : currentItems.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {currentItems.map(food => (
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
                    <span className={`text-xs font-bold px-4 py-1.5 rounded-full ${
                      food.status === 'completed'
                        ? 'bg-slate-600 text-white'
                        : food.status === 'claimed'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                    }`}>
                      {food.status === 'completed' ? 'Selesai' : food.status === 'claimed' ? 'Diklaim' : 'Tersedia'}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Category */}
                  <span className="text-emerald-600 font-semibold text-sm mb-1">
                    {food.category || 'Makanan Matang'}
                  </span>

                  {/* Name */}
                  <h4 className="text-xl font-bold text-slate-900 leading-tight mb-4">{food.name}</h4>

                  {/* Info rows */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                      <span className="text-base">📦</span>
                      <span>{food.portions} Porsi / {food.weight_kg}kg</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                      <span className="text-base">📅</span>
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
            <p className="text-slate-400 font-semibold text-sm">Tidak ada riwayat donasi</p>
          </div>
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
                  <span className={`text-xs font-bold px-4 py-1.5 rounded-full ${
                    selectedFoodDetail.status === 'completed'
                      ? 'bg-slate-600 text-white'
                      : selectedFoodDetail.status === 'claimed'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                  }`}>
                    {selectedFoodDetail.status === 'completed' ? 'Selesai' : selectedFoodDetail.status === 'claimed' ? 'Diklaim' : 'Tersedia'}
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
                      {new Date(selectedFoodDetail.expired_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
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
