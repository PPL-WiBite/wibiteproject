import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Leaf, Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type User } from '@/lib/auth';
import api from '@/lib/api';

interface RatebackPageProps {
  user: User;
}

export default function RatebackPage({ user }: RatebackPageProps) {
  const navigate = useNavigate();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const tags = [
    'Performa Aplikasi',
    'Kemudahan Penggunaan',
    'Dampak Sosial',
    'Kualitas Makanan',
    'Lainnya'
  ];

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/feedback', {
        message: feedbackText,
        rating,
      });

      setIsSubmitted(true);
      setRating(0);
      setSelectedTags([]);
      setFeedbackText('');
    } catch (error) {
      console.error(error);
      alert('Gagal mengirim feedback. Silakan coba lagi.');
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-[700px] w-full mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-sm space-y-8"
            >
              {/* Header */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-slate-900 leading-tight">Beri Rating & Masukan</h1>
                <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto leading-relaxed">
                  Kontribusi Anda membantu kami mewujudkan SDG 12: Konsumsi yang Bertanggung Jawab.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Star Rating */}
                <div className="text-center space-y-4">
                  <h3 className="text-base font-extrabold text-slate-800">
                    Bagaimana pengalaman Anda menggunakan WiBite?
                  </h3>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform active:scale-95"
                      >
                        <Star
                          className={`w-9 h-9 transition-all duration-200 ${
                            star <= (hoverRating || rating)
                              ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-sm'
                              : 'text-slate-300 hover:text-slate-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Tags */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-700">
                    Apa yang paling berkesan bagi Anda?
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {tags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm font-black'
                              : 'bg-slate-100 hover:bg-slate-200/80 border-transparent text-slate-600'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Comments */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-700">
                    Ceritakan lebih lanjut (Opsional)
                  </h3>
                  <textarea
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tuliskan pengalaman atau saran Anda di sini..."
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all resize-none"
                  />
                </div>

                {/* Impact Banner */}
                <div className="bg-emerald-50/60 border border-emerald-100/60 p-5 rounded-2xl flex gap-3.5 items-start">
                  <div className="w-9 h-9 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider">Feedback Anda Berdampak!</h4>
                    <p className="text-[11px] font-semibold text-emerald-700/90 leading-relaxed">
                      Setiap masukan membantu kami mengurangi limbah makanan sebesar 15% lebih efisien setiap bulannya.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={rating === 0}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 ${
                    rating > 0
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xl shadow-emerald-700/20'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/55'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" /> Kirim Masukan
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-sm text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto border border-emerald-100">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Terima kasih atas Masukan Anda!</h2>
                <p className="text-sm font-semibold text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Setiap kritik dan saran sangat berharga untuk terus mengembangkan pengalaman terbaik di WiBite.
                </p>
              </div>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-700/10"
              >
                Beri Masukan Lagi
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
