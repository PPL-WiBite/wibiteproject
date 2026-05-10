import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  Clock,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Filter,
  Sparkles,
  Heart,
  Lightbulb,
  Megaphone,
  Users,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '@/lib/api';
import type { User } from '@/lib/auth';
import { useToast } from './Toast';

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author_name: string;
  category: string;
  created_at: string;
}

interface ForumComment {
  id: number;
  post_id: number;
  content: string;
  author_id: number;
  author_name: string;
  created_at: string;
}

type CategoryKey = 'Diskusi Umum' | 'Tips & Trik' | 'Cerita Donor' | 'Laporan Hub';

const CATEGORIES: {
  key: CategoryKey;
  label: string;
  description: string;
  icon: typeof Sparkles;
  accent: string; // tailwind color name (emerald/amber/rose/indigo)
}[] = [
  {
    key: 'Diskusi Umum',
    label: 'Diskusi Umum',
    description: 'Obrolan bebas seputar food waste dan komunitas.',
    icon: Users,
    accent: 'emerald',
  },
  {
    key: 'Tips & Trik',
    label: 'Tips & Trik',
    description: 'Kiat menyimpan, mengolah, dan memanfaatkan makanan.',
    icon: Lightbulb,
    accent: 'amber',
  },
  {
    key: 'Cerita Donor',
    label: 'Cerita Donor',
    description: 'Kisah inspiratif dari pendonor dan penerima.',
    icon: Heart,
    accent: 'rose',
  },
  {
    key: 'Laporan Hub',
    label: 'Laporan Hub',
    description: 'Laporan kegiatan hub/komunitas setempat.',
    icon: Megaphone,
    accent: 'indigo',
  },
];

const accentClasses = (accent: string, active = false) => {
  const map: Record<string, { chipActive: string; chipIdle: string; badge: string; tint: string }> = {
    emerald: {
      chipActive: 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20',
      chipIdle: 'bg-white text-slate-600 border-slate-100 hover:border-emerald-300 hover:text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      tint: 'bg-emerald-50 text-emerald-500',
    },
    amber: {
      chipActive: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20',
      chipIdle: 'bg-white text-slate-600 border-slate-100 hover:border-amber-300 hover:text-amber-600',
      badge: 'bg-amber-50 text-amber-600 border-amber-100',
      tint: 'bg-amber-50 text-amber-500',
    },
    rose: {
      chipActive: 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20',
      chipIdle: 'bg-white text-slate-600 border-slate-100 hover:border-rose-300 hover:text-rose-600',
      badge: 'bg-rose-50 text-rose-600 border-rose-100',
      tint: 'bg-rose-50 text-rose-500',
    },
    indigo: {
      chipActive: 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20',
      chipIdle: 'bg-white text-slate-600 border-slate-100 hover:border-indigo-300 hover:text-indigo-600',
      badge: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      tint: 'bg-indigo-50 text-indigo-500',
    },
    slate: {
      chipActive: 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10',
      chipIdle: 'bg-white text-slate-600 border-slate-100 hover:border-slate-300 hover:text-slate-900',
      badge: 'bg-slate-100 text-slate-600 border-slate-200',
      tint: 'bg-slate-100 text-slate-500',
    },
  };
  const entry = map[accent] || map.slate;
  return active ? entry.chipActive : entry.chipIdle;
};

const categoryBadgeClass = (category: string): string => {
  const cat = CATEGORIES.find((c) => c.key === category);
  const accent = cat?.accent || 'slate';
  const map: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return map[accent] || map.slate;
};

const getCategoryIcon = (category: string) => {
  const cat = CATEGORIES.find((c) => c.key === category);
  return cat?.icon || Sparkles;
};

export default function ForumPage({ user }: { user: User | null }) {
  const toast = useToast();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newPost, setNewPost] = useState<{ title: string; content: string; category: CategoryKey }>({
    title: '',
    content: '',
    category: 'Diskusi Umum',
  });
  const [newComment, setNewComment] = useState('');
  const [activeCategory, setActiveCategory] = useState<'Semua' | CategoryKey>('Semua');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/forum');
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: number) => {
    try {
      const res = await api.get(`/forum/${postId}/comments`);
      setComments(res.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (selectedPost) fetchComments(selectedPost.id);
  }, [selectedPost]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'Semua') return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  const countByCategory = useMemo(() => {
    const map: Record<string, number> = { Semua: posts.length };
    for (const c of CATEGORIES) map[c.key] = 0;
    for (const p of posts) {
      if (map[p.category] !== undefined) map[p.category]++;
    }
    return map;
  }, [posts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.info('Silakan masuk terlebih dahulu untuk membuat postingan.');
    if (!newPost.title || !newPost.content) return;

    try {
      await api.post('/forum', newPost);
      setNewPost({ title: '', content: '', category: 'Diskusi Umum' });
      setIsAddingPost(false);
      toast.success('Diskusi berhasil diterbitkan.');
      fetchPosts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal membuat postingan.');
      console.error('Error creating post:', error);
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingPost) return;

    try {
      await api.put(`/forum/${editingPost.id}`, newPost);
      setNewPost({ title: '', content: '', category: 'Diskusi Umum' });
      setEditingPost(null);
      toast.success('Diskusi diperbarui.');
      fetchPosts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal memperbarui postingan.');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!user || !window.confirm('Hapus postingan ini?')) return;
    try {
      await api.delete(`/forum/${postId}`);
      if (selectedPost?.id === postId) setSelectedPost(null);
      toast.success('Postingan dihapus.');
      fetchPosts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal menghapus postingan.');
    }
  };

  const startEditing = (post: ForumPost) => {
    setEditingPost(post);
    const cat = (CATEGORIES.find((c) => c.key === post.category)?.key || 'Diskusi Umum') as CategoryKey;
    setNewPost({ title: post.title, content: post.content, category: cat });
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.info('Silakan masuk untuk berkomentar.');
    if (!newComment || !selectedPost) return;

    try {
      await api.post(`/forum/${selectedPost.id}/comments`, { content: newComment });
      setNewComment('');
      fetchComments(selectedPost.id);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal mengirim komentar.');
    }
  };

  const openModal = (category?: CategoryKey) => {
    setNewPost({
      title: '',
      content: '',
      category: category || (activeCategory === 'Semua' ? 'Diskusi Umum' : activeCategory),
    });
    setIsAddingPost(true);
  };

  return (
    <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto relative">
      <div className="absolute inset-0 -z-10 h-[50vh] overflow-hidden left-0 right-0">
        <img
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=2070"
          className="w-full h-full object-cover opacity-5"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <span className="inline-block text-emerald-500 font-black uppercase tracking-widest text-[10px] bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 mb-4">
            Forum Komunitas
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Ruang <span className="italic text-emerald-500">Berbagi</span>
          </h1>
          <p className="text-slate-500 font-medium italic text-sm mt-2">
            Diskusi, tips, dan cerita dari komunitas penyelamat makanan.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all uppercase text-xs tracking-widest"
        >
          <PlusCircle className="w-5 h-5" /> Buat Diskusi
        </button>
      </div>

      {/* Filter kategori - chips */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 text-slate-400">
          <Filter className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Filter Kategori</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory('Semua')}
            className={`shrink-0 px-5 py-2.5 border rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${accentClasses(
              'slate',
              activeCategory === 'Semua',
            )}`}
          >
            Semua
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeCategory === 'Semua' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {countByCategory.Semua ?? 0}
            </span>
          </button>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`shrink-0 px-5 py-2.5 border rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${accentClasses(
                  cat.accent,
                  isActive,
                )}`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {countByCategory[cat.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel deskripsi kategori aktif */}
      {activeCategory !== 'Semua' && (
        <div className="mb-8">
          {(() => {
            const cat = CATEGORIES.find((c) => c.key === activeCategory);
            if (!cat) return null;
            const Icon = cat.icon;
            return (
              <div className={`p-5 rounded-[2rem] border ${categoryBadgeClass(cat.key)} flex items-center gap-4`}>
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-white">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black uppercase tracking-widest">{cat.label}</p>
                  <p className="text-xs font-medium opacity-80 mt-1">{cat.description}</p>
                </div>
                <button
                  onClick={() => openModal(cat.key)}
                  className="px-4 py-2 bg-white text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest border border-white/50 hover:bg-slate-50 flex items-center gap-2 shrink-0"
                >
                  <PlusCircle className="w-4 h-4" /> Posting
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Daftar postingan */}
      <div className="grid gap-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-100">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-sm">Belum ada diskusi di kategori ini.</p>
            <button
              onClick={() => openModal(activeCategory === 'Semua' ? 'Diskusi Umum' : (activeCategory as CategoryKey))}
              className="mt-5 inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-600"
            >
              <PlusCircle className="w-4 h-4" /> Mulai Diskusi
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const Icon = getCategoryIcon(post.category);
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all cursor-pointer group relative"
              >
                <div onClick={() => setSelectedPost(post)}>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest ${categoryBadgeClass(
                        post.category,
                      )}`}
                    >
                      <Icon className="w-3 h-3" />
                      {post.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-emerald-500 transition-colors leading-tight">
                    {post.title}
                  </h2>
                  <div className="text-slate-600 line-clamp-2 mb-6 text-sm font-medium leading-relaxed">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                  </div>
                </div>

                {user && user.id === post.author_id && (
                  <div className="absolute top-6 right-6 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(post);
                      }}
                      className="p-2 bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost(post.id);
                      }}
                      className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      aria-label="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div
                  className="flex items-center justify-between pt-6 border-t border-slate-50"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500">
                      {post.author_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{post.author_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Anggota Komunitas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-xs bg-emerald-50 px-4 py-2 rounded-xl uppercase tracking-widest">
                    <MessageSquare className="w-4 h-4" /> Diskusi
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add/Edit Post Modal */}
      <AnimatePresence>
        {(isAddingPost || editingPost) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddingPost(false);
                setEditingPost(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    {editingPost ? 'Perbarui' : 'Komunitas'}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    {editingPost ? 'Edit Diskusi' : 'Mulai Diskusi Baru'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsAddingPost(false);
                    setEditingPost(null);
                  }}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost} className="grid gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Judul Diskusi
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Apa yang ingin kamu diskusikan?"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Kategori
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const active = newPost.category === cat.key;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setNewPost({ ...newPost, category: cat.key })}
                          className={`p-4 rounded-2xl border text-left transition-all ${accentClasses(
                            cat.accent,
                            active,
                          )}`}
                        >
                          <Icon className={`w-5 h-5 mb-2 ${active ? '' : 'opacity-80'}`} />
                          <p className="text-xs font-black uppercase tracking-wider">{cat.label}</p>
                          <p className={`text-[10px] font-medium mt-1 line-clamp-2 ${active ? 'opacity-90' : 'opacity-70'}`}>
                            {cat.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Isi Postingan (Mendukung Markdown)
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Tuliskan pemikiran atau tips kamu di sini..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 h-48 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none font-medium text-slate-700"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPost(false);
                      setEditingPost(null);
                    }}
                    className="px-6 py-4 bg-slate-50 text-slate-600 font-black rounded-2xl hover:bg-slate-100 uppercase text-xs tracking-widest"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all uppercase text-xs tracking-widest"
                  >
                    {editingPost ? 'Simpan Perubahan' : 'Terbitkan Postingan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Detail & Comments */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl relative z-10 max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="p-8 md:p-10 pb-6 border-b border-slate-100 relative">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-xl text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest ${categoryBadgeClass(
                      selectedPost.category,
                    )}`}
                  >
                    {(() => {
                      const Icon = getCategoryIcon(selectedPost.category);
                      return <Icon className="w-3 h-3" />;
                    })()}
                    {selectedPost.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    {new Date(selectedPost.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 leading-tight mb-4">{selectedPost.title}</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500">
                      {selectedPost.author_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{selectedPost.author_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pembuat Diskusi</p>
                    </div>
                  </div>
                  {user && user.id === selectedPost.author_id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          startEditing(selectedPost);
                          setSelectedPost(null);
                        }}
                        className="flex items-center gap-2 text-xs font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 uppercase tracking-widest"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeletePost(selectedPost.id)}
                        className="flex items-center gap-2 text-xs font-black text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-100 uppercase tracking-widest"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10">
                <div className="text-slate-600 text-base leading-relaxed font-medium markdown-body">
                  <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
                </div>

                <div className="pt-10 border-t border-slate-50">
                  <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
                    <MessageSquare className="w-5 h-5 text-emerald-500" />
                    Komentar ({comments.length})
                  </h3>

                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-slate-900">{comment.author_name}</p>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <p className="text-[10px] text-slate-400 font-bold">
                              {new Date(comment.created_at).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Belum ada komentar</p>
                        <p className="text-slate-400 text-[10px] mt-1">Jadilah yang pertama untuk berdiskusi.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto">
                <form onSubmit={handleCreateComment} className="flex gap-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tulis tanggapan kamu..."
                    className="flex-1 bg-white border border-slate-100 rounded-2xl py-4 px-5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium shadow-sm"
                  />
                  <button
                    type="submit"
                    className="p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                    aria-label="Kirim"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
