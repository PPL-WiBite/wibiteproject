import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, Clock, TrendingUp, PlusCircle, Trash2, CheckCircle2, X, MapPin, Edit2, LayoutDashboard, Users, Flame, Sparkles, AlertCircle, ArrowLeft, ArrowRight, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type User } from '@/lib/auth';
import api from '@/lib/api';
import MapPicker from './MapPicker';
import MapPreview from './MapPreview';
import DonationFinancial from './DonationFinancial';

interface DonorDashboardProps {
  user: User;
  openAddFood?: boolean;
  onCloseAddFood?: () => void;
  editFoodId?: number | null;
  onCloseEditFood?: () => void;
}

export default function DonorDashboard({ user, openAddFood, onCloseAddFood, editFoodId, onCloseEditFood }: DonorDashboardProps) {
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Detail Makanan, 2: Lokasi & Waktu, 3: Konfirmasi
  const [editingFoodId, setEditingFoodId] = useState<number | null>(null);
  const [mapSearchNode, setMapSearchNode] = useState<React.ReactNode>(null);
  const navigate = useNavigate();

  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ foodSaved: 0, peopleHelped: 0 });

  // Wizard Form State
  const [formData, setFormData] = useState({
    name: '',
    portions: 1,
    weight_kg: 0.5,
    pickup_address: '',
    lat: null as number | null,
    lng: null as number | null,
    expired_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // YYYY-MM-DD
    pickup_time: '12:00', // HH:MM
    description: '',
    category: 'Makanan Matang',
    image: '',
  });

  const categories = ['Makanan Matang', 'Bahan Baku', 'Roti & Kue', 'Buah & Sayur', 'Lainnya'];

  useEffect(() => {
    if (openAddFood) {
      setIsAddingFood(true);
      setCurrentStep(1);
      resetForm();
    }
  }, [openAddFood]);

  useEffect(() => {
    if (editFoodId && foods.length > 0) {
      const foodToEdit = foods.find(f => f.id === editFoodId);
      if (foodToEdit) {
        handleEditClick(foodToEdit);
      }
    }
  }, [editFoodId, foods]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resFood, resClaims] = await Promise.all([
        api.get('/food'),
        api.get('/donor/claims')
      ]);
      const myFood = resFood.data.filter((f: any) => Number(f.donor_id) === Number(user.id));
      setFoods(myFood);
      
      const completedClaims = resClaims.data.filter((c: any) => c.status === 'completed');
      const totalFoodSaved = completedClaims.reduce((acc: number, c: any) => {
        const foodPortions = c.food?.portions || 1;
        const foodWeight = parseFloat(c.food?.weight_kg || '0');
        const claimWeight = (c.portions / foodPortions) * foodWeight;
        return acc + claimWeight;
      }, 0);
      const totalPeopleHelped = completedClaims.reduce((acc: number, c: any) => acc + (c.portions || 0), 0);

      setStats({
        foodSaved: parseFloat(totalFoodSaved.toFixed(1)),
        peopleHelped: totalPeopleHelped,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const resetForm = () => {
    setFormData({
      name: '',
      portions: 1,
      weight_kg: 0.5,
      pickup_address: '',
      lat: null,
      lng: null,
      expired_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      pickup_time: '12:00',
      description: '',
      category: 'Makanan Matang',
      image: '',
    });
    setEditingFoodId(null);
    setCurrentStep(1);
  };

  const handleEditClick = (food: any) => {
    let expDate = new Date(food.expired_date);
    // fallback if invalid date
    if (isNaN(expDate.getTime())) expDate = new Date(Date.now() + 86400000);
    
    setFormData({
      name: food.name || '',
      portions: food.portions || 1,
      weight_kg: food.weight_kg || 0.5,
      pickup_address: food.pickup_address || '',
      lat: food.lat ? parseFloat(food.lat) : null,
      lng: food.lng ? parseFloat(food.lng) : null,
      expired_date: expDate.toISOString().slice(0, 10),
      pickup_time: expDate.toTimeString().slice(0, 5),
      description: food.description || '',
      category: food.category || 'Makanan Matang',
      image: food.image || '',
    });
    setEditingFoodId(food.id);
    setIsAddingFood(true);
    setCurrentStep(1);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus donasi ini?')) return;
    try {
      await api.delete(`/food/${id}`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoordinatePicked = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({ ...prev, lat, lng, pickup_address: address }));
  };

  const handleFormSubmit = async () => {
    try {
      const compiledDateTime = `${formData.expired_date}T${formData.pickup_time}:00`;
      const payload = {
        name: formData.name,
        portions: formData.portions,
        weight_kg: formData.weight_kg,
        pickup_address: formData.pickup_address,
        lat: formData.lat,
        lng: formData.lng,
        expired_date: compiledDateTime,
        description: formData.description,
        category: formData.category,
        image: formData.image || undefined,
      };

      if (editingFoodId) {
        await api.put(`/food/${editingFoodId}`, payload);
      } else {
        await api.post('/food', payload);
      }

      setIsAddingFood(false);
      resetForm();
      if (onCloseAddFood) onCloseAddFood();
      if (onCloseEditFood) onCloseEditFood();
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Gagal mengirim donasi. Coba periksa kembali data Anda.');
    }
  };

  const activeItems = foods.filter(f => f.status !== 'completed');

  // Chart data
  const chartData = [
    { month: 'Jan', value: 35 },
    { month: 'Feb', value: 48 },
    { month: 'Mar', value: 65 },
    { month: 'Apr', value: 95 },
    { month: 'Mei', value: 110 },
    { month: 'Jun', value: stats.peopleHelped > 0 ? Math.min(stats.peopleHelped, 150) : 135 },
  ];

  // Dynamic Recent Activities based on actual data
  const getRecentActivities = () => {
    if (foods.length === 0) return [];
    return foods.slice(0, 4).map(food => {
      let text = '';
      let relativeTime = 'Baru saja';
      if (food.status === 'completed') {
        text = `Klaim Donasi Berhasil - ${food.name}`;
        relativeTime = 'Selesai dijemput';
      } else if (food.status === 'claimed') {
        text = `Makanan "${food.name}" telah diklaim`;
        relativeTime = 'Menunggu kurir';
      } else {
        text = `Donasi Baru Ditambahkan - ${food.name}`;
        relativeTime = 'Menunggu klaim';
      }

      return {
        id: food.id,
        text,
        time: relativeTime,
        status: food.status,
      };
    });
  };

  const recentActivities = getRecentActivities();

  const renderProgressSteps = (step: number) => {
    return (
      <div className="max-w-2xl mx-auto mb-12 mt-6">
        <div className="flex items-center justify-between relative px-8">
          {/* Connecting line */}
          <div className="absolute left-10 right-10 top-4 h-0.5 bg-slate-200 z-0" />
          <div
            className="absolute left-10 top-4 h-0.5 bg-emerald-600 z-0 transition-all duration-500"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-2 cursor-pointer relative z-10 bg-slate-50 px-2" onClick={() => step > 1 && setCurrentStep(1)}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
              step >= 1 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-400'
            }`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Informasi Makanan</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-2 cursor-pointer relative z-10 bg-slate-50 px-2" onClick={() => step > 2 && setCurrentStep(2)}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
              step >= 2 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-blue-100 text-blue-600'
            }`}>
              {step > 2 ? '✓' : '2'}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lokasi & Waktu</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-2 relative z-10 bg-slate-50 px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
              step === 3 ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-blue-100 text-blue-600'
            }`}>
              3
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Konfirmasi</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
      {/* View 1: 3-Step Donation Form */}
      {isAddingFood ? (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
          {/* Header Wizard */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-wide">Donasi Makanan</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Bagikan makanan berlebih Anda untuk mengurangi limbah dan membantu sesama.</p>
          </div>

          {/* Steps Indicator */}
          {renderProgressSteps(currentStep)}

          {/* Step 1: Informasi Makanan */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6 max-w-2xl mx-auto">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Makanan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 5 Box Nasi Ayam Bakar"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 font-bold text-slate-800 placeholder:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jumlah Porsi</label>
                  <input
                    type="number"
                    required
                    placeholder='0'
                    min="1"
                    value={formData.portions}
                    onChange={e => setFormData({ ...formData, portions: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Berat (KG)</label>
                  <input
                    type="number"
                    placeholder='0,0'
                    step="0.1"
                    min="0.1"
                    value={formData.weight_kg}
                    onChange={e => setFormData({ ...formData, weight_kg: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: c })}
                      className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${formData.category === c
                        ? 'bg-emerald-700 border-emerald-700 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-600'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Foto Makanan */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Foto Makanan (Opsional)</label>
                <label className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 relative">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  {formData.image ? (
                    <div className="w-full h-36 relative rounded-xl overflow-hidden">
                      <img src={formData.image} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, image: '' })); }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-700">Klik untuk Unggah Foto</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1">Format JPG, PNG (Maks. 5MB)</p>
                      </div>
                    </>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Batas Konsumsi / Kadaluarsa</label>
                  <input
                    type="date"
                    required
                    value={formData.expired_date}
                    onChange={e => setFormData({ ...formData, expired_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Waktu Spesifik</label>
                  <input
                    type="time"
                    required
                    value={formData.pickup_time}
                    onChange={e => setFormData({ ...formData, pickup_time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deskripsi (Opsional)</label>
                <textarea
                  placeholder="Ceritakan kondisi makanan, cara penyimpanan, dll..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 h-24 resize-none font-semibold text-slate-850"
                />
              </div>

              {/* Step 1 Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingFood(false);
                    resetForm();
                    if (onCloseAddFood) onCloseAddFood();
                    if (onCloseEditFood) onCloseEditFood();
                  }}
                  className="flex-1 py-3 px-6 border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-colors text-center"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.name) {
                      alert('Mohon isi nama makanan.');
                      return;
                    }
                    if (!formData.portions) {
                      alert('Jumlah porsi minimal 1.');
                      return;
                    }
                    if (!formData.expired_date) {
                      alert('Mohon isi tanggal kadaluarsa.');
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="flex-1 py-3 px-6 bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20"
                >
                  Lanjut <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Lokasi & Waktu */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl max-w-4xl mx-auto space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Kiri */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alamat Penjemputan</label>
                    <textarea
                      required
                      placeholder="Alamat lengkap penjemputan..."
                      value={formData.pickup_address}
                      onChange={e => setFormData({ ...formData, pickup_address: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-5 h-24 resize-none font-medium text-slate-800 mb-3"
                    />
                  </div>

                  {/* Geolocation Info Box */}
                  <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-5">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Waktu Penjemputan</h5>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                        Saran: Lakukan penjemputan mandiri antara pukul 10:00 - 17:00 agar proses serah terima makanan berjalan lancar.
                      </p>
                    </div>
                  </div>

                  {/* Cari Lokasi Search bar (passed from MapPicker) */}
                  {mapSearchNode && (
                    <div className="space-y-2 mt-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Cari Lokasi</label>
                      {mapSearchNode}
                    </div>
                  )}
                </div>

                {/* Kanan: Map Picker */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tandai Lokasi di Peta</label>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
                    <MapPicker
                      onCoordinatePicked={handleCoordinatePicked}
                      initialLat={formData.lat || undefined}
                      initialLng={formData.lng || undefined}
                      initialAddress={formData.pickup_address}
                      renderSearch={(el) => { setMapSearchNode(el); return el; }}
                    />
                  </div>
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="flex gap-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-3 px-6 border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-colors text-center"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => formData.pickup_address ? setCurrentStep(3) : alert('Mohon tentukan alamat penjemputan.')}
                  className="flex-1 py-3 px-6 bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20"
                >
                  Lanjut ke Konfirmasi <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Konfirmasi */}
          {currentStep === 3 && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Tinjau Donasi Anda</h3>
                <p className="text-slate-400 font-medium text-xs mb-8">Pastikan semua informasi sudah benar sebelum mempublikasikan donasi.</p>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* Left Column (Detail Summary Cards) */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Detail Makanan Card */}
                    <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-emerald-600" /> Detail Makanan
                        </h4>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {formData.image ? (
                            <img src={formData.image} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-350"><Heart className="w-6 h-6"/></div>
                          )}
                        </div>
                        <div>
                          <h5 className="text-base font-extrabold text-slate-800 leading-tight">{formData.name}</h5>
                          <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded-full uppercase tracking-wider">
                            {formData.category}
                          </span>
                          <p className="text-xs font-bold text-slate-400 mt-2">~{formData.weight_kg} kg ({formData.portions} Porsi)</p>
                        </div>
                      </div>
                    </div>

                    {/* Lokasi & Waktu Card */}
                    <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" /> Lokasi & Waktu
                        </h4>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-2 text-slate-700 text-xs font-semibold leading-relaxed">
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{formData.pickup_address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                          <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Ambil s.d {new Date(formData.expired_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })} jam {formData.pickup_time} WIB</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Impact Summary Card & Actions) */}
                  <div className="space-y-6">
                    {/* Ringkasan Dampak Card */}
                    <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800/40 blur-2xl rounded-full translate-x-1/3 -translate-y-1/3"></div>
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                          <div className="w-9 h-9 bg-emerald-800 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Ringkasan Dampak</span>
                          <p className="text-xs text-emerald-100 font-medium leading-relaxed mt-2">
                            Donasi ini berpotensi menyelamatkan
                          </p>
                          <p className="text-3xl font-black text-white mt-1">~{(formData.weight_kg * 2.5).toFixed(1)}kg</p>
                          <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">emisi CO2</p>
                        </div>
                        
                        {/* Progress Bar Graphic */}
                        <div className="w-full bg-emerald-800/80 rounded-full h-1.5 mt-5 overflow-hidden">
                          <div className="bg-white h-1.5 rounded-full w-4/5"></div>
                        </div>

                        <p className="text-[9px] text-emerald-200/80 leading-relaxed font-semibold mt-4">
                          Terima kasih telah berkontribusi dalam mendukung SDG 12: Konsumsi dan Produksi yang Bertanggung Jawab.
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={handleFormSubmit}
                        className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-700/20 flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" /> Konfirmasi & Kirim
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="w-full py-3.5 border border-slate-200 text-slate-500 hover:bg-slate-50 font-black text-xs uppercase tracking-widest rounded-2xl transition-all text-center bg-white"
                      >
                        ← Kembali
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100/40 rounded-2xl p-5 text-blue-900">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">
                  Setelah dikirim, donasi akan muncul di peta "Cari Makanan" dan dapat segera diambil oleh penerima manfaat.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* View 2: Dashboard Summary */
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Welcome Banner */}
          <div className="bg-emerald-600 text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3"></div>
            <div className="relative z-10 max-w-xl">
              <h2 className="text-3xl font-black mb-3">Selamat Datang Kembali, {user?.name || 'Donatur'}!</h2>
              <p className="text-emerald-100 font-medium text-sm leading-relaxed mb-6">
                Terima kasih telah berkontribusi dalam gerakan mengurangi sisa makanan. Setiap porsi yang Anda bagikan berarti bagi bumi kita.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => { setIsAddingFood(true); resetForm(); }}
                  className="px-6 py-3.5 bg-white text-emerald-700 hover:bg-emerald-50 font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <PlusCircle className="w-5 h-5" /> Donasi Sekarang
                </button>
                <button
                  onClick={() => navigate('/history')}
                  className="px-6 py-3.5 bg-transparent border-2 border-white hover:bg-white/10 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <Clock className="w-5 h-5" /> Lihat Riwayat Donasi
                </button>
              </div>
            </div>
            <div className="w-44 h-44 shrink-0 rounded-2xl flex items-center justify-center relative overflow-hidden border border-slate-100/10">
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300" alt="Fresh organic vegetables" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/30 to-transparent"></div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between relative">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Makanan Terselamatkan</span>
                <p className="text-3xl font-black text-emerald-600 mt-2">{stats.foodSaved} Kg</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Flame className="w-6 h-6" />
              </div>
              <span className="absolute top-4 right-4 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                ↗ 12%
              </span>
            </div>
            {/* Stat 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Emisi Karbon Dikurangi</span>
                <p className="text-3xl font-black text-emerald-600 mt-2">{(stats.foodSaved * 2.5).toFixed(1)} Kg CO2e</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Heart className="w-6 h-6" />
              </div>
            </div>
            {/* Stat 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Masyarakat Terbantu</span>
                <p className="text-3xl font-black text-emerald-600 mt-2">{stats.peopleHelped} Orang</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Two-Column Section (Analytics & Activities) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Bar Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-black text-slate-900">Kontribusi Distribusi Makanan Anda (Bulanan)</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Donasi Aktif</span>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-emerald-50/40 rounded-2xl p-6 flex items-end justify-between gap-2 h-44 mb-6">
                {chartData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <div className="w-full bg-emerald-500/10 rounded-t-lg h-28 flex items-end justify-center relative group">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.value / 150) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="w-full bg-emerald-500 rounded-t-lg transition-colors group-hover:bg-emerald-600 cursor-pointer"
                      />
                      <div className="absolute -top-7 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.value} Porsi
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 mt-2">{d.month}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-50 text-xs">
                <span className="text-slate-500 font-bold">Total Terdistribusi: <strong className="text-slate-900 font-black">{stats.peopleHelped} Porsi</strong></span>
                <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md font-black text-[9px] uppercase tracking-wider">
                  Skor Keberlanjutan: A+
                </span>
              </div>
            </div>

            {/* Right Column: Activities & Mission */}
            <div className="space-y-6">
              {/* Recent Activities */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-base font-black text-slate-900 mb-5">Aktivitas Terbaru</h3>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((act) => (
                      <div key={act.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-none last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            act.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : act.status === 'claimed' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                          }`}>
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{act.text}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{act.time}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-black uppercase text-emerald-600 tracking-wider">Detil</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs font-medium py-4 text-center">Belum ada aktivitas terbaru.</p>
                  )}
                </div>
              </div>

              {/* Misi Kami */}
              <div className="bg-emerald-950 text-white p-6 rounded-3xl relative overflow-hidden flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400">Misi Kami</h4>
                  <p className="text-xs text-emerald-100/90 leading-relaxed font-medium mt-1">
                    Mendukung SDG 12 melalui konsumsi yang bertanggung jawab dengan menjembatani makanan berlebih kepada mereka yang membutuhkan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
