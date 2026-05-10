import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Search, LayoutDashboard, LogOut, MapPin, ChevronRight, TrendingUp,
  Globe, Leaf, Clock, Info, X, Star, CheckCircle2, Lock, Mail,
  User as UserIcon, MessageCircle, LogIn, Trash2, Pencil, PlusCircle,
  HandHeart, Utensils, Instagram, Twitter, Facebook, Mail as MailIcon,
  Menu, Phone, Shield, FileText, Sparkles
} from 'lucide-react';
import { authService, type User } from '@/lib/auth';
import api from '@/lib/api';
import ForumPage from '@/components/Forum';
import ChatModal from '@/components/ChatModal';
import { ToastProvider, useToast } from '@/components/Toast';
import { ConfirmProvider, useConfirm } from '@/components/Confirm';

// --- Navbar ---
const Navbar = ({ user, onLogout }: { user: User | null; onLogout: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tutup menu mobile ketika pindah halaman
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinkClass = (path: string) =>
    `px-4 lg:px-6 py-2.5 rounded-xl text-[11px] lg:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
      location.pathname === path
        ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20'
        : 'text-slate-500 hover:bg-white hover:text-emerald-500'
    }`;

  const navBg = isScrolled
    ? 'bg-white/90 backdrop-blur-md shadow-sm'
    : 'bg-transparent';

  const primaryLink = user && (user.role === 'donor' || user.role === 'admin')
    ? { to: '/donate', label: 'Donor Makanan' }
    : { to: '/explore', label: 'Cari Makanan' };

  const mobileLinks = [
    primaryLink,
    { to: '/forum', label: 'Forum' },
    { to: '/guidelines', label: 'Pedoman' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg} ${
        isScrolled ? 'py-3' : 'py-4 md:py-5'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3">
        {/* KIRI: Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">
            W
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">wibite</span>
        </Link>

        {/* TENGAH: Nav menu (desktop only) */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center bg-slate-50/80 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-100 gap-1">
            <Link to={primaryLink.to} className={navLinkClass(primaryLink.to)}>{primaryLink.label}</Link>
            <Link to="/forum" className={navLinkClass('/forum')}>Forum</Link>
            <Link to="/guidelines" className={navLinkClass('/guidelines')}>Pedoman</Link>
          </div>
        </div>

        {/* KANAN: Auth / User menu */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex text-[11px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                title="Profil"
              >
                <UserIcon className="w-4 h-4 text-slate-600" />
              </Link>
              <Link
                to="/dashboard"
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                title="Dashboard"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-600" />
              </Link>
              <button
                onClick={onLogout}
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-red-500 bg-slate-50 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Keluar
              </button>
              <button
                onClick={onLogout}
                className="sm:hidden p-2.5 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-500 rounded-xl transition-colors"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex text-[11px] font-black uppercase tracking-widest text-slate-600 px-4 py-2.5 hover:text-emerald-500 transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="text-[11px] font-black uppercase tracking-widest bg-emerald-500 text-white px-4 sm:px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                Daftar
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-4 h-4 text-slate-600" /> : <Menu className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden px-4 sm:px-6 pb-4 pt-2"
          >
            <div className="bg-white border border-slate-100 rounded-2xl shadow-lg p-2 flex flex-col gap-1">
              {mobileLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest ${
                    location.pathname === l.to
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 mt-1"
                >
                  Admin Panel
                </Link>
              )}
              {!user && (
                <Link
                  to="/login"
                  className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                >
                  Masuk
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Landing Page ---
const LandingPage = () => (
  <div className="pt-20">
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 w-1/3 h-1/3 bg-emerald-100/50 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="inline-block px-4 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-6 tracking-wide uppercase">Dukung SDGs 12: Konsumsi & Produksi Bertanggung Jawab</span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6">
            Temukan Makanan di <span className="text-emerald-500 italic">Sekitarmu</span>.
          </h1>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg">
            Kurangi sisa makanan dengan berbagi kepada sesama. WiBite menghubungkan donatur makanan berlebih dengan kamu yang membutuhkan.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/explore" className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/30">
              Cari Makanan <ChevronRight className="w-5 h-5" />
            </Link>
            <Link to="/register" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 font-bold rounded-2xl hover:bg-slate-50 transition-all">
              Mulai Berbagi
            </Link>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
          <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80" alt="Berbagi Makanan" className="rounded-3xl shadow-2xl z-20 relative" />
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl z-30 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">12,500+ Porsi</p>
              <p className="text-xs text-slate-500 font-medium">Telah terselamatkan</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-16">Mengapa Bergabung dengan <span className="text-emerald-500 italic">WiBite</span>?</h2>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { icon: Leaf, title: "Kurangi Food Waste", desc: "Setiap porsi yang dibagikan mengurangi beban limbah pada ekosistem kita." },
            { icon: Globe, title: "Bantu Komunitas", desc: "Membantu mereka yang membutuhkan di sekitarmu dengan akses makanan layak." },
            { icon: TrendingUp, title: "Lacak Impact-mu", desc: "Lihat statistik kontribusimu terhadap penyelamatan makanan dan emisi karbon." }
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="p-8 rounded-3xl border border-slate-100 hover:border-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-4">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

// --- Info Pages (Tentang / Privasi / Syarat / Kontak) ---
const InfoPageLayout = ({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div className="pt-28 md:pt-32 pb-16 md:pb-20 px-4">
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10 md:mb-14">
        <span className="inline-block text-emerald-500 font-black uppercase tracking-widest text-[10px] bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          {eyebrow}
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mt-5 tracking-tight">{title}</h1>
        <p className="text-slate-500 mt-3 font-medium italic text-sm md:text-base">{subtitle}</p>
      </div>
      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-50 shadow-sm space-y-6 text-slate-600 text-sm md:text-base leading-relaxed font-medium">
        {children}
      </div>
    </div>
  </div>
);

const AboutPage = () => (
  <InfoPageLayout
    eyebrow="Tentang WiBite"
    title="Menghubungkan Kebaikan, Satu Porsi dalam Satu Waktu."
    subtitle="Platform redistribusi makanan berlebih yang mendukung SDGs 12."
  >
    <p>
      <strong className="text-slate-900">WiBite</strong> adalah platform komunitas yang menghubungkan
      pendonor makanan berlebih dengan penerima yang membutuhkan. Kami percaya bahwa makanan
      layak konsumsi tidak seharusnya berakhir di tempat sampah sementara banyak orang di sekitar
      kita masih kekurangan.
    </p>
    <p>
      Dengan mendukung <strong className="text-slate-900">Sustainable Development Goals (SDGs) 12: Konsumsi dan
      Produksi yang Bertanggung Jawab</strong>, WiBite menghadirkan cara mudah untuk berbagi:
      pendonor mempublikasikan makanan berlebih, penerima mengklaim, dan keduanya berkoordinasi
      lewat chat untuk penjemputan.
    </p>
    <div className="grid md:grid-cols-3 gap-4 pt-2">
      <div className="p-5 bg-emerald-50 rounded-2xl">
        <Leaf className="w-6 h-6 text-emerald-500 mb-2" />
        <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Misi</p>
        <p className="text-sm text-emerald-800 mt-1">Mengurangi food waste di Indonesia.</p>
      </div>
      <div className="p-5 bg-amber-50 rounded-2xl">
        <HandHeart className="w-6 h-6 text-amber-500 mb-2" />
        <p className="text-xs font-black uppercase tracking-widest text-amber-700">Nilai</p>
        <p className="text-sm text-amber-800 mt-1">Kebaikan, transparansi, dan martabat.</p>
      </div>
      <div className="p-5 bg-indigo-50 rounded-2xl">
        <Sparkles className="w-6 h-6 text-indigo-500 mb-2" />
        <p className="text-xs font-black uppercase tracking-widest text-indigo-700">Visi</p>
        <p className="text-sm text-indigo-800 mt-1">Komunitas yang saling menjaga lewat pangan.</p>
      </div>
    </div>
  </InfoPageLayout>
);

const PrivacyPage = () => (
  <InfoPageLayout
    eyebrow="Kebijakan Privasi"
    title="Privasi Kamu, Prioritas Kami."
    subtitle="Bagaimana kami mengumpulkan, menyimpan, dan menggunakan data kamu."
  >
    <h3 className="text-lg font-black text-slate-900">1. Data yang Kami Kumpulkan</h3>
    <p>Kami menyimpan data akun (nama, email, telepon, alamat) yang kamu isi saat mendaftar atau mengelola profil, serta data aktivitas seperti donasi, klaim, dan pesan.</p>
    <h3 className="text-lg font-black text-slate-900">2. Penggunaan Data</h3>
    <p>Data digunakan untuk menjalankan fitur platform (otentikasi, klaim makanan, chat koordinasi) dan untuk meningkatkan kualitas layanan. Kami tidak menjual data kamu ke pihak ketiga.</p>
    <h3 className="text-lg font-black text-slate-900">3. Keamanan</h3>
    <p>Kata sandi disimpan dalam bentuk hash. Token otentikasi hanya berlaku pada sesi kamu dan bisa dicabut kapan saja lewat tombol "Keluar".</p>
    <h3 className="text-lg font-black text-slate-900">4. Hak Kamu</h3>
    <p>Kamu bisa mengubah atau menghapus data profil kapan saja dari halaman Profil. Untuk penghapusan akun, hubungi kami lewat halaman Kontak.</p>
  </InfoPageLayout>
);

const TermsPage = () => (
  <InfoPageLayout
    eyebrow="Syarat & Ketentuan"
    title="Aturan Main di WiBite."
    subtitle="Dengan menggunakan layanan, kamu menyetujui ketentuan berikut."
  >
    <h3 className="text-lg font-black text-slate-900">1. Penggunaan Layanan</h3>
    <p>WiBite hanya boleh digunakan untuk kegiatan redistribusi makanan yang sah dan nir-laba. Penjualan, penipuan, atau penyalahgunaan platform akan berakibat pada penangguhan akun.</p>
    <h3 className="text-lg font-black text-slate-900">2. Kewajiban Pendonor</h3>
    <p>Pendonor bertanggung jawab memastikan makanan yang didonasikan masih layak konsumsi sesuai pedoman keamanan. Cantumkan informasi yang jujur tentang porsi, lokasi, dan batas waktu.</p>
    <h3 className="text-lg font-black text-slate-900">3. Kewajiban Penerima</h3>
    <p>Penerima wajib menjemput makanan sesuai koordinasi dengan pendonor dan menyelesaikan klaim melalui tombol "Selesai" setelah makanan diterima.</p>
    <h3 className="text-lg font-black text-slate-900">4. Batasan Tanggung Jawab</h3>
    <p>WiBite memfasilitasi pertemuan antara pendonor dan penerima, namun tidak bertanggung jawab atas kondisi makanan pasca penjemputan. Gunakan akal sehat dan periksa kelayakan sebelum dikonsumsi.</p>
    <h3 className="text-lg font-black text-slate-900">5. Perubahan Ketentuan</h3>
    <p>Ketentuan dapat diperbarui sewaktu-waktu. Perubahan signifikan akan diumumkan di platform.</p>
  </InfoPageLayout>
);

const ContactPage = () => (
  <InfoPageLayout
    eyebrow="Kontak"
    title="Mari Ngobrol."
    subtitle="Ada pertanyaan, masukan, atau laporan? Kami siap mendengar."
  >
    <div className="grid md:grid-cols-2 gap-4">
      <a
        href="mailto:hello@wibite.com"
        className="flex items-start gap-4 p-5 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-colors"
      >
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
          <MailIcon className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Email</p>
          <p className="text-sm font-black text-emerald-900 break-all">hello@wibite.com</p>
        </div>
      </a>
      <a
        href="tel:+622150000000"
        className="flex items-start gap-4 p-5 bg-amber-50 rounded-2xl hover:bg-amber-100 transition-colors"
      >
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
          <Phone className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Telepon</p>
          <p className="text-sm font-black text-amber-900">+62 21 5000 0000</p>
        </div>
      </a>
      <div className="flex items-start gap-4 p-5 bg-indigo-50 rounded-2xl">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Alamat</p>
          <p className="text-sm font-black text-indigo-900">Jakarta, Indonesia</p>
        </div>
      </div>
      <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Komunitas</p>
          <Link to="/forum" className="text-sm font-black text-slate-900 hover:text-emerald-500">
            Buka Forum
          </Link>
        </div>
      </div>
    </div>
    <p className="text-xs text-slate-400 pt-2">
      Respons email rata-rata dalam 1-2 hari kerja. Untuk laporan penyalahgunaan, sertakan bukti tangkapan layar.
    </p>
  </InfoPageLayout>
);

// --- Guideline Page ---
const GuidelinePage = () => {
  const guidelines = [
    { title: "Kriteria Kelayakan Makanan", icon: "\u{1F957}", items: ["Makanan tidak basi/berubah aroma.", "Penyimpanan minimal 4-6 jam sebelum kadaluarsa.", "Bahan baku masih segel atau dalam wadah bersih.", "Bukan makanan sisa piring (hanya sisa prasmanan/produksi)."] },
    { title: "Tips Pengemasan", icon: "\u{1F4E6}", items: ["Gunakan wadah ramah lingkungan jika memungkinkan.", "Pastikan wadah tertutup rapat (leak-proof).", "Sertakan label tanggal produksi dan estimasi basi.", "Pisahkan makanan basah dan kering."] }
  ];
  return (
    <div className="pt-28 md:pt-32 pb-12 md:pb-20 px-4 relative">
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
const getRemaining = (food: any): number => {
  if (typeof food.remaining_portions === 'number') return food.remaining_portions;
  const total = Number(food.portions || 0);
  const claimed = Number(food.claimed_portions || 0);
  return Math.max(0, total - claimed);
};

const ExplorePage = ({ user }: { user: User | null }) => {
  const toast = useToast();
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [claimPortions, setClaimPortions] = useState(1);
  const [claiming, setClaiming] = useState(false);

  const fetchFood = async () => {
    setLoading(true);
    try {
      const res = await api.get('/food');
      // Tampilkan makanan yang masih punya sisa porsi (bukan hanya status 'available')
      setFoods(
        res.data.filter(
          (f: any) => f.status !== 'completed' && getRemaining(f) > 0,
        ),
      );
    } catch (error) {
      console.error('Failed to fetch food:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFood(); }, []);

  useEffect(() => {
    if (selectedFood) {
      const remaining = getRemaining(selectedFood);
      setClaimPortions(remaining > 0 ? 1 : 0);
    }
  }, [selectedFood]);

  const handleClaim = async (foodId: number, portions: number) => {
    if (!user) return toast.info('Silakan masuk untuk mengklaim makanan.');
    if (portions < 1) return;
    setClaiming(true);
    try {
      await api.post('/claim', { food_id: foodId, portions });
      toast.success(
        `Klaim berhasil untuk ${portions} porsi. Koordinasikan penjemputan lewat chat di Dashboard.`,
      );
      setSelectedFood(null);
      fetchFood();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal mengklaim makanan.');
    } finally {
      setClaiming(false);
    }
  };

  const filteredFoods = foods.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.pickup_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-28 md:pt-32 pb-12 md:pb-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Jelajahi Makanan</h1>
            <p className="text-slate-500 font-medium italic">Temukan makanan layak konsumsi di sekitarmu.</p>
          </div>
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Cari makanan atau lokasi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm font-medium" />
          </div>
        </div>
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-[2.5rem]"></div>)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFoods.map((food) => {
              const remaining = getRemaining(food);
              const total = food.portions || 0;
              const partial = remaining < total;
              return (
              <motion.div key={food.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={() => setSelectedFood(food)} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all cursor-pointer group">
                <div className="relative h-56">
                  <img src={food.image} alt={food.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-5 left-5 flex flex-col gap-2 items-start">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-widest border border-emerald-100">
                      Sisa {remaining}/{total} Porsi
                    </span>
                    {partial && (
                      <span className="px-3 py-1 bg-amber-500/95 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                        Tersisa Sebagian
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 truncate group-hover:text-emerald-500 transition-colors uppercase">{food.name}</h3>
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-6">
                    <MapPin className="w-4 h-4 text-emerald-500" /> {food.pickup_address || 'Lokasi tidak tersedia'}
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400 text-xs">{food.donor_name?.[0] || 'D'}</div>
                      <span className="text-sm font-bold text-slate-900">{food.donor_name || 'Donatur'}</span>
                    </div>
                    <button className="p-2 bg-emerald-50 text-emerald-500 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        )}
        {filteredFoods.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Search className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Tidak ada makanan ditemukan</p>
          </div>
        )}
      </div>
      <AnimatePresence>
        {selectedFood && (() => {
          const remaining = getRemaining(selectedFood);
          const total = selectedFood.portions || 0;
          const canClaim = remaining > 0;
          return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedFood(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setSelectedFood(null)} className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-900 z-20 hover:bg-white transition-colors border border-slate-100 shadow-sm"><X className="w-5 h-5" /></button>
              <div className="relative h-64 md:h-80">
                <img src={selectedFood.image} alt={selectedFood.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-8 md:p-10">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">{selectedFood.name}</h2>
                <div className="flex items-center gap-2 text-slate-500 font-medium text-sm mb-6"><MapPin className="w-4 h-4 text-emerald-500" /> {selectedFood.pickup_address}</div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-50 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Porsi</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{total}</p>
                  </div>
                  <div className="bg-amber-50 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Sudah Diklaim</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">{total - remaining}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Sisa</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{remaining}</p>
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6">{selectedFood.description || 'Tidak ada catatan.'}</p>

                {canClaim ? (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-4 text-center">
                      Setiap penerima hanya bisa klaim <strong className="text-slate-900">1 porsi</strong> per makanan.
                    </p>
                    <button
                      onClick={() => handleClaim(selectedFood.id, 1)}
                      disabled={claiming}
                      className="w-full py-4 px-6 bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all disabled:opacity-60"
                    >
                      {claiming ? 'Memproses...' : 'Klaim 1 Porsi'}
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="p-5 bg-slate-50 rounded-2xl text-center text-slate-500 font-bold text-sm">
                      Semua porsi sudah diklaim.
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
};

// --- Auth Page ---
const AuthPage = ({ type }: { type: 'login' | 'register' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (type === 'login') {
        await authService.login({ email, password });
        navigate('/dashboard');
      } else {
        await authService.register({ name, email, password, role: 'receiver' });
        navigate('/explore');
      }
      window.location.reload();
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
                    placeholder="Contoh: Budi Santoso"
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

// --- Dashboard Page ---
const DashboardPage = ({ user }: { user: User | null }) => {
  const toast = useToast();
  const confirmDialog = useConfirm();
  const [activeTab, setActiveTab] = useState<'listings' | 'claims' | 'history' | 'impact'>('listings');
  const [foods, setFoods] = useState<any[]>([]);
  const [myClaims, setMyClaims] = useState<any[]>([]);
  const [incomingClaims, setIncomingClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [chatCtx, setChatCtx] = useState<{ claimId: number; foodName: string; counterpartName: string; portions?: number } | null>(null);
  const [stats, setStats] = useState({ foodSaved: 0, peopleHelped: 0 });

  const isDonor = user?.role === 'donor' || user?.role === 'admin';
  const isReceiver = user?.role === 'receiver';

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const calls: Promise<any>[] = [api.get('/food')];
      if (isDonor) calls.push(api.get('/claims/incoming'));
      // Setiap user (termasuk donor) bisa jadi receiver -> ambil claim miliknya juga
      calls.push(api.get('/claims/mine'));

      const results = await Promise.all(calls);
      const allFood = results[0].data;

      if (isDonor) {
        const myFood = allFood.filter((f: any) => f.donor_id === user?.id);
        setFoods(myFood);
        const completedFood = myFood.filter((f: any) => f.status === 'completed');
        setStats({
          foodSaved: completedFood.reduce((acc: number, curr: any) => acc + Number(curr.weight_kg || 0), 0),
          peopleHelped: completedFood.reduce((acc: number, curr: any) => acc + Number(curr.portions || 0), 0),
        });
        setIncomingClaims(results[1].data);
      } else {
        setFoods([]);
        setIncomingClaims([]);
      }

      const mine = results[results.length - 1].data;
      setMyClaims(mine);

      if (isReceiver) {
        const completed = mine.filter((c: any) => c.status === 'completed');
        setStats({
          foodSaved: completed.reduce(
            (acc: number, c: any) => acc + Number(c.food?.weight_kg || 0) * Number(c.portions || 0) / Math.max(1, Number(c.food?.portions || 1)),
            0,
          ),
          peopleHelped: completed.reduce((acc: number, c: any) => acc + Number(c.portions || 0), 0),
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      if (isReceiver) setActiveTab('claims');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async (id: number) => {
    const ok = await confirmDialog({
      title: 'Hapus Donasi',
      message: 'Donasi ini akan dihapus permanen. Lanjutkan?',
      confirmLabel: 'Ya, Hapus',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/food/${id}`);
      fetchDashboardData();
    } catch (error) { console.error('Delete failed:', error); }
  };

  const handleConfirmPickup = async (claimId: number) => {
    const ok = await confirmDialog({
      title: 'Selesaikan Transaksi',
      message: 'Konfirmasi bahwa transaksi telah selesai dari sisi kamu?',
      confirmLabel: 'Ya, Selesai',
    });
    if (!ok) return;
    try {
      const res = await api.post('/claims/complete', { claim_id: claimId });
      const claimStatus = res.data?.claim?.status;
      if (claimStatus === 'completed') {
        toast.success('Transaksi selesai. Terima kasih atas kontribusinya!');
      } else {
        toast.info('Konfirmasi berhasil. Menunggu pihak lain untuk menyelesaikan transaksi.');
      }
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Gagal mengonfirmasi.');
      console.error(error);
    }
  };

  const handleAddFood = async (formData: any) => {
    try {
      await api.post('/food', formData);
      setIsAddingFood(false);
      fetchDashboardData();
    } catch (error) { console.error('Add food failed:', error); }
  };

  if (!user) return <AuthPage type="login" />;

  const activeFoods = foods.filter(f => f.status !== 'completed');
  const historyFoods = foods.filter(f => f.status === 'completed');
  const activeMyClaims = myClaims.filter(c => c.status !== 'completed');
  const historyMyClaims = myClaims.filter(c => c.status === 'completed');
  const activeIncomingClaims = incomingClaims.filter(c => c.status !== 'completed');

  const remainingOf = (food: any): number => {
    if (!food) return 0;
    if (typeof food.remaining_portions === 'number') return food.remaining_portions;
    return Math.max(0, Number(food.portions || 0) - Number(food.claimed_portions || 0));
  };

  return (
    <div className="pt-28 md:pt-32 pb-12 md:pb-20 px-4 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-4 gap-6 lg:gap-12">
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm border border-slate-50">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-emerald-500 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-white text-2xl md:text-4xl font-black mb-5 md:mb-8 shadow-2xl shadow-emerald-500/20">{user.name?.[0] || 'U'}</div>
            <h2 className="text-2xl font-black text-slate-900">{user.name}</h2>
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3 bg-emerald-50 px-3 py-1 rounded-full inline-block">{user.role}</p>
          </div>
          <nav className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-50 space-y-2">
            {isDonor && <button onClick={() => setActiveTab('listings')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black text-sm transition-all ${activeTab === 'listings' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}><Heart className="w-5 h-5" /> Kelola Donasi</button>}
            <button onClick={() => setActiveTab('claims')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black text-sm transition-all ${activeTab === 'claims' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}><MapPin className="w-5 h-5" /> Klaim Aktif</button>
            <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black text-sm transition-all ${activeTab === 'history' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}><Clock className="w-5 h-5" /> Riwayat</button>
            {isDonor && <button onClick={() => setActiveTab('impact')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black text-sm transition-all ${activeTab === 'impact' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}><TrendingUp className="w-5 h-5" /> Dampak</button>}
          </nav>
          {isDonor && <button onClick={() => setIsAddingFood(true)} className="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"><PlusCircle className="w-6 h-6 text-emerald-400" /> Donasi Makanan</button>}
        </div>
        <div className="lg:col-span-3">
          {/* Wrapper layout seragam untuk semua tab */}
          {(() => {
            const header = {
              listings: { eyebrow: 'Donor', title: 'Kelola Donasi', subtitle: 'Pantau donasi makanan kamu dan siapa saja yang mengklaim.' },
              claims: { eyebrow: 'Penerima', title: 'Klaim Aktif', subtitle: 'Koordinasikan penjemputan dan tandai sebagai selesai.' },
              history: { eyebrow: 'Arsip', title: 'Riwayat', subtitle: 'Transaksi yang sudah diselesaikan kedua pihak.' },
              impact: { eyebrow: 'Dampak', title: 'Jejak Kebaikan', subtitle: 'Ringkasan kontribusi kamu untuk komunitas.' },
            } as const;
            const h = header[activeTab];
            if (activeTab === 'impact' && !isDonor) return null;
            if (activeTab === 'listings' && !isDonor) return null;
            return (
              <section className="space-y-6">
                <header>
                  <span className="inline-block text-emerald-500 font-black uppercase tracking-widest text-[10px] bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                    {h.eyebrow}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-4">{h.title}</h3>
                  <p className="text-slate-500 font-medium italic text-sm mt-2">{h.subtitle}</p>
                </header>
                <div className="space-y-4">
                  {/* Konten tab */}
                  {activeTab === 'listings' && isDonor && (
                    loading ? (
                      <div className="h-40 bg-slate-100 animate-pulse rounded-[2rem]" />
                    ) : activeFoods.length > 0 ? (
                      activeFoods.map((food) => {
                        const remaining = remainingOf(food);
                        const total = food.portions || 0;
                        const claimsForFood = activeIncomingClaims.filter(c => c.food_id === food.id);
                        return (
                          <div key={food.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                              <div className="flex items-start gap-4 md:gap-6 min-w-0">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                                  <img src={food.image} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${remaining === 0 ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                      {remaining === 0 ? 'Porsi Habis' : 'Tersedia'}
                                    </span>
                                    <span className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-50 text-slate-500 uppercase">
                                      Sisa {remaining}/{total}
                                    </span>
                                  </div>
                                  <h4 className="text-lg md:text-xl font-black text-slate-900 mt-2 truncate">{food.name}</h4>
                                  <p className="text-xs text-slate-400 truncate">{food.pickup_address}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <button onClick={() => handleDelete(food.id)} className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:bg-red-50 hover:text-red-500">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {claimsForFood.length > 0 && (
                              <div className="mt-6 pt-6 border-t border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Penerima ({claimsForFood.length})</p>
                                <div className="space-y-3">
                                  {claimsForFood.map(claim => {
                                    const donorConfirmed = !!claim.donor_completed_at;
                                    const receiverConfirmed = !!claim.receiver_completed_at;
                                    return (
                                      <div key={claim.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60 rounded-2xl px-4 py-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center font-bold text-slate-600 text-sm border border-slate-100 shrink-0">
                                            {claim.receiver?.name?.[0] || 'P'}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-sm font-black text-slate-900 truncate">{claim.receiver?.name || 'Penerima'}</p>
                                            <p className="text-xs text-slate-400">{claim.portions} porsi</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${donorConfirmed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                Donor {donorConfirmed ? 'OK' : 'menunggu'}
                                              </span>
                                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${receiverConfirmed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                Penerima {receiverConfirmed ? 'OK' : 'menunggu'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                          <button
                                            onClick={() => setChatCtx({
                                              claimId: claim.id,
                                              foodName: food.name,
                                              counterpartName: claim.receiver?.name || 'Penerima',
                                              portions: claim.portions,
                                            })}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 text-xs"
                                          >
                                            <MessageCircle className="w-4 h-4" /> Chat
                                          </button>
                                          <button
                                            onClick={() => handleConfirmPickup(claim.id)}
                                            disabled={donorConfirmed}
                                            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-xl text-xs ${
                                              donorConfirmed
                                                ? 'bg-emerald-50 text-emerald-600 cursor-default'
                                                : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                            }`}
                                          >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {donorConfirmed ? 'Sudah Konfirmasi' : 'Selesai'}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-slate-100">
                        <Heart className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold text-sm">Belum ada donasi aktif.</p>
                      </div>
                    )
                  )}

                  {activeTab === 'claims' && (
                    loading ? (
                      <div className="h-40 bg-slate-100 animate-pulse rounded-[2rem]" />
                    ) : activeMyClaims.length > 0 ? (
                      activeMyClaims.map((claim) => {
                        const food = claim.food || {};
                        const donorName = food.donor_name || 'Donatur';
                        const donorConfirmed = !!claim.donor_completed_at;
                        const receiverConfirmed = !!claim.receiver_completed_at;
                        const statusLabel = receiverConfirmed && !donorConfirmed
                          ? 'Menunggu Donor'
                          : !receiverConfirmed && donorConfirmed
                            ? 'Donor Konfirmasi, Giliranmu'
                            : 'Diklaim';
                        return (
                          <div key={claim.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4 md:gap-6 min-w-0">
                              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                                <img src={food.image} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase bg-amber-50 text-amber-500">
                                  {statusLabel}
                                </span>
                                <h4 className="text-lg md:text-xl font-black text-slate-900 mt-2 truncate">{food.name}</h4>
                                <p className="text-xs text-slate-400 truncate">{claim.portions} Porsi &bull; {food.pickup_address}</p>
                                <p className="text-[10px] text-slate-400 mt-1">Dari: {donorName}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${donorConfirmed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    Donor {donorConfirmed ? 'OK' : 'menunggu'}
                                  </span>
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${receiverConfirmed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    Penerima {receiverConfirmed ? 'OK' : 'menunggu'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => setChatCtx({
                                  claimId: claim.id,
                                  foodName: food.name,
                                  counterpartName: donorName,
                                  portions: claim.portions,
                                })}
                                className="px-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 flex items-center gap-2 text-xs"
                              >
                                <MessageCircle className="w-4 h-4" /> Chat
                              </button>
                              <button
                                onClick={() => handleConfirmPickup(claim.id)}
                                disabled={receiverConfirmed}
                                className={`px-4 py-2.5 font-bold rounded-xl flex items-center gap-2 text-xs ${
                                  receiverConfirmed
                                    ? 'bg-emerald-50 text-emerald-600 cursor-default'
                                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                {receiverConfirmed ? 'Sudah Konfirmasi' : 'Selesai'}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-slate-100">
                        <MapPin className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold text-sm">Belum ada klaim aktif.</p>
                      </div>
                    )
                  )}

                  {activeTab === 'history' && (
                    loading ? (
                      <div className="h-40 bg-slate-100 animate-pulse rounded-[2rem]" />
                    ) : (historyFoods.length > 0 || historyMyClaims.length > 0) ? (
                      <>
                        {isDonor && historyFoods.map(food => (
                          <div key={`food-${food.id}`} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4 md:gap-6 min-w-0">
                              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                                {food.image ? <img src={food.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-slate-300" /></div>}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase bg-emerald-50 text-emerald-600">Donasi Selesai</span>
                                <h4 className="text-lg md:text-xl font-black text-slate-900 mt-2 truncate">{food.name}</h4>
                                <p className="text-xs text-slate-400 truncate">{food.portions} Porsi tersalurkan &bull; {food.pickup_address}</p>
                              </div>
                            </div>
                            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                          </div>
                        ))}
                        {historyMyClaims.map(claim => (
                          <div key={`claim-${claim.id}`} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4 md:gap-6 min-w-0">
                              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                                {claim.food?.image ? <img src={claim.food.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-slate-300" /></div>}
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase bg-emerald-50 text-emerald-600">Klaim Selesai</span>
                                <h4 className="text-lg md:text-xl font-black text-slate-900 mt-2 truncate">{claim.food?.name || 'Makanan'}</h4>
                                <p className="text-xs text-slate-400 truncate">{claim.portions} Porsi diterima</p>
                              </div>
                            </div>
                            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-slate-100">
                        <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold text-sm">Belum ada riwayat.</p>
                      </div>
                    )
                  )}

                  {activeTab === 'impact' && isDonor && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                            <Leaf className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Makanan Terselamatkan</span>
                        </div>
                        <div className="text-5xl md:text-6xl font-black text-slate-900">
                          {Number(stats.foodSaved).toFixed(1)}
                          <span className="text-xl md:text-2xl ml-2 text-emerald-500">kg</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-3 leading-relaxed">
                          Berat total makanan yang tersalurkan lewat donasi kamu.
                        </p>
                      </div>
                      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                            <HandHeart className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Porsi Tersalurkan</span>
                        </div>
                        <div className="text-5xl md:text-6xl font-black text-slate-900">
                          {stats.peopleHelped}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-3 leading-relaxed">
                          Total porsi yang berhasil sampai ke penerima.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}
        </div>
      </div>
      <AnimatePresence>
        {isAddingFood && (
          <AddFoodModal onClose={() => setIsAddingFood(false)} onAdd={handleAddFood} />
        )}
        {chatCtx && user && (
          <ChatModal user={user} context={chatCtx} onClose={() => setChatCtx(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Donate Page (khusus donor/admin) ---
interface FoodFormData {
  name: string;
  portions: number;
  pickup_address: string;
  description: string;
  expired_at: string; // datetime-local value: YYYY-MM-DDTHH:mm
  weight_kg: number;
  category: string;
  image_file: File | null;
  current_image?: string | null;
}

const toDatetimeLocal = (value: string | null | undefined): string => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatExpiredLabel = (food: any): string => {
  if (food?.expired_at) {
    const d = new Date(food.expired_at);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }
  return food?.expired_date || '-';
};

const FOOD_CATEGORIES = ['Makanan Matang', 'Bahan Baku', 'Roti & Kue', 'Buah & Sayur', 'Lainnya'];

const buildFoodFormData = (data: FoodFormData): FormData => {
  const fd = new FormData();
  fd.append('name', data.name);
  fd.append('portions', String(data.portions));
  fd.append('weight_kg', String(data.weight_kg));
  fd.append('pickup_address', data.pickup_address);
  fd.append('description', data.description);
  fd.append('category', data.category);
  if (data.expired_at) {
    const iso = new Date(data.expired_at).toISOString();
    fd.append('expired_at', iso);
    fd.append('expired_date', data.expired_at.replace('T', ' '));
  }
  if (data.image_file) fd.append('image_file', data.image_file);
  return fd;
};

const FoodForm = ({
  initialData,
  submitLabel,
  submitting,
  onCancel,
  onSubmit,
  isEdit,
}: {
  initialData: FoodFormData;
  submitLabel: string;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (data: FoodFormData) => void;
  isEdit?: boolean;
}) => {
  const [formData, setFormData] = useState<FoodFormData>(initialData);
  const [preview, setPreview] = useState<string | null>(initialData.current_image || null);
  const toast = useToast();

  useEffect(() => {
    setFormData(initialData);
    setPreview(initialData.current_image || null);
  }, [initialData]);

  const minDatetime = (() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  })();

  const handleFile = (file: File | null) => {
    if (!file) {
      setFormData({ ...formData, image_file: null });
      setPreview(initialData.current_image || null);
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 4 MB.');
      return;
    }
    setFormData({ ...formData, image_file: file });
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.expired_at) {
      toast.error('Isi tanggal dan jam kadaluarsa.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nama Makanan</label>
        <input
          type="text"
          required
          placeholder="Contoh: Nasi Kotak Ayam Bakar"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-lg text-slate-900"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Jumlah Porsi</label>
          <input
            type="number"
            min={1}
            required
            value={formData.portions}
            onChange={(e) => setFormData({ ...formData, portions: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-lg text-slate-900"
          />
          <p className="text-xs text-slate-400 mt-2">Penerima bisa klaim sebagian porsi.</p>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Berat (kg)</label>
          <input
            type="number"
            step={0.1}
            min={0}
            value={formData.weight_kg}
            onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) || 0 })}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-lg text-slate-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Kategori</label>
        <div className="flex flex-wrap gap-2">
          {FOOD_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFormData({ ...formData, category: c })}
              className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                formData.category === c
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-300 hover:text-emerald-600'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Lokasi Penjemputan</label>
        <textarea
          required
          placeholder="Alamat lengkap untuk penjemputan..."
          value={formData.pickup_address}
          onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-900"
        />
      </div>

      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Keterangan</label>
        <textarea
          placeholder="Catatan, kondisi makanan, instruksi penjemputan..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-900"
        />
      </div>

      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
          Kapan Makanan Tidak Layak Lagi / Basi (Tanggal + Jam)
        </label>
        <input
          type="datetime-local"
          required
          min={minDatetime}
          value={formData.expired_at}
          onChange={(e) => setFormData({ ...formData, expired_at: e.target.value })}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-900"
        />
        <p className="text-xs text-slate-400 mt-2">Estimasi waktu makanan masih aman dikonsumsi.</p>
      </div>

      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Foto Makanan</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center">
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <Utensils className="w-8 h-8 text-slate-300" />
            )}
          </div>
          <div className="flex-1">
            <label className="block">
              <span className="sr-only">Pilih foto</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100 cursor-pointer"
              />
            </label>
            <p className="text-xs text-slate-400 mt-2">
              {isEdit ? 'Kosongkan untuk mempertahankan foto lama.' : 'Opsional, maks 4 MB.'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-4 bg-slate-50 text-slate-600 font-black rounded-2xl hover:bg-slate-100 uppercase text-xs tracking-widest"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 disabled:opacity-60 uppercase text-xs tracking-widest"
        >
          {submitting ? 'Menyimpan...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

const DonatePage = ({ user }: { user: User | null }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const confirmDialog = useConfirm();
  const [myFoods, setMyFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState<any>(null);

  const emptyForm: FoodFormData = {
    name: '',
    portions: 1,
    pickup_address: '',
    description: '',
    expired_at: '',
    weight_kg: 0.5,
    category: 'Makanan Matang',
    image_file: null,
    current_image: null,
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'donor' && user.role !== 'admin') {
      navigate('/explore');
      return;
    }
    fetchMyFoods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMyFoods = async () => {
    setLoading(true);
    try {
      const res = await api.get('/food');
      setMyFoods(res.data.filter((f: any) => f.donor_id === user?.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: FoodFormData) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.post('/food', buildFoodFormData(data), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Donasi berhasil ditambahkan.');
      setShowForm(false);
      fetchMyFoods();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Gagal menambahkan donasi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data: FoodFormData) => {
    if (!editingFood || submitting) return;
    setSubmitting(true);
    try {
      const fd = buildFoodFormData(data);
      fd.append('_method', 'PUT'); // Laravel method spoofing karena multipart
      await api.post(`/food/${editingFood.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Donasi berhasil diperbarui.');
      setEditingFood(null);
      fetchMyFoods();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Gagal memperbarui donasi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirmDialog({
      title: 'Hapus Donasi',
      message: 'Donasi ini akan dihapus permanen dari daftar. Lanjutkan?',
      confirmLabel: 'Ya, Hapus',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/food/${id}`);
      toast.success('Donasi dihapus.');
      fetchMyFoods();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal menghapus donasi.');
    }
  };

  if (!user) return <AuthPage type="login" />;
  if (user.role !== 'donor' && user.role !== 'admin') return null;

  const editInitial: FoodFormData | null = editingFood
    ? {
        name: editingFood.name || '',
        portions: Number(editingFood.portions || 1),
        pickup_address: editingFood.pickup_address || '',
        description: editingFood.description || '',
        expired_at: toDatetimeLocal(editingFood.expired_at || editingFood.expired_date),
        weight_kg: Number(editingFood.weight_kg || 0),
        category: editingFood.category || 'Makanan Matang',
        image_file: null,
        current_image: editingFood.image || null,
      }
    : null;

  return (
    <div className="pt-28 md:pt-32 pb-12 md:pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-emerald-500 font-black uppercase tracking-widest text-[10px] bg-emerald-50 px-4 py-2 rounded-full">Mode Pendonor</span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-4">Donor Makanan</h1>
            <p className="text-slate-500 font-medium italic text-sm mt-2">Bagikan makanan berlebihmu ke sesama. Setiap porsi berarti.</p>
          </div>
          <button
            onClick={() => {
              setEditingFood(null);
              setShowForm((v) => !v);
            }}
            className="px-6 py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all flex items-center gap-2 uppercase text-xs tracking-widest"
          >
            <PlusCircle className="w-5 h-5" /> {showForm ? 'Tutup Form' : 'Tambah Donasi'}
          </button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-10 mb-12"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-6">Form Donasi Makanan</h2>
            <FoodForm
              initialData={emptyForm}
              submitLabel="Donasikan Sekarang"
              submitting={submitting}
              onCancel={() => setShowForm(false)}
              onSubmit={handleCreate}
            />
          </motion.div>
        )}

        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Donasi Saya</h2>
          {loading ? (
            <div className="h-40 bg-slate-100 animate-pulse rounded-3xl" />
          ) : myFoods.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-100">
              <Utensils className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold text-sm">Belum ada donasi. Mulai dari tombol di atas.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {myFoods.map((food) => {
                const total = Number(food.portions || 0);
                const claimed = Number(food.claimed_portions || 0);
                const remaining =
                  typeof food.remaining_portions === 'number'
                    ? food.remaining_portions
                    : Math.max(0, total - claimed);
                const statusLabel =
                  food.status === 'completed'
                    ? 'Selesai'
                    : remaining === 0
                      ? 'Porsi Habis'
                      : claimed > 0
                        ? 'Tersisa Sebagian'
                        : 'Tersedia';
                const statusClass =
                  food.status === 'completed'
                    ? 'bg-slate-100 text-slate-500'
                    : remaining === 0
                      ? 'bg-amber-50 text-amber-600'
                      : claimed > 0
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-emerald-50 text-emerald-600';
                const canEdit = food.status !== 'completed';
                return (
                  <div key={food.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    {food.image && (
                      <div className="h-40 bg-slate-100">
                        <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${statusClass}`}>{statusLabel}</span>
                          <h3 className="text-lg font-black text-slate-900 mt-3 truncate">{food.name}</h3>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {canEdit && (
                            <button
                              onClick={() => {
                                setShowForm(false);
                                setEditingFood(food);
                              }}
                              className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600"
                              aria-label="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(food.id)}
                            className="p-2 bg-slate-50 text-slate-300 rounded-xl hover:bg-red-50 hover:text-red-500"
                            aria-label="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total</p>
                          <p className="text-lg font-black text-slate-900">{total}</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-3 text-center">
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">Diklaim</p>
                          <p className="text-lg font-black text-amber-600">{claimed}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-3 text-center">
                          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Sisa</p>
                          <p className="text-lg font-black text-emerald-600">{remaining}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 mt-4 text-xs text-slate-500">
                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{food.pickup_address}</span>
                      </div>
                      {food.description && (
                        <div className="flex items-start gap-2 mt-2 text-xs text-slate-500">
                          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{food.description}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Basi pada: <strong className="text-slate-700">{formatExpiredLabel(food)}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingFood && editInitial && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingFood(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900">Edit Donasi</h2>
                <button
                  onClick={() => setEditingFood(null)}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FoodForm
                initialData={editInitial}
                submitLabel="Simpan Perubahan"
                submitting={submitting}
                isEdit
                onCancel={() => setEditingFood(null)}
                onSubmit={handleUpdate}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
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
            <input type="text" required placeholder="Contoh: 5 Box Nasi Ayam Bakar" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-lg" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Jumlah Porsi</label>
              <input type="number" min="1" value={formData.portions} onChange={e => setFormData({...formData, portions: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Berat (kg)</label>
              <input type="number" step="0.1" value={formData.weight_kg} onChange={e => setFormData({...formData, weight_kg: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button key={c} type="button" onClick={() => setFormData({...formData, category: c})} className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${formData.category === c ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-500'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Alamat Penjemputan</label>
            <textarea required placeholder="Alamat lengkap..." value={formData.pickup_address} onChange={e => setFormData({...formData, pickup_address: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 h-28 resize-none font-medium" />
          </div>
          <div className="grid md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Batas Konsumsi</label>
              <input type="date" required value={formData.expired_date} onChange={e => setFormData({...formData, expired_date: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold" />
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
  const toast = useToast();
  const [formData, setFormData] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState<'donor' | 'receiver' | null>(null);

  if (!user) return <AuthPage type="login" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', formData);
      onUpdate(res.data);
      toast.success('Profil berhasil diperbarui.');
    } catch (error) { console.error(error); toast.error('Gagal memperbarui profil.'); }
    finally { setLoading(false); }
  };

  const handleRoleChange = async (newRole: 'donor' | 'receiver') => {
    if (user.role === newRole) return;
    // Admin tidak bisa jadi donor/receiver biasa
    if (user.role === 'admin') {
      toast.info('Peran Admin tidak bisa diubah dari halaman ini.');
      return;
    }
    setRoleLoading(newRole);
    try {
      const updated = await authService.updateRole(newRole);
      onUpdate(updated);
      toast.success(`Peran kamu sekarang: ${newRole === 'donor' ? 'Pendonor' : 'Penerima'}.`);
    } catch (error) {
      console.error('Gagal mengubah peran:', error);
      toast.error('Gagal mengubah peran. Coba lagi.');
    } finally {
      setRoleLoading(null);
    }
  };

  const canSwitchRole = user.role === 'donor' || user.role === 'receiver';

  return (
    <div className="pt-28 md:pt-32 pb-12 md:pb-20 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">Profil Saya</h1>
          <p className="text-slate-400 font-medium italic text-sm">Kelola data diri dan peran kamu di komunitas WiBite.</p>
        </div>

        {/* Role Switcher */}
        {canSwitchRole && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <HandHeart className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">Peran Saya</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Pilih kamu ingin berkontribusi sebagai penerima atau pendonor makanan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Penerima */}
              <button
                type="button"
                onClick={() => handleRoleChange('receiver')}
                disabled={roleLoading !== null}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  user.role === 'receiver'
                    ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/10'
                    : 'border-slate-100 bg-white hover:border-amber-300 hover:bg-amber-50/30'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    user.role === 'receiver' ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  <Utensils className="w-5 h-5" />
                </div>
                <p className={`text-sm font-black uppercase tracking-wider ${user.role === 'receiver' ? 'text-amber-700' : 'text-slate-900'}`}>
                  Penerima
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                  Klaim makanan dari donatur
                </p>
                {user.role === 'receiver' && (
                  <span className="absolute top-3 right-3 text-[9px] font-black text-amber-600 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-amber-200">
                    Aktif
                  </span>
                )}
                {roleLoading === 'receiver' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-2xl">
                    <Clock className="w-5 h-5 animate-spin text-amber-500" />
                  </div>
                )}
              </button>

              {/* Pendonor */}
              <button
                type="button"
                onClick={() => handleRoleChange('donor')}
                disabled={roleLoading !== null}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  user.role === 'donor'
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    user.role === 'donor' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  <HandHeart className="w-5 h-5" />
                </div>
                <p className={`text-sm font-black uppercase tracking-wider ${user.role === 'donor' ? 'text-emerald-700' : 'text-slate-900'}`}>
                  Pendonor
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                  Bagikan makanan berlebih
                </p>
                {user.role === 'donor' && (
                  <span className="absolute top-3 right-3 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    Aktif
                  </span>
                )}
                {roleLoading === 'donor' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-2xl">
                    <Clock className="w-5 h-5 animate-spin text-emerald-500" />
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Form Data Diri */}
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nama</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Telepon</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Alamat</label>
            <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold h-32 resize-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50">{loading ? 'Menyimpan...' : 'Simpan'}</button>
        </form>
      </div>
    </div>
  );
};

// --- Admin Dashboard ---
const AdminDashboard = ({ user }: { user: User | null }) => {
  const toast = useToast();
  const confirmDialog = useConfirm();
  const [foods, setFoods] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    const fetchData = async () => {
      try {
        const [fRes, uRes] = await Promise.all([api.get('/food'), api.get('/admin/users')]);
        setFoods(fRes.data);
        setUsers(uRes.data);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  if (user?.role !== 'admin') return <div className="pt-32 text-center font-black">Akses Ditolak</div>;

  const handleDeleteFood = async (id: number) => {
    const ok = await confirmDialog({
      title: 'Hapus Makanan',
      message: 'Data makanan akan dihapus permanen. Lanjutkan?',
      confirmLabel: 'Ya, Hapus',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/food/${id}`);
      setFoods(foods.filter(f => f.id !== id));
      toast.success('Makanan dihapus.');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal menghapus makanan.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    const ok = await confirmDialog({
      title: 'Hapus User',
      message: 'User beserta aktivitasnya akan dihapus. Aksi ini tidak bisa dibatalkan.',
      confirmLabel: 'Ya, Hapus',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      toast.success('User dihapus.');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Gagal menghapus user.');
    }
  };

  return (
    <div className="pt-28 md:pt-32 pb-12 md:pb-20 px-4 max-w-7xl mx-auto">
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

  const handleLogout = async () => {
    await authService.logout();
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

  return (
    <Router>
      <ToastProvider>
      <ConfirmProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-500/20 selection:text-emerald-500">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<ExplorePage user={user} />} />
            <Route path="/donate" element={<DonatePage user={user} />} />
            <Route path="/forum" element={<ForumPage user={user} />} />
            <Route path="/guidelines" element={<GuidelinePage />} />
            <Route path="/dashboard" element={<DashboardPage user={user} />} />
            <Route path="/profile" element={<ProfilePage user={user} onUpdate={setUser} />} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
            <Route path="/login" element={<AuthPage type="login" />} />
            <Route path="/register" element={<AuthPage type="register" />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
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
            <div>
              <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-5">Tautan Cepat</h4>
              <ul className="space-y-3">
                <li><Link to="/explore" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors">Cari Makanan</Link></li>
                <li><Link to="/forum" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors">Forum Komunitas</Link></li>
                <li><Link to="/guidelines" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors">Pedoman Donasi</Link></li>
                <li><Link to="/register" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors">Daftar Gratis</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-5">Informasi</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors inline-flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" /> Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors inline-flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" /> Kebijakan Privasi
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors inline-flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Syarat & Ketentuan
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors inline-flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> Kontak
                  </Link>
                </li>
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
      </ConfirmProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
