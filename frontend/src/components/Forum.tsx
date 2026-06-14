import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Clock, PlusCircle, Pencil, Trash2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '@/lib/api';
import type { User } from '@/lib/auth';

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

export default function ForumPage({ user }: { user: User | null }) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Diskusi Umum' });
  const [newComment, setNewComment] = useState('');

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
    if (selectedPost) {
      fetchComments(selectedPost.id);
    }
  }, [selectedPost]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Silakan masuk terlebih dahulu untuk membuat postingan.');
    if (!newPost.title || !newPost.content) return;

    try {
      await api.post('/forum', newPost);
      setNewPost({ title: '', content: '', category: 'Diskusi Umum' });
      setIsAddingPost(false);
      fetchPosts();
    } catch (error) {
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
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!user || !window.confirm('Apakah Anda yakin ingin menghapus postingan ini?')) return;

    try {
      await api.delete(`/forum/${postId}`);
      if (selectedPost?.id === postId) setSelectedPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const startEditing = (post: ForumPost) => {
    setEditingPost(post);
    setNewPost({ title: post.title, content: post.content, category: post.category });
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Silakan masuk terlebih dahulu untuk berkomentar.');
    if (!newComment || !selectedPost) return;

    try {
      await api.post(`/forum/${selectedPost.id}/comments`, { content: newComment });
      setNewComment('');
      fetchComments(selectedPost.id);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto relative">
      <div className="absolute inset-0 -z-10 h-[50vh] overflow-hidden left-0 right-0">
        <img 
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=2070" 
          className="w-full h-full object-cover opacity-5" 
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50" />
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Forum Komunitas</h1>
          <p className="text-slate-500 font-medium italic">Berbagi cerita, tips, dan diskusi seputar penyelamatan makanan.</p>
        </div>
        <button 
          onClick={() => {
            setNewPost({ title: '', content: '', category: 'Diskusi Umum' });
            setIsAddingPost(true);
          }}
          className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
        >
          <PlusCircle className="w-5 h-5" /> Buat Diskusi
        </button>
      </div>

      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-none">
        {['Semua', 'Diskusi Umum', 'Tips & Trik', 'Cerita Donor', 'Laporan Hub'].map((cat) => (
          <button key={cat} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-500 transition-all whitespace-nowrap">
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-3xl"></div>)}
          </div>
        ) : (
          posts.map((post) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all cursor-pointer group relative"
            >
              <div onClick={() => setSelectedPost(post)}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-widest border border-emerald-100">
                    {post.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(post.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-emerald-500 transition-colors leading-tight">{post.title}</h2>
                <div className="text-slate-600 line-clamp-2 mb-6 text-sm font-medium leading-relaxed">
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
              </div>

              {user && user.id === post.author_id && (
                <div className="absolute top-8 right-8 flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); startEditing(post); }}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-slate-50" onClick={() => setSelectedPost(post)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400">
                    {post.author_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{post.author_name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Anggota Komunitas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl">
                  <MessageSquare className="w-4 h-4" /> Diskusi
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Post Modal */}
      <AnimatePresence>
        {(isAddingPost || editingPost) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAddingPost(false); setEditingPost(null); }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative z-10 overflow-hidden isolate">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full translate-x-12 -translate-y-12 -z-10" />
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{editingPost ? 'Edit Diskusi' : 'Mulai Diskusi Baru'}</h2>
                <button onClick={() => { setIsAddingPost(false); setEditingPost(null); }} className="p-2 hover:bg-slate-50 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Judul Diskusi</label>
                  <input 
                    type="text" 
                    value={newPost.title}
                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                    placeholder="Apa yang ingin kamu diskusikan?" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Kategori</label>
                    <select 
                      value={newPost.category}
                      onChange={e => setNewPost({...newPost, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-600 appearance-none"
                    >
                      <option>Diskusi Umum</option>
                      <option>Tips & Trik</option>
                      <option>Cerita Donor</option>
                      <option>Laporan Hub</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Isi Postingan (Mendukung Markdown)</label>
                  <textarea 
                    value={newPost.content}
                    onChange={e => setNewPost({...newPost, content: e.target.value})}
                    placeholder="Tuliskan pemikiran atau tips kamu di sini..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] py-5 px-6 h-48 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none font-medium text-slate-600"
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { setIsAddingPost(false); setEditingPost(null); }}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all transform active:scale-[0.98]"
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPost(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl relative z-10 max-h-[85vh] overflow-hidden flex flex-col">
              <div className="p-10 pb-6 border-b border-slate-100 relative">
                <button onClick={() => setSelectedPost(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-widest border border-emerald-100">
                    {selectedPost.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    {new Date(selectedPost.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 leading-tight mb-4">{selectedPost.title}</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400">
                      {selectedPost.author_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{selectedPost.author_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Pembuat Diskusi</p>
                    </div>
                  </div>
                  {user && user.id === selectedPost.author_id && (
                    <div className="flex gap-2">
                       <button onClick={() => { startEditing(selectedPost); setSelectedPost(null); }} className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => handleDeletePost(selectedPost.id)} className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-thin scrollbar-thumb-slate-200">
                <div className="text-slate-600 text-base leading-relaxed font-medium markdown-body">
                  <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
                </div>

                <div className="pt-10 border-t border-slate-50">
                  <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-500" />
                    Komentar ({comments.length})
                  </h3>
                  
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-extrabold text-slate-900">{comment.author_name}</p>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <p className="text-[10px] text-slate-400 font-bold">{new Date(comment.created_at).toLocaleTimeString('id-ID')}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{comment.content}</p>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Belum ada komentar</p>
                        <p className="text-slate-400 text-[10px] mt-1">Jadilah yang pertama untuk berdiskusi!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 mt-auto">
                <form onSubmit={handleCreateComment} className="flex gap-3">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Tulis tanggapan kamu..." 
                    className="flex-1 bg-white border border-slate-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium shadow-sm"
                  />
                  <button 
                    type="submit"
                    className="p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 transform active:scale-95"
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
