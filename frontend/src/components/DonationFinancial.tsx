import React, { useState, ChangeEvent, FormEvent } from 'react';
import api from '@/lib/api';

// Menentukan Type untuk Data Form
interface DonationFormData {
  amount: number;
  customAmount: string;
  donorName: string;
  isAnonymous: boolean;
  paymentMethod: string;
  message: string;
}

const FinancialDonationForm: React.FC = () => {
  const [formData, setFormData] = useState<DonationFormData>({
    amount: 0,
    customAmount: '',
    donorName: '',
    isAnonymous: false,
    paymentMethod: '',
    message: '',
  });

  // Pilihan nominal cepat
  const presetAmounts = [10000, 25000, 50000, 100000];
  // Pilihan metode pembayaran
  const paymentMethods = ['QRIS', 'GoPay', 'OVO', 'Transfer Bank'];

  const handlePresetClick = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      amount: value,
      customAmount: '', // Reset custom amount jika pilih preset
    }));
  };

  const handleCustomAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Hanya menerima angka
    if (/^\d*$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        customAmount: value,
        amount: value ? parseInt(value, 10) : 0,
      }));
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    
    setFormData((prev) => ({
      ...prev,
      isAnonymous: isChecked,
      // Jika dicentang, otomatis set donorName jadi 'Anonim'. Jika dicentang ulang, kosongkan kembali.
      donorName: isChecked ? 'Anonim' : '', 
    }));
  };

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validasi sederhana bawaan Anda
    if (formData.amount <= 0) {
      alert('Silakan masukkan atau pilih nominal donasi terlebih dahulu.');
      return;
    }
    if (!formData.paymentMethod) {
      alert('Silakan pilih metode pembayaran.');
      return;
    }

    // 1. Susun objek data donasi baru dengan struktur yang dikenali AdminDashboard
    const nameToDisplay = formData.isAnonymous 
      ? 'Anonim' 
      : (formData.donorName.trim() || 'Anonim');

    const newDonation = {
      id: Date.now(),
      donorName: nameToDisplay,
      amount: formData.amount,
      paymentMethod: formData.paymentMethod,
      notes: formData.message || '',
      date: new Date().toISOString().split('T')[0], // format: YYYY-MM-DD
      created_at: new Date().toISOString()
    };

    try {
      // 2. Integrasi Kirim Data ke API Laravel Kamu
      // Menggunakan blok try-catch agar jika route API belum siap, program tidak crash
      if (typeof api !== 'undefined') {
        await api.post('/financial-donations', {
          amount: formData.amount,
          payment_method: formData.paymentMethod,
          message: formData.message,
          is_anonymous: formData.isAnonymous,
          donor_name: nameToDisplay
        });
      }
      
      alert(`Terima kasih! Donasi sebesar Rp ${formData.amount.toLocaleString('id-ID')} menggunakan ${formData.paymentMethod} berhasil diproses.`);
      
    } catch (error) {
      console.error('Gagal mengirim ke API Laravel, dialihkan ke penyimpanan lokal:', error);
      alert('Koneksi backend bermasalah, data donasi disimpan secara lokal.');
    } finally {
      // 3. SELALU Simpan ke localStorage sebagai sinkronisasi instan ke Admin Dashboard
      const existingDonations = JSON.parse(localStorage.getItem('wibite_financial_donations') || '[]');
      const updatedDonations = [newDonation, ...existingDonations];
      localStorage.setItem('wibite_financial_donations', JSON.stringify(updatedDonations));

      // 4. Reset Form setelah sukses donasi
      setFormData({
        amount: 0,
        customAmount: '',
        donorName: '',
        isAnonymous: false,
        paymentMethod: '',
        message: '',
      });
    }
  };
  

  

  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-md overflow-hidden p-5 border border-gray-100 mt-24 mb-8">
        <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Donasi Operasional</h2>
            <p className="text-xs text-gray-500 mt-1 px-2">
            Dukungan finansial sukarela Anda membantu kami menjaga server dan distribusi makanan tetap berjalan.
            </p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Input Nominal */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pilih Nominal Donasi
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                  formData.amount === preset && formData.customAmount === ''
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Rp {preset.toLocaleString('id-ID')}
              </button>
            ))}
          </div>

          {/* Custom Nominal */}
          <div className="relative mt-2 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">Rp</span>
            </div>
            <input
              type="text"
              name="customAmount"
              value={formData.customAmount}
              onChange={handleCustomAmountChange}
              placeholder="Masukkan nominal lain..."
              className="block w-full rounded-lg border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 border outline-none transition"
            />
          </div>
        </div>

        {/* Informasi Donatur */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nama Donatur
          </label>
          <input
            type="text"
            name="donorName"
            value={formData.donorName}
            onChange={handleInputChange}
            disabled={formData.isAnonymous}
            placeholder={formData.isAnonymous ? 'Anonim' : 'Nama Lengkap Anda'}
            className="block w-full rounded-lg border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 border outline-none transition disabled:bg-gray-100 disabled:text-gray-400"
          />
          <div className="flex items-center mt-2">
            <input
              id="isAnonymous"
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={handleCheckboxChange}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isAnonymous" className="ml-2 text-xs text-gray-600 select-none">
              Sembunyikan nama saya (Donasi sebagai Anonim)
            </label>
          </div>
        </div>

        {/* Metode Pembayaran */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Metode Pembayaran
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
            className="block w-full rounded-lg border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 border bg-white outline-none transition"
          >
            <option value="">-- Pilih Metode --</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        {/* Pesan/Dukungan */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pesan & Dukungan <span className="text-gray-400 font-normal">(Opsional)</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={3}
            placeholder="Tuliskan doa atau pesan hangat untuk tim kami..."
            className="block w-full rounded-lg border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500 border outline-none transition resize-none"
          />
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Kirim Donasi {formData.amount > 0 ? `(Rp ${formData.amount.toLocaleString('id-ID')})` : ''}
        </button>
      </form>
    </div>
  );
};

export default FinancialDonationForm;