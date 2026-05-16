import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, TrendingUp, CheckCircle2, X } from 'lucide-react';
import { type User } from '@/lib/auth';
import api from '@/lib/api';
import MapPreview from './MapPreview';

interface ReceiverDashboardProps {
  user: User;
}

export default function ReceiverDashboard({ user }: ReceiverDashboardProps) {
  const [activeTab, setActiveTab] = useState<'claims' | 'history'>('claims');
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [stats, setStats] = useState({ foodSaved: 0, peopleHelped: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/food');
      const myClaims = res.data.filter((f: any) => f.claimed_by === user.id);
      setClaims(myClaims);
      const completed = myClaims.filter((f: any) => f.status === 'completed');
      setStats({
        foodSaved: completed.reduce((acc: number, curr: any) => acc + (curr.weight_kg || 0), 0),
        peopleHelped: completed.reduce((acc: number, curr: any) => acc + (curr.portions || 0), 0),
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleConfirmPickup = async (foodId: number) => {
    if (!confirm('Konfirmasi bahwa makanan telah dijemput?')) return;
    try {
      await api.post('/claims/complete', { food_id: foodId });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const activeItems = claims.filter(c => c.status !== 'completed');
  const historyItems = claims.filter(c => c.status === 'completed');

  const tabs = [
    { key: 'claims', label: 'Klaim Aktif', icon: MapPin },
    { key: 'history', label: 'Riwayat', icon: Clock },
    { key: 'impact', label: 'Dampak', icon: TrendingUp },
  ] as const;

  return (
    <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1">Dashboard Penerima</p>
        <h1 className="text-3xl font-black text-slate-900">Halo, {user.name?.split(' ')[0]}! 👋</h1>
        <p className="text-slate-400 font-medium text-sm mt-1">Pantau klaim dan riwayat penerimaanmu.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Klaim', value: claims.length, color: 'bg-slate-900 text-white' },
          { label: 'Klaim Aktif', value: activeItems.length, color: 'bg-amber-500 text-white' },
          { label: 'Makanan Diterima', value: `${stats.foodSaved} kg`, color: 'bg-white text-slate-900 border border-slate-100' },
        ].map((s, i) => (
          <div key={i} className={`p-5 rounded-2xl shadow-sm ${s.color}`}>
            <p className="text-3xl font-black leading-none">{s.value}</p>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${s.color.includes('bg-white') ? 'text-slate-400' : 'opacity-70'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-7 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === t.key
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-700'}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {activeTab === 'claims' && (
        <div className="space-y-4">
          {loading ? (
            [1, 2].map(i => <div key={i} className="h-28 bg-slate-100 animate-pulse rounded-2xl" />)
          ) : activeItems.length > 0 ? activeItems.map(food => (
            <motion.div key={food.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  {food.image && <img src={food.image} className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${food.status === 'claimed' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {food.status === 'claimed' ? 'Menunggu Jemput' : 'Tersedia'}
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-1.5 truncate">{food.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{food.pickup_address}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {(food.lat && food.lng) && (
                  <button onClick={() => setSelectedItem(food)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 text-blue-600 font-black text-xs rounded-xl hover:bg-blue-100 transition-all">
                    <MapPin className="w-4 h-4" /> Lihat Peta
                  </button>
                )}
                {food.status === 'claimed' && (
                  <button onClick={() => handleConfirmPickup(food.id)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white font-black text-xs rounded-xl hover:bg-emerald-600 transition-all">
                    <CheckCircle2 className="w-4 h-4" /> Sudah Dijemput
                  </button>
                )}
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold">Belum ada klaim aktif.</p>
              <p className="text-slate-300 text-sm mt-1">Kunjungi halaman <span className="font-bold">Cari Makanan</span> untuk mulai klaim.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {historyItems.length > 0 ? historyItems.map(food => (
            <div key={food.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-black text-slate-900">{food.name}</p>
                  <p className="text-xs text-slate-400">{food.portions} Porsi · Donatur: {food.donor_name}</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">Selesai</span>
            </div>
          )) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">Belum ada riwayat.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'impact' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-amber-500 p-10 rounded-3xl text-white shadow-2xl shadow-amber-500/20">
            <div className="text-6xl font-black">{stats.foodSaved}<span className="text-2xl ml-2 text-amber-200">kg</span></div>
            <div className="text-amber-100 font-black uppercase tracking-widest text-[10px] mt-3">Makanan Diterima</div>
          </div>
          <div className="bg-slate-900 p-10 rounded-3xl text-white shadow-2xl">
            <div className="text-6xl font-black">{claims.length}</div>
            <div className="text-slate-500 font-black uppercase tracking-widest text-[10px] mt-3">Total Klaim</div>
          </div>
        </div>
      )}

      {/* Map Preview Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative z-10">
              <div className="p-6 flex items-center justify-between border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedItem.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Lokasi Penjemputan</p>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <MapPreview lat={selectedItem.lat} lng={selectedItem.lng} label={selectedItem.name} />
                <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-4">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{selectedItem.pickup_address}</p>
                </div>
                <a href={`https://www.google.com/maps?q=${selectedItem.lat},${selectedItem.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition-all text-sm">
                  Buka di Google Maps
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
