import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, Clock, TrendingUp, PlusCircle, Trash2, CheckCircle2, X, MapPin, Edit2
} from 'lucide-react';
import { type User } from '@/lib/auth';
import api from '@/lib/api';
import MapPicker from './MapPicker';

interface DonorDashboardProps {
  user: User;
  openAddFood?: boolean;
  onCloseAddFood?: () => void;
}

const AddFoodModal = ({ onClose, onAdd, initialData }: { onClose: () => void; onAdd: (data: any, id?: number) => void; initialData?: any }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    portions: initialData?.portions || 1,
    weight_kg: initialData?.weight_kg || 0.5,
    pickup_address: initialData?.pickup_address || '',
    lat: initialData?.lat || (null as number | null),
    lng: initialData?.lng || (null as number | null),
    expired_date: initialData?.expired_date ? new Date(initialData.expired_date).toISOString().slice(0, 16) : new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    description: initialData?.description || '',
    category: initialData?.category || 'Makanan Matang',
  });
  const [showMap, setShowMap] = useState(false);
  const categories = ['Makanan Matang', 'Bahan Baku', 'Roti & Kue', 'Buah & Sayur', 'Lainnya'];

  const handleCoordinatePicked = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({ ...prev, lat, lng, pickup_address: address }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl relative z-10 max-h-[92vh] overflow-y-auto">

        <div className="flex justify-between items-center mb-7">
          <h2 className="text-2xl font-black text-slate-900">{initialData ? 'Edit Donasi' : 'Donasi Makanan'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onAdd(formData, initialData?.id); }} className="grid gap-5">
          {/* Nama */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Makanan</label>
            <input type="text" required placeholder="Contoh: 5 Box Nasi Ayam Bakar"
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-base" />
          </div>

          {/* Porsi + Berat */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jumlah Porsi</label>
              <input type="number" min="1" value={formData.portions}
                onChange={e => setFormData({ ...formData, portions: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Berat (kg)</label>
              <input type="number" step="0.1" value={formData.weight_kg}
                onChange={e => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 font-bold" />
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button key={c} type="button" onClick={() => setFormData({ ...formData, category: c })}
                  className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${formData.category === c
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-300'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Alamat Penjemputan + Peta */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Lokasi Penjemputan</label>
              <button type="button" onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-lg transition-all ${showMap
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                <MapPin className="w-3.5 h-3.5" />
                {showMap ? 'Tutup Peta' : 'Tandai di Peta'}
              </button>
            </div>

            <textarea required placeholder="Alamat lengkap penjemputan..."
              value={formData.pickup_address}
              onChange={e => setFormData({ ...formData, pickup_address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 h-24 resize-none font-medium mb-3" />

            <AnimatePresence>
              {showMap && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <MapPicker onCoordinatePicked={handleCoordinatePicked}
                    initialLat={formData.lat || undefined} 
                    initialLng={formData.lng || undefined}
                    initialAddress={formData.pickup_address} />
                  {formData.lat && (
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">
                      Koordinat: {formData.lat.toFixed(6)}, {formData.lng?.toFixed(6)}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Batas Konsumsi + Deskripsi */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Batas Konsumsi</label>
            <input type="datetime-local" required value={formData.expired_date}
              onChange={e => setFormData({ ...formData, expired_date: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 font-bold" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deskripsi (opsional)</label>
            <textarea placeholder="Ceritakan kondisi makanan, cara penyimpanan, dll..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 h-24 resize-none font-medium" />
          </div>

          <button type="submit"
            className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all text-sm uppercase tracking-widest">
            Kirim Donasi
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default function DonorDashboard({ user, openAddFood, onCloseAddFood }: DonorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'impact'>('active');
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [editingFood, setEditingFood] = useState<any>(null);
  const [stats, setStats] = useState({ foodSaved: 0, peopleHelped: 0 });

  useEffect(() => {
    if (openAddFood) setIsAddingFood(true);
  }, [openAddFood]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/food');
      const myFood = res.data.filter((f: any) => f.donor_id === user.id);
      setFoods(myFood);
      const completed = myFood.filter((f: any) => f.status === 'completed');
      setStats({
        foodSaved: completed.reduce((acc: number, curr: any) => acc + (curr.weight_kg || 0), 0),
        peopleHelped: completed.reduce((acc: number, curr: any) => acc + (curr.portions || 0), 0),
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus donasi ini?')) return;
    try { await api.delete(`/food/${id}`); fetchData(); }
    catch (e) { console.error(e); }
  };

  const handleAddFood = async (formData: any, id?: number) => {
    try {
      if (id) {
        await api.put(`/food/${id}`, formData);
      } else {
        await api.post('/food', formData);
      }
      setIsAddingFood(false);
      setEditingFood(null);
      if (onCloseAddFood) onCloseAddFood();
      fetchData();
    } catch (e) { console.error(e); }
  };

  const activeItems = foods.filter(f => f.status !== 'completed');
  const historyItems = foods.filter(f => f.status === 'completed');

  const tabs = [
    { key: 'active', label: 'Donasi Aktif', icon: Heart },
    { key: 'history', label: 'Riwayat', icon: Clock },
    { key: 'impact', label: 'Dampak', icon: TrendingUp },
  ] as const;

  return (
    <div className="pt-28 pb-20 px-6 lg:px-12 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10">
        <div>
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">Dashboard Pendonor</p>
          <h1 className="text-3xl font-black text-slate-900">Halo, {user.name?.split(' ')[0]}! 👋</h1>
          <p className="text-slate-400 font-medium text-sm mt-1">Kelola semua donasi makananmu di sini.</p>
        </div>
        <button onClick={() => setIsAddingFood(true)}
          className="flex items-center gap-2 bg-emerald-500 text-white font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/25 hover:bg-emerald-600 transition-all text-sm uppercase tracking-widest">
          <PlusCircle className="w-5 h-5" /> Donasi Makanan
        </button>
      </div>

      {/* Tab nav */}
      <div className="flex w-full gap-2 mb-10 bg-white p-2 rounded-[1.25rem] border border-slate-100 shadow-sm">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${activeTab === t.key
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'active' && (
        <>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-3xl" />)}
            </div>
          ) : activeItems.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeItems.map(food => (
                <motion.div key={food.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group relative">
                  
                  {/* Image Header */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    {food.image ? (
                      <img src={food.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><Heart className="w-8 h-8"/></div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase shadow-sm ${food.status === 'claimed' ? 'bg-amber-400 text-amber-950' : 'bg-emerald-400 text-emerald-950'}`}>
                        {food.status === 'claimed' ? 'Menunggu Penjemputan' : 'Tersedia'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setEditingFood(food); }}
                        className="p-2.5 bg-white/80 backdrop-blur-sm text-slate-400 rounded-full hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(food.id); }}
                        className="p-2.5 bg-white/80 backdrop-blur-sm text-slate-400 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="pr-4">
                        <h4 className="text-xl font-black text-slate-900 leading-tight">{food.name}</h4>
                        <p className="text-xs text-slate-400 font-medium mt-1">{food.portions} Porsi • {food.weight_kg} kg</p>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2.5 py-1.5 rounded-lg shrink-0 border border-emerald-100">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 font-medium mb-5 line-clamp-2 leading-relaxed">
                      {food.pickup_address || 'Lokasi tidak tersedia'}
                    </p>

                    {/* Bottom Bar: Avatar & Time */}
                    <div className="mt-auto flex items-center gap-3 pt-5 border-t border-slate-50">
                      <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                         <img src={`https://ui-avatars.com/api/?name=${user.name}&background=10b981&color=fff`} className="w-full h-full object-cover"/>
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                         <p className="text-[10px] text-rose-500 font-bold mt-0.5">
                           Batas: {new Date(food.expired_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}
                         </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-32 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                <Heart className="w-10 h-10 text-emerald-400" />
              </div>
              <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Belum Ada Donasi Aktif</p>
              <p className="text-slate-400 font-medium text-sm mt-3 max-w-sm text-center leading-relaxed">Anda belum memiliki donasi makanan yang aktif. Ayo mulai berbagi makanan berlebihmu!</p>
              <button onClick={() => setIsAddingFood(true)}
                className="mt-8 bg-emerald-500 text-white font-black px-8 py-4 rounded-2xl text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/30 hover:-translate-y-0.5">
                Mulai Berbagi Sekarang
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <>
          {historyItems.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyItems.map(food => (
                <div key={food.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group relative opacity-80 hover:opacity-100 transition-opacity">
                  <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                    {food.image ? (
                      <img src={food.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><Heart className="w-8 h-8"/></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                      <div>
                        <h4 className="text-lg font-black leading-tight drop-shadow-md">{food.name}</h4>
                        <p className="text-[10px] font-bold opacity-80 mt-1">{food.portions} Porsi • {food.weight_kg} kg</p>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 drop-shadow-md" />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selesai Dibagikan</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">Sukses</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-32 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Belum Ada Riwayat Donasi</p>
              <p className="text-slate-400 font-medium text-sm mt-3 max-w-sm text-center leading-relaxed">Setiap makanan yang Anda bagikan akan tercatat di sini sebagai bukti kontribusi nyata.</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'impact' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 p-10 rounded-3xl shadow-sm">
            <div className="text-6xl font-black text-slate-900">{foods.length}</div>
            <div className="text-slate-400 font-black uppercase tracking-widest text-[10px] mt-3">Total Donasi</div>
          </div>
          <div className="bg-emerald-500 p-10 rounded-3xl text-white shadow-2xl shadow-emerald-500/20">
            <div className="text-6xl font-black">{stats.foodSaved}<span className="text-2xl ml-2 text-emerald-200">kg</span></div>
            <div className="text-emerald-100 font-black uppercase tracking-widest text-[10px] mt-3">Makanan Terselamatkan</div>
          </div>
          <div className="bg-slate-900 p-10 rounded-3xl text-white shadow-2xl">
            <div className="text-6xl font-black">{stats.peopleHelped}</div>
            <div className="text-slate-500 font-black uppercase tracking-widest text-[10px] mt-3">Penerima Manfaat</div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {(isAddingFood || editingFood) && (
          <AddFoodModal
            initialData={editingFood}
            onClose={() => { setIsAddingFood(false); setEditingFood(null); if (onCloseAddFood) onCloseAddFood(); }}
            onAdd={handleAddFood}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
