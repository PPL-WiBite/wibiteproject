import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, BookOpen, ChevronDown, Heart, Leaf, Users, TrendingUp, Mail, Phone, Instagram, Facebook, Send, HelpCircle, Check
} from 'lucide-react';
import api from '@/lib/api';

export default function HelpInfo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', subject: 'Masalah Teknis', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const steps = {
    donor: [
      {
        num: '01',
        title: 'Foto & Deskripsi',
        desc: 'Unggah foto makanan berlebih Anda dan tambahkan detail seperti jenis dan batas waktu konsumsi.',
      },
      {
        num: '02',
        title: 'Set Lokasi Penjemputan',
        desc: 'Pilih lokasi aman bagi penerima untuk mengambil donasi Anda.',
      },
      {
        num: '03',
        title: 'Konfirmasi & Pantau Dampak',
        desc: 'Terima notifikasi saat makanan diambil dan lihat statistik CO2 yang Anda hemat.',
      },
    ],
    receiver: [
      {
        num: '01',
        title: 'Jelajahi Peta',
        desc: 'Lihat daftar makanan tersedia di sekitar lokasi Anda melalui tampilan peta interaktif.',
      },
      {
        num: '02',
        title: 'Klaim Makanan',
        desc: 'Pilih item yang Anda butuhkan dan kirim permintaan klaim secara instan.',
      },
      {
        num: '03',
        title: 'Ambil & Beri Ulasan',
        desc: 'Datangi lokasi sesuai kesepakatan dan jangan lupa berikan apresiasi kepada pendonor.',
      },
    ],
  };

  const faqs = [
    {
      q: 'Bagaimana cara melakukan donasi makanan?',
      a: 'Anda hanya perlu masuk sebagai pendonor, menekan tombol "Donasi Sekarang" di dashboard, lalu mengisi detail makanan, mengunggah foto, menentukan lokasi penjemputan, serta batas waktu konsumsi layak makan.',
    },
    {
      q: 'Bagaimana WiBite memastikan makanan aman?',
      a: 'Kami mewajibkan donatur untuk mendonasikan makanan layak konsumsi (belum basi/kadaluarsa). Tim kami juga menghimbau agar makanan dikemas dengan wadah higienis dan bersih sebelum diserahterimakan.',
    },
    {
      q: 'Bagaimana cara mengubah profil dan peran saya?',
      a: 'Anda bisa masuk ke halaman "Pengaturan" (Profile), kemudian mengganti informasi umum atau mengganti peran aktif Anda (Pendonor/Penerima) melalui switcher peran yang tersedia.',
    },
    {
      q: 'Apakah layanan WiBite ini berbayar?',
      a: 'Tidak, seluruh platform WiBite 100% gratis untuk donasi maupun klaim makanan. Ini merupakan inisiatif nirlaba demi mendukung SDG 12 di Indonesia.',
    },
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate/call support endpoint or mock it
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFormSubmitted(true);
      setContactForm({ name: '', subject: 'Masalah Teknis', message: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-28 pb-20 bg-slate-50 min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 text-center mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Pusat Bantuan & Informasi
          </h1>
          <p className="text-slate-500 text-sm md:text-base font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
            Temukan jawaban atas pertanyaan Anda dan pelajari cara berkontribusi dalam gerakan pencegahan sampah makanan.
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari topik bantuan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-800 shadow-sm"
            />
          </div>
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-24">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Panduan Pengguna
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-3">
            Bagaimana Cara Kerja WiBite?
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Untuk Pendonor */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 fill-emerald-100" />
              </div>
              <h3 className="text-lg font-black text-slate-800">Untuk Pendonor</h3>
            </div>
            <div className="space-y-6">
              {steps.donor.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-2xl font-black text-emerald-100">{step.num}</span>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{step.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Untuk Penerima */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-800">Untuk Penerima</h3>
            </div>
            <div className="space-y-6">
              {steps.receiver.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-2xl font-black text-emerald-100">{step.num}</span>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{step.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQs ===== */}
      <section className="max-w-3xl mx-auto px-6 lg:px-10 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">Pertanyaan Populer</h2>
          <p className="text-slate-400 font-medium text-xs mt-1">Punya pertanyaan? Mungkin sudah kami jawab di sini.</p>
        </div>

        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-xs font-black text-slate-800 leading-snug">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-5 text-xs text-slate-500 font-medium leading-relaxed border-t border-slate-50 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <div className="text-center p-8 bg-white rounded-2xl border border-slate-100 text-slate-400 font-bold text-xs">
              Tidak ada hasil FAQ ditemukan.
            </div>
          )}
        </div>
      </section>

      {/* ===== SDG 12 INFO ===== */}
      <section className="bg-emerald-900 text-white py-16 mb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black mb-4 leading-tight">Kontribusi Kami untuk SDG 12</h2>
            <p className="text-emerald-100 text-xs md:text-sm font-medium leading-relaxed mb-8 max-w-md">
              WiBite berkomitmen pada tujuan pembangunan berkelanjutan PBB, khususnya Konsumsi dan Produksi yang Bertanggung Jawab. Bersama Anda, kita mengurangi emisi karbon dari sampah organik.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-emerald-850 px-4 py-2.5 rounded-xl border border-emerald-800">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider">Lingkungan</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-850 px-4 py-2.5 rounded-xl border border-emerald-800">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider">Sosial</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-850 px-4 py-2.5 rounded-xl border border-emerald-800">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider">Ekonomi</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&q=80"
                alt="Greenhouse gardening and organic planting"
                className="w-full h-[280px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 to-transparent"></div>
            </div>
            {/* Impact Pill */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white text-slate-800 py-3 px-6 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100 z-10 whitespace-nowrap">
              <span className="text-xl font-black text-emerald-600">50k+</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Porsi makanan telah terselamatkan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SUPPORT CONTACT FORM ===== */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-12 items-start">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">Masih butuh bantuan?</h2>
            <p className="text-slate-400 font-medium text-xs mt-1">
              Tim dukungan kami siap membantu Anda 24/7 untuk memastikan pengalaman berbagi Anda berjalan lancar.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-xs font-bold text-slate-700">support@wibite.id</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">WhatsApp</p>
                <p className="text-xs font-bold text-slate-700">+62 812-3456-7890</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <a href="#" className="w-10 h-10 bg-white hover:bg-emerald-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors shadow-sm">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 bg-white hover:bg-emerald-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors shadow-sm">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Right Column Form */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
          {formSubmitted ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">Pesan Terkirim!</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Terima kasih atas tanggapan Anda. Kami akan segera menghubungi Anda kembali.</p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="mt-6 px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all"
              >
                Kirim Pesan Lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-5">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Contoh: Kania"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Subjek</label>
                <select
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                >
                  <option>Masalah Teknis</option>
                  <option>Kemitraan</option>
                  <option>Pertanyaan Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Pesan</label>
                <textarea
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Tulis pesan atau pertanyaan Anda di sini..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 font-semibold text-xs text-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> {loading ? 'Mengirim...' : 'Kirim Pesan'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}