import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Clock, Search, X, Heart, MessageSquare, Eye, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type User } from '@/lib/auth';
import api from '@/lib/api';
import MapPreview from './MapPreview';

interface ReceiverDashboardProps {
  user: User;
}

export default function ReceiverDashboard({ user }: ReceiverDashboardProps) {
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [pickupTime, setPickupTime] = useState<string>('');

  useEffect(() => {
    if (selectedFood) {
      setPickupTime('');
    }
  }, [selectedFood]);
  const [visibleCount, setVisibleCount] = useState(6);
  const cities = ['Semua Kota', 'Jakarta', 'Denpasar', 'Surabaya', 'Bandung', 'Yogyakarta', 'Medan', 'Makassar'];
  const navigate = useNavigate();

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/food');
      setFoods(res.data.filter((f: any) => f.status === 'available'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleClaim = async (foodId: number, pickupTime: string) => {
    if (!pickupTime) return alert('Silakan pilih waktu penjemputan terlebih dahulu.');
    try {
      await api.post('/claim', { food_id: foodId, pickup_time: pickupTime });
      alert('Klaim berhasil! Koordinasikan penjemputan di Dashboard.');
      setSelectedFood(null);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Gagal mengklaim makanan.');
    }
  };

  const handleChatDonor = (food: any) => {
    const savedConvs = localStorage.getItem('wibite_conversations');
    const convs = savedConvs ? JSON.parse(savedConvs) : [];
    const donorId = food.donor_id || 1;
    const existingIndex = convs.findIndex((c: any) => c.donor_id === donorId);

    let convId;
    if (existingIndex > -1) {
      convId = convs[existingIndex].id;
    } else {
      convId = Date.now();
      const newConv = {
        id: convId,
        donor_id: donorId,
        name: food.donor_name || 'Donatur',
        role: 'Pendonor',
        time: 'Baru',
        lastMsg: `Tanya tentang donasi "${food.name}"`,
        unread: 0,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(food.donor_name || 'Donatur')}&background=10b981&color=fff`,
        foodName: food.name
      };
      convs.unshift(newConv);
      localStorage.setItem('wibite_conversations', JSON.stringify(convs));

      const savedMsgs = localStorage.getItem(`wibite_msgs_${convId}`);
      if (!savedMsgs) {
        const welcomeMsgs = [
          { id: 1, senderId: donorId, text: `Halo! Terima kasih tertarik dengan donasi "${food.name}". Ada yang bisa saya bantu?`, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), isMe: false }
        ];
        localStorage.setItem(`wibite_msgs_${convId}`, JSON.stringify(welcomeMsgs));
      }
    }
    navigate(`/chat?id=${convId}`);
  };

  const getBadge = (food: any) => {
    const now = new Date();
    const exp = food.expired_date ? new Date(food.expired_date) : null;
    const isNearExpired = exp ? (exp.getTime() - now.getTime()) < 6 * 60 * 60 * 1000 : false;

    if (isNearExpired) return { text: 'DEKAT EXPIRED', class: 'bg-amber-500 text-white' };
    if (food.category === 'Roti & Kue') return { text: 'KATERING', class: 'bg-emerald-600 text-white' };
    if (food.category === 'Makanan Matang' || !food.category) return { text: 'SISA EVENT', class: 'bg-emerald-600 text-white' };
    return { text: (food.category || 'LAINNYA').toUpperCase(), class: 'bg-emerald-600 text-white' };
  };

  const filteredFoods = foods.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.pickup_address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !selectedCity || selectedCity === 'Semua Kota' ||
      f.pickup_address?.toLowerCase().includes(selectedCity.toLowerCase());
    return matchesSearch && matchesCity;
  });

  const processedFoods = filteredFoods.map(f => {
    const lat = f.lat ? parseFloat(f.lat) : null;
    const lng = f.lng ? parseFloat(f.lng) : null;
    const distance = (lat !== null && lng !== null) ? getDistance(-8.6704, 115.2126, lat, lng) : null;
    return { ...f, distance };
  });

  const displayFoods = processedFoods.slice(0, visibleCount);

  return (
    <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
          Temukan Makanan<br />di Sekitarmu
        </h1>
        <p className="text-slate-500 font-medium text-sm max-w-md leading-relaxed">
          Cari, temukan, dan klaim makanan yang tersedia untuk mengurangi sisa makanan (food waste). Bergabunglah dalam gerakan konsumsi bertanggung jawab.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-2 mb-10 relative z-20">
        <div className="relative flex-1 w-full flex items-center pl-4 py-2">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Cari nama makanan, lokasi, atau donatur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent focus:outline-none font-medium text-slate-800 placeholder:text-slate-400 border-none p-0 text-sm"
          />
        </div>

        <div className="hidden md:block w-px h-8 bg-slate-100 shrink-0" />

        {/* Filter Kota */}
        <div className="relative shrink-0 w-full md:w-auto px-2">
          <button
            type="button"
            onClick={() => setShowCityDropdown(!showCityDropdown)}
            className="w-full md:w-auto px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-sm rounded-xl transition-all flex items-center justify-between md:justify-start gap-2 border border-slate-100"
          >
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{selectedCity || 'Filter Kota'}</span>
            <span className="text-[10px]">▼</span>
          </button>

          {showCityDropdown && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl w-48 py-2 z-50">
              {cities.map(city => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setSelectedCity(city === 'Semua Kota' ? '' : city);
                    setShowCityDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all ${
                    (city === 'Semua Kota' && !selectedCity) || selectedCity === city
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-all shrink-0">
          Cari
        </button>
      </div>

      {/* Section Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pilihan Hari Ini</h2>
          <p className="text-slate-400 text-sm font-medium mt-0.5">
            Tersedia {processedFoods.length} pilihan makanan yang bisa kamu klaim sekarang.
          </p>
        </div>
        <a href="#" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors whitespace-nowrap">
          Lihat Semua →
        </a>
      </div>

      {/* Food Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : displayFoods.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {displayFoods.map(food => {
              const badge = getBadge(food);
              const distStr = food.distance !== null ? `${food.distance.toFixed(1)} km dari lokasimu` : '1.2 km dari lokasimu';

              return (
                <div key={food.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
                  {/* Image */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden shrink-0">
                    {food.image ? (
                      <img src={food.image} className="w-full h-full object-cover" alt={food.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                        <Heart className="w-8 h-8" />
                      </div>
                    )}
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${badge.class}`}>
                        {badge.text}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h4 className="text-base font-bold text-slate-900 leading-tight mb-1">{food.name}</h4>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
                      <MapPin className="w-3 h-3" />
                      <span>{distStr}</span>
                    </div>

                    {/* Donor + Actions */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-emerald-50">
                          <img src={`https://ui-avatars.com/api/?name=${food.donor_name || 'D'}&background=EBF7F4&color=066F4E&size=28`} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{food.donor_name || 'Donatur'}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {food.expired_date
                              ? `Ambil s.d ${new Date(food.expired_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                              : 'Tersedia'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleChatDonor(food)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" /> Chat
                        </button>
                        <button
                          onClick={() => setSelectedFood(food)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Eye className="w-3 h-3" /> Lihat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {visibleCount < processedFoods.length && (
            <div className="text-center">
              <button
                onClick={() => setVisibleCount(v => v + 6)}
                className="inline-flex items-center gap-2 px-8 py-3 border border-slate-200 text-slate-600 font-semibold text-sm rounded-full hover:bg-slate-50 transition-colors"
              >
                Muat Lebih Banyak <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-bold">Tidak ada makanan yang cocok.</p>
          <p className="text-slate-300 text-sm mt-1">Coba kata kunci atau filter yang berbeda.</p>
        </div>
      )}

      {/* Community Stats Section */}
      <div className="mt-16 bg-emerald-900 text-white rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold mb-1">Kontribusi Komunitas</h3>
          <p className="text-emerald-200 text-sm font-medium">
            Bersama kita telah menyelamatkan ribuan porsi makanan.
          </p>
        </div>
        <div className="flex gap-10 shrink-0">
          <div className="text-center">
            <p className="text-3xl font-black">1,240</p>
            <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mt-1">Meals Saved</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black">850kg</p>
            <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mt-1">CO2 Reduced</p>
          </div>
        </div>
      </div>

      {/* Food Detail Modal */}
      <AnimatePresence>
        {selectedFood && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedFood(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto flex flex-col">
              <button onClick={() => setSelectedFood(null)} className="absolute top-4 right-4 p-2 bg-white/85 backdrop-blur-md rounded-full text-slate-900 z-20 hover:bg-slate-100 transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>

              {/* Image */}
              <div className="h-56 relative bg-slate-100 shrink-0">
                {selectedFood.image ? (
                  <img src={selectedFood.image} alt={selectedFood.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><Heart className="w-8 h-8" /></div>
                )}
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <span className="text-emerald-600 font-semibold text-sm mb-1">{selectedFood.category || 'Makanan Matang'}</span>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedFood.name}</h2>
                <p className="text-sm text-slate-500 mb-6">{selectedFood.description || 'Makanan layak konsumsi siap dijemput.'}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-400 font-semibold block mb-1">Jumlah Porsi</span>
                    <span className="text-sm font-bold text-slate-800">{selectedFood.portions - selectedFood.claimed_portions} Porsi</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-400 font-semibold block mb-1">Berat</span>
                    <span className="text-sm font-bold text-slate-800">{selectedFood.weight_kg} kg</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">{selectedFood.pickup_address || 'Lokasi belum tersedia'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                    <p className="text-sm text-slate-600">
                      Ambil sebelum: {new Date(selectedFood.expired_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>

                {/* Request Pick-up Time Section */}
                <div className="mb-6 bg-blue-50/40 border border-blue-100/50 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      Request Pick-up
                    </span>
                    <Clock className="w-4 h-4 text-emerald-600" />
                  </div>
                  
                  <label className="block text-xs font-black text-slate-700 mb-2">
                    Pilih Waktu Penjemputan
                  </label>
                  
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={pickupTime}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          const selectedTime = new Date(val);
                          const limitTime = new Date(selectedFood.expired_date);
                          if (selectedTime > limitTime) {
                            alert("Waktu penjemputan tidak boleh melebihi batas waktu pengambilan!");
                            setPickupTime('');
                          } else if (selectedTime < new Date()) {
                            alert("Waktu penjemputan tidak boleh di masa lampau!");
                            setPickupTime('');
                          } else {
                            setPickupTime(val);
                          }
                        } else {
                          setPickupTime('');
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                  
                  <span className="block text-[10px] font-medium text-slate-400 mt-2 italic">
                    Silakan pilih waktu sebelum batas waktu pengambilan.
                  </span>
                </div>

                {selectedFood.lat && selectedFood.lng && (
                  <div className="rounded-xl overflow-hidden border border-slate-100 h-32 relative mb-6">
                    <MapPreview lat={parseFloat(selectedFood.lat)} lng={parseFloat(selectedFood.lng)} label={selectedFood.name} />
                  </div>
                )}

                {/* Donor Info */}
                <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-emerald-50">
                    <img src={`https://ui-avatars.com/api/?name=${selectedFood.donor_name || 'D'}&background=10b981&color=fff`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{selectedFood.donor_name || 'Donatur'}</p>
                    <p className="text-xs text-slate-400">Pendonor</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={() => {
                      if (!pickupTime) {
                        alert("Silakan pilih waktu penjemputan terlebih dahulu.");
                        return;
                      }
                      handleClaim(selectedFood.id, pickupTime);
                    }}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors text-center"
                  >
                    Klaim Makanan
                  </button>
                  <button
                    onClick={() => handleChatDonor(selectedFood)}
                    className="flex-1 py-3.5 border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Chat Donatur
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
