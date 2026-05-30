import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, Search, LayoutDashboard, LogOut, MapPin, ChevronRight, TrendingUp,
  Globe, Leaf, Clock, X, CheckCircle2, Lock, Mail, MessageSquare,
  User as UserIcon, LogIn, Trash2, PlusCircle,
  HandHeart, Utensils, Instagram, Twitter, Facebook, Mail as MailIcon, HelpCircle, Camera, Save
} from 'lucide-react';
import { authService, type User } from '@/lib/auth';
import api from '@/lib/api';
import { createConversationFromFood } from '@/lib/chat';
import ForumPage from '@/components/Forum';
import DonorDashboard from '@/components/DonorDashboard';
import ReceiverDashboard from '@/components/ReceiverDashboard';
import MapPreview from '@/components/MapPreview';
import Chat from '@/components/Chat';
import ExploreMap from '@/components/ExploreMap';
import DonationHistory from '@/components/DonationHistory';
import ClaimsPage from '@/components/Claims';
import HelpInfo from '@/components/HelpInfo';
import MapPicker from '@/components/MapPicker';
import RatebackPage from '@/components/Rateback';
import DonationFinancial from '@/components/DonationFinancial';

// --- Navbar ---
const Navbar = ({ user, onLogout, onUserUpdate }: { user: User | null; onLogout: () => void; onUserUpdate?: (user: User) => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkClass = (path: string) =>
    `px-4 py-2.5 text-sm font-black transition-all relative uppercase tracking-widest ${location.pathname === path
      ? 'text-emerald-600'
      : 'text-slate-500 hover:text-emerald-600'
    }`;

  const handleRoleToggle = async (newRole: 'donor' | 'receiver') => {
    if (!user || user.role === newRole || roleLoading) return;
    setRoleLoading(true);
    try {
      const updated = await authService.updateRole(newRole);
      if (onUserUpdate) onUserUpdate(updated);
      if (newRole === 'donor') {
        navigate('/dashboard');
      } else {
        navigate('/explore');
      }
    } catch (e) {
      console.error(e);
      alert('Gagal mengganti peran.');
    } finally {
      setRoleLoading(false);
    }
  };

  if (location.pathname === '/chat') return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        }`}
    >
      <div className="w-full px-6 lg:px-10 relative flex items-center justify-between">
        {/* KIRI: Logo */}
        <Link to="/" className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-2xl font-black tracking-tight text-emerald-600">
            Wi<span className="text-emerald-700 font-extrabold">Bite</span>
          </span>
        </Link>

        {/* TENGAH: Nav menu (absolute, benar-benar rata tengah) */}
        {user && (
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-4">
            {user.role === 'donor' ? (
              <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                Donasi Makanan
                {location.pathname === '/dashboard' && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </Link>
            ) : (
              <>
                <Link to="/explore" className={navLinkClass('/explore')}>
                  Cari Makanan
                  {location.pathname === '/explore' && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </Link>
                <Link to="/klaim" className={navLinkClass('/klaim')}>
                  Klaim Saya
                  {location.pathname === '/klaim' && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </Link>
              </>
            )}
            <Link to="/forum" className={navLinkClass('/forum')}>
              Forum
              {location.pathname === '/forum' && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </Link>
          </div>
        )}

        {/* KANAN: Auth / User menu */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              {/* Role Switcher Pill */}
              {(user.role === 'donor' || user.role === 'receiver') && (
                <div className="flex bg-slate-100 rounded-full p-0.5 border border-slate-200 shrink-0">
                  <button
                    onClick={() => handleRoleToggle('receiver')}
                    disabled={roleLoading}
                    className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                      user.role === 'receiver'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Penerima
                  </button>
                  <button
                    onClick={() => handleRoleToggle('donor')}
                    disabled={roleLoading}
                    className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                      user.role === 'donor'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Donatur
                  </button>
                </div>
              )}

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-100"
                title="Profil"
              >
                <UserIcon className="w-4.5 h-4.5" />
              </Link>
              <Link
                to="/chat"
                className="relative p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-100"
                title="Chat"
              >
                <MessageSquare className="w-4.5 h-4.5" />
              </Link>
              <Link
                to="/info"
                className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-100"
                title="Info & Bantuan"
              >
                <HelpCircle className="w-4.5 h-4.5" />
              </Link>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-red-500 bg-slate-50 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-black uppercase tracking-widest text-slate-600 px-4 py-2.5 hover:text-emerald-500 transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="text-xs font-black uppercase tracking-widest bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- Landing Page ---
const LandingPage = () => (
  <div className="pt-20 bg-slate-50">
    {/* ===== HERO SECTION ===== */}
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 bg-emerald-700 text-emerald-100 text-xs font-semibold rounded-full mb-6 tracking-wide">
              SDG 12: Konsumsi Bertanggung Jawab
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.15] mb-5">
              Selamatkan Makanan,{'\n'}
              <span className="text-emerald-600">Bantu Sesama.</span>
            </h1>
            <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-md">
              WiBite menghubungkan kelebihan makanan Anda dengan mereka yang membutuhkan. Bersama kita kurangi limbah pangan untuk masa depan yang lebih hijau dan berkelanjutan.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="px-7 py-3.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/25">
                Mulai Donasi
              </Link>
              <Link to="/explore" className="px-7 py-3.5 bg-white text-emerald-700 border-2 border-emerald-200 font-bold text-sm rounded-xl hover:bg-emerald-50 transition-all">
                Cari Makanan
              </Link>
            </div>
          </motion.div>

          {/* Right: Image with floating card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80"
                alt="Relawan mendistribusikan makanan"
                className="w-full h-[380px] object-cover"
              />
            </div>
            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -left-4 md:-left-6 bg-white p-5 rounded-2xl shadow-xl z-30 flex items-center gap-4 border border-slate-100">
              <div className="w-11 h-11 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">12,500+ Porsi</p>
                <p className="text-xs text-slate-500 font-medium">Telah terselamatkan</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* ===== IMPACT STATS SECTION ===== */}
    <section id="dampak" className="py-20 bg-blue-50/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Kontribusi Kita Bersama</h2>
          <p className="text-slate-500 text-sm font-medium mb-14 max-w-md mx-auto">
            Setiap aksi kecil berdampak besar bagi bumi dan sesama
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { value: '10,000+', unit: 'Kg', label: 'Kg Makanan Terselamatkan', icon: '🌿' },
            { value: '50,000+', unit: '', label: 'Porsi Makanan', icon: '🍽️' },
            { value: '15,000', unit: 'Kg', label: 'Kg CO2 Dikurangi', icon: '🌍' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5">
                {stat.icon}
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">{stat.value} {stat.unit}</p>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ===== HOW IT WORKS SECTION ===== */}
    <section id="cara-kerja" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-14">Mulai Dalam 3 Langkah</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              step: 1,
              icon: '📋',
              title: 'Daftar & Posting',
              desc: 'Daftar akun dan unggah foto makanan layak konsumsi yang ingin didonasikan.',
            },
            {
              step: 2,
              icon: '🤝',
              title: 'Matching',
              desc: 'Donasi Anda akan langsung terdaftar di sistem dan dapat ditemukan oleh penerima manfaat terdekat melalui peta lokasi.',
            },
            {
              step: 3,
              icon: '🚚',
              title: 'Distribusi',
              desc: 'Relawan atau penerima akan mengambil makanan sesuai jadwal yang ditentukan.',
            },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                  {item.step}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 italic">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-[280px]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ===== TESTIMONIAL SECTION ===== */}
    <section className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-emerald-600 text-6xl font-serif mb-6">"</p>
          <blockquote className="text-lg md:text-xl font-semibold text-slate-700 leading-relaxed italic mb-8">
            "Melalui WiBite, kami bisa berkontribusi langsung mengurangi limbah makanan. Sangat mudah digunakan dan dampaknya nyata terasa bagi orang sekitar."
          </blockquote>

          <div className="flex items-center justify-center gap-3">
            <div className="w-11 h-11 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              W
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-emerald-700 italic">Kania</p>
              <p className="text-xs text-slate-400 font-medium">Project Manager</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    {/* ===== CTA SECTION ===== */}
    <section className="py-20 bg-emerald-800">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Siap Membuat Perubahan?
          </h2>
          <p className="text-emerald-200 text-sm font-medium mb-8 italic max-w-md mx-auto">
            Jadilah bagian dari revolusi pangan berkelanjutan di Indonesia.
          </p>
          <Link to="/register" className="inline-block px-10 py-4 bg-white text-emerald-800 font-bold text-sm rounded-xl hover:bg-emerald-50 transition-all shadow-lg">
            Daftar Sekarang
          </Link>
        </motion.div>
      </div>
    </section>
  </div>
);

// --- Guideline Page ---
const GuidelinePage = () => {
  const guidelines = [
    { title: "Kriteria Kelayakan Makanan", icon: "\u{1F957}", items: ["Makanan tidak basi/berubah aroma.", "Penyimpanan minimal 4-6 jam sebelum kadaluarsa.", "Bahan baku masih segel atau dalam wadah bersih.", "Bukan makanan sisa piring (hanya sisa prasmanan/produksi)."] },
    { title: "Tips Pengemasan", icon: "\u{1F4E6}", items: ["Gunakan wadah ramah lingkungan jika memungkinkan.", "Pastikan wadah tertutup rapat (leak-proof).", "Sertakan label tanggal produksi dan estimasi basi.", "Pisahkan makanan basah dan kering."] }
  ];
  return (
    <div className="pt-32 pb-20 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-emerald-500 font-black uppercase tracking-widest text-[10px] bg-emerald-50 px-4 py-2 rounded-full">Standar Keamanan</span>
          <h1 className="text-5xl font-black text-slate-900 mt-6 tracking-tighter">Pedoman Keamanan Makanan</h1>
          <p className="text-slate-400 mt-4 font-medium italic">Panduan untuk memastikan setiap donasi aman dan bermartabat.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {guidelines.map((group, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm">
              <div className="text-4xl mb-6">{group.icon}</div>
              <h3 className="text-2xl font-black text-slate-900 mb-6">{group.title}</h3>
              <ul className="space-y-4">
                {group.items.map((item, i) => (
                  <li key={i} className="flex gap-4 text-slate-500 text-sm font-medium leading-relaxed">
                    <span className="text-emerald-500 font-black">&bull;</span>{item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Explore Page ---
const ExplorePage = ({ user }: { user: User | null }) => {
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [pickupTime, setPickupTime] = useState<string>('');
  const [claimPortions, setClaimPortions] = useState<number>(1);

  useEffect(() => {
    if (selectedFood) {
      setPickupTime('');
      setClaimPortions(1);
    }
  }, [selectedFood]);
  const [smartMatching, setSmartMatching] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [showCityDropdown, setShowCityDropdown] = useState<boolean>(false);
  const cities = ['Semua Kota', 'Jakarta', 'Denpasar', 'Surabaya', 'Bandung', 'Yogyakarta', 'Medan', 'Makassar'];
  const navigate = useNavigate();

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const toggleSmartMatching = () => {
    if (!smartMatching) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserCoords({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setSmartMatching(true);
          },
          (error) => {
            console.error(error);
            // Fallback to default coordinates (Jakarta/Denpasar)
            setUserCoords({ lat: -8.6704, lng: 115.2126 });
            setSmartMatching(true);
          }
        );
      } else {
        setUserCoords({ lat: -8.6704, lng: 115.2126 });
        setSmartMatching(true);
      }
    } else {
      setSmartMatching(false);
    }
  };

  const handleChatDonor = (food: any) => {
    if (!user) return alert('Silakan masuk untuk berkirim pesan dengan donatur.');

    const convId = createConversationFromFood(food, user.id);

    setSelectedFood(null);
    navigate(`/chat?id=${convId}`);
  };

  const fetchFood = async () => {
    setLoading(true);
    try {
      const res = await api.get('/food');
      setFoods(res.data.filter((f: any) => f.status === 'available'));
    } catch (error) {
      console.error('Failed to fetch food:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFood(); }, []);

  const handleClaim = async (foodId: number, pickupTime: string, portions: number) => {
    if (!user) return alert('Silakan masuk untuk mengklaim makanan.');
    if (!pickupTime) return alert('Silakan pilih waktu penjemputan terlebih dahulu.');
    try {
      await api.post('/claim', { food_id: foodId, pickup_time: pickupTime, portions });
      alert('Klaim berhasil! Koordinasikan penjemputan di Dashboard.');
      setSelectedFood(null);
      fetchFood();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Gagal mengklaim makanan.');
    }
  };

  const getBadgeProps = (food: any) => {
    const now = new Date();
    const exp = food.expired_date ? new Date(food.expired_date) : null;
    const isNearExpired = exp ? (exp.getTime() - now.getTime()) < 6 * 60 * 60 * 1000 : false;

    if (isNearExpired) {
      return {
        text: 'DEKAT EXPIRED',
        class: 'bg-amber-500 text-white shadow-sm'
      };
    } else if (food.category === 'Makanan Matang' || !food.category) {
      return {
        text: 'SISA EVENT',
        class: 'bg-emerald-600 text-white shadow-sm'
      };
    } else {
      return {
        text: food.category.toUpperCase(),
        class: 'bg-emerald-50 text-emerald-800 border border-emerald-100'
      };
    }
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
    let distance = null;
    if (lat !== null && lng !== null) {
      if (smartMatching && userCoords) {
        distance = getDistance(userCoords.lat, userCoords.lng, lat, lng);
      } else {
        distance = getDistance(-8.6704, 115.2126, lat, lng);
      }
    }
    return { ...f, distance };
  });

  if (smartMatching) {
    processedFoods.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-slate-50 to-slate-50 min-h-screen pt-36 pb-20">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-emerald-100/30 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Temukan Makanan di Sekitarmu
          </h1>
          <p className="text-slate-500 font-medium text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Cari, temukan, dan klaim makanan layak konsumsi yang tersedia di sekitarmu untuk mengurangi sisa makanan (food waste) di komunitas kita.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-2 mb-16 relative z-20">
          <div className="relative flex-1 w-full flex items-center pl-4 py-2">
            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
            <input
              type="text"
              placeholder="Cari nama makanan, lokasi, atau donatur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent focus:outline-none font-bold text-slate-800 placeholder:text-slate-300 border-none p-0 text-sm"
            />
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-100 shrink-0" />

          {/* Filter Kota Button */}
          <div className="relative shrink-0 w-full md:w-auto px-4">
            <button
              type="button"
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="w-full md:w-auto px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-between md:justify-start gap-2 border border-slate-100"
            >
              <span>{selectedCity || 'Filter Kota'}</span>
              <span className="text-[10px]">▼</span>
            </button>

            {showCityDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-slate-150 rounded-2xl shadow-xl w-48 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {cities.map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setSelectedCity(city === 'Semua Kota' ? '' : city);
                      setShowCityDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-all ${
                      (city === 'Semua Kota' && !selectedCity) || (selectedCity === city)
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



          <button className="w-full md:w-auto px-8 py-3.5 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/25 shrink-0">
            Cari
          </button>
        </div>

        {/* Explore Map Component */}
        <ExploreMap
          foods={processedFoods}
          selectedCity={selectedCity}
          onSelectFood={setSelectedFood}
        />

        {/* listings Header */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-black text-slate-800">Pilihan Hari Ini</h2>
          <a href="#" className="text-sm font-black text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-wider">
            Lihat Semua &gt;
          </a>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-[2.5rem]"></div>)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedFoods.map((food) => {
              const badge = getBadgeProps(food);
              const distanceVal = food.distance !== null
                ? `${food.distance.toFixed(1)} km dari lokasimu`
                : food.lat && food.lng
                  ? `${getDistance(-8.6704, 115.2126, parseFloat(food.lat), parseFloat(food.lng)).toFixed(1)} km dari lokasimu`
                  : '1.2 km dari lokasimu';

              return (
                <motion.div key={food.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={() => setSelectedFood(food)} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer group flex flex-col">
                  {/* Image Section */}
                  <div className="relative h-56 w-full shrink-0 overflow-hidden bg-slate-100">
                    <img src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'} alt={food.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm ${badge.class}`}>
                        {badge.text}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h3 className="text-xl font-extrabold text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">{food.name}</h3>
                      <div className="text-right shrink-0">
                        <p className="text-emerald-600 font-black text-sm">{food.portions - food.claimed_portions} Porsi</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Tersedia</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{distanceVal}</span>
                    </div>

                    <div className="w-full h-px bg-slate-100 my-4" />

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs shrink-0 overflow-hidden border border-slate-200">
                          <img src={`https://ui-avatars.com/api/?name=${food.donor_name || 'D'}&background=EBF7F4&color=066F4E`} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-black text-slate-900 truncate">{food.donor_name || 'Donatur'}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">
                            Ambil s.d {food.expired_date ? new Date(food.expired_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '18:00'}
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-100 transition-colors shrink-0">
                        Lihat
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {processedFoods.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Search className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Tidak ada makanan ditemukan</p>
          </div>
        )}

        {/* Load More Button */}
        {processedFoods.length > 0 && (
          <div className="flex justify-center mt-12">
            <button className="flex items-center gap-2 px-6 py-3 border border-emerald-500 text-emerald-500 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-50 transition-all bg-white shadow-sm">
              Muat Lebih Banyak
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            </button>
          </div>
        )}

        {/* Kontribusi Komunitas Section */}
        <section className="mt-24 -mx-4 px-4 py-16 bg-emerald-50/40 rounded-[2.5rem]">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Kontribusi Komunitas</h3>
              <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
                Setiap makanan yang dibagikan dan diklaim berkontribusi langsung pada pengurangan limbah makanan global dan penyelamatan ekosistem bumi kita.
              </p>
            </div>
            <div className="flex gap-10 md:gap-16 shrink-0">
              <div>
                <p className="text-4xl md:text-5xl font-black text-emerald-600 leading-none">1,240</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Meals Saved</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-black text-emerald-600 leading-none">850kg</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">CO2 Reduced</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Selected Food Detail Modal */}
      <AnimatePresence>
        {selectedFood && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedFood(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 max-h-[95vh] overflow-y-auto flex flex-col md:flex-row">
              <button onClick={() => setSelectedFood(null)} className="absolute top-4 right-4 md:right-6 md:top-6 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-900 z-20 hover:bg-slate-100 transition-colors shadow-sm"><X className="w-5 h-5" /></button>

              {/* Left Image Side */}
              <div className="md:w-5/12 h-64 md:h-auto relative bg-slate-100 shrink-0">
                <img src={selectedFood.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'} alt={selectedFood.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-white text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">
                    {selectedFood.category || 'TERSEDIA'}
                  </span>
                </div>
              </div>

              {/* Right Content Side */}
              <div className="p-8 md:p-10 flex-1 flex flex-col">
                <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-6 mb-8">
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2 leading-tight tracking-tight">{selectedFood.name}</h2>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium text-sm">
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                      {selectedFood.pickup_address?.split(',').slice(-2).join(', ') || 'Lokasi Tersedia'}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-sm flex items-center gap-3 shrink-0 md:mt-0 mt-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 text-sm overflow-hidden">
                      <img src={`https://ui-avatars.com/api/?name=${selectedFood.donor_name || 'D'}&background=10b981&color=fff`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-tight pr-2">{selectedFood.donor_name || 'Donatur'}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="text-xs font-bold text-amber-500">4.9</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      Waktu Pengambilan
                    </p>
                    <div className="bg-emerald-50/50 text-emerald-900 font-bold px-4 py-3 rounded-xl inline-block border border-emerald-100/50 text-sm">
                      Batas: {new Date(selectedFood.expired_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      Kondisi & Catatan Donor
                    </p>
                    <div className="flex gap-2 mb-2">
                      <span className="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-md text-[9px] font-bold uppercase">{selectedFood.category || 'Murni'}</span>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[9px] font-bold uppercase">Halal</span>
                    </div>
                    <p className="text-slate-500 text-sm italic leading-relaxed">
                      "{selectedFood.description || 'Kondisi makanan masih sangat baik dan layak konsumsi.'}"
                    </p>
                  </div>
                </div>
                {/* Portions Selector Section */}
                <div className="mb-6 bg-slate-50 border border-slate-100 p-6 rounded-[2rem]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      Jumlah Porsi
                    </span>
                    <span className="text-emerald-600 font-extrabold text-xs">
                      Tersedia: {selectedFood.portions - selectedFood.claimed_portions} Porsi
                    </span>
                  </div>
                  
                  <label className="block text-xs font-black text-slate-700 mb-2">
                    Berapa porsi yang ingin Anda klaim?
                  </label>
                  
                  <input
                    type="number"
                    min="1"
                    max={selectedFood.portions - selectedFood.claimed_portions}
                    value={claimPortions}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      const maxVal = selectedFood.portions - selectedFood.claimed_portions;
                      setClaimPortions(Math.max(1, Math.min(val, maxVal)));
                    }}
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                {/* Request Pick-up Time Section */}
                <div className="mb-6 bg-blue-50/40 border border-blue-100/50 p-6 rounded-[2rem]">
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
                      className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                  
                  <span className="block text-[10px] font-medium text-slate-400 mt-2 italic">
                    Silakan pilih waktu sebelum batas waktu pengambilan.
                  </span>
                </div>

                <div className="mb-8 flex-grow">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    Alamat Penjemputan
                  </p>
                  <p className="text-slate-700 text-sm font-medium mb-4 leading-relaxed">{selectedFood.pickup_address}</p>
                  {(() => {
                    const lat = selectedFood.lat ? parseFloat(selectedFood.lat) : -8.6704;
                    const lng = selectedFood.lng ? parseFloat(selectedFood.lng) : 115.2126;
                    return (
                      <div className="rounded-2xl overflow-hidden border border-slate-100 h-36 relative">
                        <MapPreview lat={lat} lng={lng} label={selectedFood.name} />
                        <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] font-black text-blue-600 hover:text-blue-700 shadow-sm transition-colors border border-slate-100">Buka di Maps ↗</a>
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50 flex gap-3">
                  <button onClick={() => handleChatDonor(selectedFood)} className="py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Chat
                  </button>
                  <button
                    onClick={() => {
                      if (!pickupTime) {
                        alert("Silakan pilih waktu penjemputan terlebih dahulu.");
                        return;
                      }
                      handleClaim(selectedFood.id, pickupTime, claimPortions);
                    }}
                    className="flex-1 py-4 px-6 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all hover:-translate-y-0.5 text-center"
                  >
                    Klaim Makanan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Auth Page ---
const AuthPage = ({ type, onAuthSuccess }: { type: 'login' | 'register'; onAuthSuccess: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'donor' | 'receiver'>('donor');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      let loggedInUser;
      if (type === 'login') {
        loggedInUser = await authService.login({ email, password });
      } else {
        loggedInUser = await authService.register({ name, email, password, role });
      }
      onAuthSuccess(loggedInUser);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Terjadi kesalahan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* KIRI: Showcase panel (hidden di mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-emerald-500 relative overflow-hidden items-center justify-center p-12 lg:p-20">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1488459718432-068514d04736?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=2070"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            alt="Komunitas berbagi makanan"
          />
        </div>

        {/* Decorative blobs */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-400/30 rounded-full blur-3xl" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-white max-w-lg"
        >
          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center text-white font-black text-4xl mb-8 border border-white/30 shadow-2xl">
            W
          </div>

          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter leading-[1.05] mb-6 uppercase">
            Selamatkan Makanan, <br />
            Berbagi <span className="italic font-black">Kebaikan</span>.
          </h2>

          <p className="text-emerald-50 font-medium text-base lg:text-lg italic opacity-90 leading-relaxed mb-10">
            Bergabunglah dengan ribuan pahlawan pangan yang telah menyelamatkan ribuan porsi makanan setiap harinya untuk masa depan yang lebih hijau.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="px-5 py-4 bg-white/10 backdrop-blur-md rounded-[1.75rem] border border-white/20">
              <p className="text-3xl font-black leading-none">1.2K+</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-2">Porsi Diselamatkan</p>
            </div>
            <div className="px-5 py-4 bg-white/10 backdrop-blur-md rounded-[1.75rem] border border-white/20">
              <p className="text-3xl font-black leading-none">500+</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-2">Pahlawan Hijau</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* KANAN: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20 bg-slate-50 md:bg-white min-h-screen md:min-h-0 pt-24 md:pt-12">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo kecil khusus mobile */}
          <div className="mb-8 md:hidden text-center">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl shadow-emerald-500/20">
              W
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
              {type === 'login' ? 'Masuk' : 'Daftar Akun'}
            </h1>
            <p className="text-slate-400 font-medium mt-3 italic text-sm">
              {type === 'login' ? 'Selamat datang kembali, pahlawan!' : 'Mari mulai langkah kecil untuk dampak besar.'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest rounded-2xl border border-red-100 flex items-center gap-3"
            >
              <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center shrink-0">!</div>
              <span className="normal-case tracking-normal font-bold">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {type === 'register' && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            {/* Peran otomatis menjadi Pendonor saat mendaftar */}

            <button
              disabled={isLoading}
              className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Clock className="w-5 h-5 animate-spin" />
              ) : type === 'login' ? (
                <LogIn className="w-5 h-5" />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
              {type === 'login' ? 'Masuk Sekarang' : 'Buat Akun'}
            </button>
          </form>

          <div className="text-center mt-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-sm text-slate-500 font-medium">
              {type === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
              <Link
                to={type === 'login' ? '/register' : '/login'}
                className="text-emerald-500 font-black hover:underline underline-offset-4 decoration-2 uppercase tracking-widest text-xs ml-1"
              >
                {type === 'login' ? 'Daftar Gratis' : 'Masuk Saja'}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// --- Dashboard Page (routes to role-specific dashboard) ---
const DashboardPage = ({ user, onAuthSuccess }: { user: User | null; onAuthSuccess: (user: User) => void }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const openAdd = searchParams.get('add') === '1';
  const editIdStr = searchParams.get('edit');
  const editFoodId = editIdStr ? parseInt(editIdStr, 10) : null;

  const handleCloseAdd = () => {
    setSearchParams({}, { replace: true });
  };

  const handleCloseEdit = () => {
    setSearchParams({}, { replace: true });
  };

  if (!user) return <AuthPage type="login" onAuthSuccess={onAuthSuccess} />;
  if (user.role === 'donor' || user.role === 'admin') {
    return (
      <DonorDashboard
        user={user}
        openAddFood={openAdd}
        onCloseAddFood={handleCloseAdd}
        editFoodId={editFoodId}
        onCloseEditFood={handleCloseEdit}
      />
    );
  }
  return <ReceiverDashboard user={user} />;
};

// --- Add Food Modal ---
const AddFoodModal = ({ onClose, onAdd }: { onClose: () => void; onAdd: (data: any) => void }) => {
  const [formData, setFormData] = useState({ name: '', portions: 1, weight_kg: 0.5, pickup_address: '', expired_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], description: '', category: 'Makanan Matang' });
  const categories = ['Makanan Matang', 'Bahan Baku', 'Roti & Kue', 'Buah & Sayur', 'Lainnya'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-slate-900">Kirim Donasi</h2>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl"><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onAdd(formData); }} className="grid gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nama Makanan</label>
            <input type="text" required placeholder="Contoh: 5 Box Nasi Ayam Bakar" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-lg" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Jumlah Porsi</label>
              <input type="number" min="1" value={formData.portions} onChange={e => setFormData({ ...formData, portions: parseInt(e.target.value) })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Berat (kg)</label>
              <input type="number" step="0.1" value={formData.weight_kg} onChange={e => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button key={c} type="button" onClick={() => setFormData({ ...formData, category: c })} className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${formData.category === c ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-500'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Alamat Penjemputan</label>
            <textarea required placeholder="Alamat lengkap..." value={formData.pickup_address} onChange={e => setFormData({ ...formData, pickup_address: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 h-28 resize-none font-medium" />
          </div>
          <div className="grid md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Batas Konsumsi</label>
              <input type="date" required value={formData.expired_date} onChange={e => setFormData({ ...formData, expired_date: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold" />
            </div>
            <button type="submit" className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-600">Donasi Sekarang</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- Profile Page ---
const ProfilePage = ({ user, onUpdate }: { user: User | null; onUpdate: (u: User) => void }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    phone: user?.phone || '',
  });

  const localKey = `wibite_profile_${user?.id}`;
  const [localData, setLocalData] = useState(() => {
    const stored = localStorage.getItem(localKey);
    return stored ? JSON.parse(stored) : {
      avatar: '',
      bio: '',
      lat: -6.2088,
      lng: 106.8456,
    };
  });

  const [loading, setLoading] = useState(false);
  const [foodSaved, setFoodSaved] = useState(12); // default mock stat or from API
  const [co2Saved, setCo2Saved] = useState(12);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const res = await api.get('/food');
        const myFood = res.data.filter((f: any) => Number(f.donor_id) === Number(user.id));
        const completed = myFood.filter((f: any) => f.status === 'completed');
        const saved = completed.reduce((acc: number, curr: any) => acc + (curr.weight_kg || 0), 0);
        if (saved > 0) {
          setFoodSaved(saved);
          setCo2Saved(Math.round(saved * 1.0)); // e.g. 1kg saved = 1kg CO2 or whatever factor
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, [user]);

  if (!user) return <AuthPage type="login" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
      });
      // Save local fields
      localStorage.setItem(localKey, JSON.stringify(localData));
      // update context user
      onUpdate({ ...res.data, email: formData.email }); // backend doesn't save email changes sometimes, but let's sync locally
      alert('Profil berhasil diperbarui!');
    } catch (error) {
      console.error(error);
      alert('Gagal memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalData((prev: any) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setLocalData((prev: any) => ({
      ...prev,
      avatar: ''
    }));
  };

  return (
    <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-4 gap-8">
        {/* Sidebar Left */}
        <div className="md:col-span-1 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 leading-tight">Pengaturan</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Kelola akun Anda</p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="w-full px-4 py-3 bg-emerald-100/70 text-emerald-700 font-bold text-xs rounded-2xl flex items-center gap-3 text-left focus:outline-none transition-colors border border-emerald-200/10"
            >
              <UserIcon className="w-4 h-4" />
              Profile
            </button>
            <button
              type="button"
              onClick={() => navigate('/donation')}
              className="w-full px-4 py-3 text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-bold text-xs rounded-2xl flex items-center gap-3 text-left focus:outline-none transition-colors"
            >
              <HandHeart className="w-4 h-4" />
              Donasi
            </button>
            <button
              type="button"
              onClick={() => navigate('/rateback')}
              className="w-full px-4 py-3 text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-bold text-xs rounded-2xl flex items-center gap-3 text-left focus:outline-none transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Rating dan Feedback
            </button>
            <button
              type="button"
              onClick={() => navigate('/info')}
              className="w-full px-4 py-3 text-slate-500 hover:bg-slate-100 hover:text-slate-700 font-bold text-xs rounded-2xl flex items-center gap-3 text-left focus:outline-none transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </button>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => navigate(user.role === 'donor' ? '/dashboard' : '/explore')}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md text-center"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Form Right */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">Pengaturan Profil</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Perbarui informasi publik dan detail kontak Anda di sini.</p>
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center justify-center py-6 border-b border-slate-50 w-full">
            
              <div className="relative w-32 h-32 shrink-0">
                {localData.avatar ? (
                  <img
                    src={localData.avatar}
                    alt="Avatar Profile"
                    className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg bg-slate-100"
                  />
                ) : (
                  <div className="w-full h-full rounded-full border-4 border-slate-200 border-dashed bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner">
                    <UserIcon className="w-12 h-12" />
                  </div>
                )}

               
                <div className="absolute bottom-1 right-1 z-10">
                  <button
                    type="button"
                    onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                    className="w-9 h-9 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-emerald-700 transition-colors focus:outline-none shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                 
                  {showPhotoMenu && (
                    <div className="absolute top-11 left-1/2 -translate-x-1/2 z-30 bg-white border border-slate-100 shadow-xl rounded-xl p-2 flex flex-col gap-1 w-28 animate-in fade-in zoom-in-95 duration-100">
                      
                      {/* Tambah */}
                      <label className="w-full text-center px-2 py-1.5 bg-emerald-5 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] rounded-lg transition-colors cursor-pointer block">
                        Tambah
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handleAvatarChange(e);
                            setShowPhotoMenu(false);
                          }}
                          className="hidden"
                        />
                      </label>

                      {/* Hapus */}
                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveAvatar();
                          setShowPhotoMenu(false);
                        }}
                        className="w-full text-center px-2 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[10px] rounded-lg transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fields Grid*/}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama Lengkap Anda"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama@email.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                />
              </div>
            </div>

        
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Nomor Telepon / WhatsApp</label>
              <input
                type="tel"
                required
                value={formData.phone || ''} 
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Contoh: 081234567890"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Alamat</label>
              <textarea
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Masukkan alamat lengkap Anda (Opsional)"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-semibold text-xs text-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 h-16 resize-none"
              />
            </div>

            
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Bio</label>
              <textarea
                maxLength={160}
                value={localData.bio}
                onChange={e => setLocalData((prev: any) => ({ ...prev, bio: e.target.value }))}
                placeholder="Ceritakan sedikit tentang diri Anda atau misi donasi Anda..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-semibold text-xs text-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 h-24 resize-none"
              />
              <div className="text-right text-[10px] text-slate-450 font-bold mt-1">
                {localData.bio.length}/160 karakter
              </div>
            </div>

            {/* Leaflet Map Picker */}
            <div className="space-y-1">
              <div className="h-56 rounded-2xl overflow-hidden border border-slate-100 relative">
                <MapPicker
                  initialLat={localData.lat}
                  initialLng={localData.lng}
                  initialAddress={formData.address}
                  onCoordinatePicked={(lat, lng, address) => {
                    setLocalData((prev: any) => ({ ...prev, lat, lng }));
                    setFormData((prev: any) => ({ ...prev, address }));
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-2">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></span>
                Lokasi Terkunci
              </div>
            </div>
            {/* Submit & Cancel */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
              <button
                type="button"
                onClick={() => {
                  setFormData({ name: user.name || '', email: user.email || '', address: user.address || '', phone: user.phone || '' });
                  const stored = localStorage.getItem(localKey);
                  if (stored) setLocalData(JSON.parse(stored));
                }}
                className="px-6 py-2.5 border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-colors"
              >
                Batalkan
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Banner */}
        <div className="md:col-span-4 bg-emerald-50 border border-emerald-100/70 rounded-2xl p-5 flex items-center justify-between shadow-sm mt-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 border border-emerald-200/50">
              <Leaf className="w-5 h-5 fill-emerald-200/50" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 leading-tight">Dampak Anda Sejauh Ini</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Anda telah menyelamatkan {foodSaved}kg makanan!</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-700">{co2Saved}</span>
            <span className="text-[10px] font-black text-emerald-600 ml-1 uppercase tracking-wider">Kg CO2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Admin Dashboard ---
const AdminDashboard = ({ user }: { user: User | null }) => {
  const [foods, setFoods] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // === HANYA MENAMBAHKAN STATE UNTUK DONASI FINANSIAL ===
  const [financialDonations, setFinancialDonations] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    const fetchData = async () => {
      try {
        const [fRes, uRes, fbRes] = await Promise.all([
          api.get('/food'),
          api.get('/admin/users'),
          api.get('/admin/feedback'),
        ]);
        setFoods(fRes.data);
        setUsers(uRes.data);
        setFeedbacks(fbRes.data);

        // === HANYA MENAMBAHKAN PENGAMBILAN DATA FINANSIAL ===
        try {
          const finRes = await api.get('/admin/financial-donations');
          setFinancialDonations(finRes.data);
        } catch (finError) {
          console.error("Gagal mengambil API finansial, mencoba localStorage:", finError);
          const savedFin = localStorage.getItem('wibite_financial_donations');
          if (savedFin) setFinancialDonations(JSON.parse(savedFin));
        }

      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  if (user?.role !== 'admin') return <div className="pt-32 text-center font-black">Akses Ditolak</div>;

  const handleDeleteFood = async (id: number) => {
    if (!confirm('Hapus makanan ini?')) return;
    await api.delete(`/food/${id}`);
    setFoods(foods.filter(f => f.id !== id));
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Hapus user ini?')) return;
    await api.delete(`/admin/users/${id}`);
    setUsers(users.filter(u => u.id !== id));
  };

  // === HANYA MENAMBAHKAN PERHITUNGAN TOTAL DANA SECARA AMAN ===
  const totalDanaTerkumpul = Array.isArray(financialDonations)
    ? financialDonations.reduce((acc: number, curr: any) => {
        const nilai = curr && curr.amount ? Number(curr.amount) : 0;
        return acc + (isNaN(nilai) ? 0 : nilai);
      }, 0)
    : 0;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <h1 className="text-4xl font-black text-slate-900 mb-12">Admin Panel</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-6">Makanan ({foods.length})</h2>
          <div className="bg-white rounded-3xl border border-slate-50 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white"><tr><th className="p-4 text-xs font-black uppercase">Nama</th><th className="p-4 text-xs font-black uppercase">Status</th><th className="p-4 text-xs font-black uppercase">Aksi</th></tr></thead>
              <tbody>
                {foods.map(f => (
                  <tr key={f.id} className="border-b border-slate-50 text-sm">
                    <td className="p-4 font-bold">{f.name}</td>
                    <td className="p-4"><span className={`text-[10px] font-black px-2 py-1 rounded-full ${f.status === 'available' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>{f.status}</span></td>
                    <td className="p-4"><button onClick={() => handleDeleteFood(f.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-6">Users ({users.length})</h2>
          <div className="bg-white rounded-3xl border border-slate-50 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white"><tr><th className="p-4 text-xs font-black uppercase">Nama</th><th className="p-4 text-xs font-black uppercase">Role</th><th className="p-4 text-xs font-black uppercase">Aksi</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-slate-50 text-sm">
                    <td className="p-4 font-bold">{u.name}<p className="text-[10px] text-slate-400">{u.email}</p></td>
                    <td className="p-4"><span className={`text-[10px] font-black px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-500' : u.role === 'donor' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>{u.role}</span></td>
                    <td className="p-4"><button onClick={() => handleDeleteUser(u.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-2xl font-black text-slate-900 mb-6">Feedback Pengguna ({feedbacks.length})</h2>
        <div className="bg-white rounded-3xl border border-slate-50 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white"><tr><th className="p-4 text-xs font-black uppercase">User</th><th className="p-4 text-xs font-black uppercase">Rating</th><th className="p-4 text-xs font-black uppercase">Tag</th><th className="p-4 text-xs font-black uppercase">Komentar</th><th className="p-4 text-xs font-black uppercase">Waktu</th></tr></thead>
            <tbody>
              {feedbacks.map((fb) => (
                <tr key={fb.id} className="border-b border-slate-50 text-sm">
                  <td className="p-4 font-bold">
                    {fb.user?.name || 'Tidak Diketahui'}
                    <p className="text-[10px] text-slate-400">{fb.user?.email || '-'}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-black px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">{fb.rating} / 5</span>
                  </td>
                  <td className="p-4 text-slate-700">{fb.tags?.length ? fb.tags.join(', ') : '-'}</td>
                  <td className="p-4 text-slate-700">{fb.message || '-'}</td>
                  <td className="p-4 text-[11px] text-slate-500">{new Date(fb.created_at).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* === HANYA MENAMBAHKAN TABEL SEKSI BARU DI BAGIAN PALING BAWAH === */}
      <div className="mt-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-black text-slate-900">Riwayat Donasi ({financialDonations.length})</h2>
          <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl self-start sm:self-auto">
            <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">Total Saldo Masuk</span>
            <span className="text-xl font-black text-emerald-600">
              Rp {totalDanaTerkumpul.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl border border-slate-50 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-4 text-xs font-black uppercase">Nama Donatur</th>
                <th className="p-4 text-xs font-black uppercase">Nominal</th>
                <th className="p-4 text-xs font-black uppercase">Metode</th>
                <th className="p-4 text-xs font-black uppercase">Pesan & Dukungan</th>
                <th className="p-4 text-xs font-black uppercase">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {financialDonations.length > 0 ? (
                financialDonations.map((donasi) => (
                  <tr key={donasi.id} className="border-b border-slate-50 text-sm">
                    <td className="p-4 font-bold text-slate-900">
                      {donasi.donorName || donasi.user_name || 'Anonim'}
                    </td>
                    <td className="p-4 font-black text-emerald-600">
                      Rp {Number(donasi.amount || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-black px-2 py-1 bg-slate-100 text-slate-600 rounded-full uppercase">
                        {donasi.paymentMethod || donasi.payment_method || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{donasi.notes || donasi.message || '-'}</td>
                    <td className="p-4 text-[11px] text-slate-500">
                      {donasi.created_at ? new Date(donasi.created_at).toLocaleString('id-ID') : (donasi.date || '-')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm font-bold text-slate-400">
                    Belum ada Donasi masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

// --- App Root ---
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const u = await authService.me();
      setUser(u);
      setLoading(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Keep conversations/messages persisted across users on the same browser.
        // Previously we cleared all `wibite_msgs_` when `wibite_user_id` changed,
        // which caused sent messages to disappear when switching users during testing.
        localStorage.setItem('wibite_user_id', String(user.id));
      } else {
        // No user logged in, keep chat storage to preserve local conversation history.
        localStorage.removeItem('wibite_user_id');
      }
    }
  }, [user, loading]);

  const handleLogout = async () => {
    await authService.logout();
    
    localStorage.removeItem('wibite_user_id');
    setUser(null);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-emerald-500/20">W</motion.div>
      </div>
    );
  }

  const themeClass = user?.role === 'receiver' ? 'theme-receiver' : 'theme-donor';

  return (
    <Router>
      <div className={`min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-500/20 selection:text-emerald-500 ${themeClass}`}>
        <Navbar user={user} onLogout={handleLogout} onUserUpdate={setUser} />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<ExplorePage user={user} />} />
            <Route path="/forum" element={<ForumPage user={user} />} />
            <Route path="/guidelines" element={<GuidelinePage />} />
            <Route path="/info" element={<HelpInfo />} />
            <Route path="/dashboard" element={<DashboardPage user={user} onAuthSuccess={setUser} />} />
            <Route path="/history" element={user ? <DonationHistory user={user} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={<ProfilePage user={user} onUpdate={setUser} />} />
            <Route path="/chat" element={user ? <Chat user={user} /> : <Navigate to="/login" />} />
            <Route path="/klaim" element={user ? <ClaimsPage user={user} /> : <Navigate to="/login" />} />
            <Route path="/rateback" element={user ? <RatebackPage user={user} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
            <Route path="/login" element={<AuthPage type="login" onAuthSuccess={setUser} />} />
            <Route path="/register" element={<AuthPage type="register" onAuthSuccess={setUser} />} />
            <Route path="/donation" element={<DonationFinancial />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-100 mt-auto">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">W</div>
                <span className="text-xl font-bold tracking-tight">wibite</span>
              </Link>
              <p className="text-slate-500 text-sm max-w-sm leading-relaxed font-medium mb-6">
                Platform redistribusi makanan berlebih di Indonesia yang mendukung SDGs 12. Menghubungkan kebaikan, satu porsi dalam satu waktu.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="w-9 h-9 bg-slate-50 hover:bg-emerald-500 hover:text-white text-slate-400 rounded-xl flex items-center justify-center transition-colors" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-slate-50 hover:bg-emerald-500 hover:text-white text-slate-400 rounded-xl flex items-center justify-center transition-colors" aria-label="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-slate-50 hover:bg-emerald-500 hover:text-white text-slate-400 rounded-xl flex items-center justify-center transition-colors" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="mailto:hello@wibite.com" className="w-9 h-9 bg-slate-50 hover:bg-emerald-500 hover:text-white text-slate-400 rounded-xl flex items-center justify-center transition-colors" aria-label="Email">
                  <MailIcon className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Tautan Cepat */}
            <div className="md:ml-38">
              <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-5">Tautan Cepat</h4>
              <ul className="space-y-3">
                <li><Link to="/forum" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors">Forum Komunitas</Link></li>
                <li><Link to="/guidelines" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors">Pedoman Donasi</Link></li>
                <li><Link to="/rateback" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors">Rating & Masukan</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="md:justify-self-end md:text-left">
              <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-5">Informasi</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="#" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors">Kontak</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-400 font-medium">
                &copy; {new Date().getFullYear()} <span className="font-bold text-slate-600">WiBite Team</span>. All rights reserved.
              </p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                <span>Made with</span>
                <Heart className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                <span>for SDGs 12</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
