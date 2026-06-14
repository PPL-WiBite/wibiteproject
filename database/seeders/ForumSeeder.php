<?php

namespace Database\Seeders;

use App\Models\ForumPost;
use App\Models\User;
use Illuminate\Database\Seeder;

class ForumSeeder extends Seeder
{
    public function run(): void
    {
        $author = User::query()->whereIn('role', ['donor', 'admin'])->first()
            ?? User::query()->first();

        if (!$author) {
            return;
        }

        $posts = [
            [
                'title' => 'Selamat Datang di Forum Komunitas WiBite!',
                'category' => 'Diskusi Umum',
                'content' => <<<MD
Halo semua, selamat datang di forum komunitas **WiBite**!

Ini ruang untuk kamu berbagi cerita, bertanya, dan berdiskusi seputar isu makanan dan dampaknya terhadap lingkungan. Mari saling kenalan dan saling mendukung.

- Kenalkan dirimu dan peranmu di komunitas (pendonor / penerima).
- Ceritakan alasan kamu peduli dengan food waste.
- Usulkan ide agar WiBite semakin berdampak.
MD,
            ],
            [
                'title' => 'Aturan Diskusi yang Nyaman',
                'category' => 'Diskusi Umum',
                'content' => <<<MD
Agar forum tetap nyaman, yuk jaga beberapa hal ini:

1. Gunakan bahasa sopan dan hindari menyerang pribadi.
2. Hindari spam, iklan, atau promosi yang tidak relevan.
3. Sebut sumber kalau kamu berbagi data atau klaim.
4. Laporkan postingan mencurigakan ke admin.

Terima kasih sudah menjaga komunitas!
MD,
            ],
            [
                'title' => '5 Tips Menyimpan Sisa Makanan agar Tetap Aman',
                'category' => 'Tips & Trik',
                'content' => <<<MD
Sisa makanan yang disimpan dengan benar bisa tetap aman dikonsumsi di hari berikutnya. Beberapa tips cepat:

1. **Dinginkan dalam 2 jam** setelah dimasak.
2. **Pisahkan per porsi** agar tidak berkali-kali keluar-masuk lemari es.
3. **Tandai tanggal** penyimpanan di wadahnya.
4. Hindari wadah plastik yang tidak food-grade.
5. Panaskan sampai uap panas merata sebelum dikonsumsi.

Punya tips lain? Drop di kolom komentar ya.
MD,
            ],
            [
                'title' => 'Mengolah Sayur Layu Jadi Hidangan Enak',
                'category' => 'Tips & Trik',
                'content' => <<<MD
Sayur yang mulai layu belum tentu harus dibuang. Beberapa ide:

- Tumis dengan bawang putih dan sedikit kaldu.
- Olah jadi **kaldu sayur** untuk sup.
- Buat **omelet sayur** sederhana.
- Blender jadi **smoothie hijau** dengan buah.

Share resep favoritmu juga di sini.
MD,
            ],
            [
                'title' => 'Kisah Pertama Berbagi: Kotak Nasi yang Tidak Sia-Sia',
                'category' => 'Cerita Donor',
                'content' => <<<MD
Minggu lalu kami punya 20 kotak nasi sisa acara kantor. Daripada terbuang, kami posting di WiBite. Dalam 30 menit, semuanya diklaim oleh beberapa penerima di sekitar gedung.

Yang paling berkesan: melihat pesan terima kasih dari penerima yang menceritakan bahwa kotak nasi itu jadi makan malam keluarganya.

Kadang, yang berlebih di kita bisa jadi berkah besar untuk orang lain.
MD,
            ],
            [
                'title' => 'Satu Porsi yang Mengubah Rutinitas Kami',
                'category' => 'Cerita Donor',
                'content' => <<<MD
Sebagai penerima, klaim pertama kami di WiBite adalah roti dari bakery lokal. Sejak itu, kami jadi lebih sadar: banyak makanan layak yang hanya butuh orang tepat untuk menghabiskannya.

Sekarang kami rutin membagikan info WiBite ke tetangga dan komunitas RW. Dari satu porsi, tumbuh jadi jaringan kecil yang saling menjaga.
MD,
            ],
            [
                'title' => 'Laporan Hub Jakarta Selatan - Minggu Ini',
                'category' => 'Laporan Hub',
                'content' => <<<MD
Update singkat aktivitas Hub Jakarta Selatan pekan ini:

- **Total porsi tersalurkan:** 128 porsi
- **Donatur aktif:** 9 usaha
- **Penerima aktif:** 34 akun

Fokus minggu depan: kolaborasi dengan dua kantin kampus di Kebayoran. Terima kasih untuk semua relawan yang bantu penjemputan.
MD,
            ],
            [
                'title' => 'Laporan Hub Bandung Utara - Panen Roti Bakery',
                'category' => 'Laporan Hub',
                'content' => <<<MD
Tiga bakery di Bandung Utara rutin berbagi sisa roti setiap malam. Minggu ini:

- 5 hari berturut-turut tanpa ada roti terbuang.
- 2 panti asuhan menerima kiriman rutin.
- 1 volunteer baru bergabung (halo, Kak Nadia!).

Kalau ada kafe / bakery di sekitar yang ingin ikut, boleh kontak tim hub lewat forum ini.
MD,
            ],
        ];

        foreach ($posts as $data) {
            ForumPost::create([
                'title' => $data['title'],
                'content' => $data['content'],
                'category' => $data['category'],
                'author_id' => $author->id,
                'author_name' => $author->name,
            ]);
        }
    }
}
