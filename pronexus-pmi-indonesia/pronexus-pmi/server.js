// =========================================================
// PRONEXUS PMI — Server Backend (Node.js + Express)
// =========================================================

const express  = require('express');
const cors     = require('cors');
const fs       = require('fs');
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Direktori ─────────────────────────────────────────────
const PUBLIC_DIR     = path.join(__dirname, 'public');
const DATA_DIR       = path.join(__dirname, 'data');
const FILE_PERTANYAAN = path.join(DATA_DIR, 'pertanyaan.json');

// ── Pastikan folder dan file data ada ─────────────────────
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(FILE_PERTANYAAN)) fs.writeFileSync(FILE_PERTANYAAN, '[]', 'utf8');

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// ── Fungsi Pembantu ───────────────────────────────────────
function emailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function bacaPertanyaan() {
  try {
    return JSON.parse(fs.readFileSync(FILE_PERTANYAAN, 'utf8'));
  } catch {
    return [];
  }
}

function simpanPertanyaan(data) {
  const semua = bacaPertanyaan();
  semua.push(data);
  fs.writeFileSync(FILE_PERTANYAAN, JSON.stringify(semua, null, 2), 'utf8');
}

// ── Rute API ──────────────────────────────────────────────

// POST /api/contact — Terima pertanyaan dari formulir kontak
app.post('/api/contact', (req, res) => {
  const { name, email, business, service, message } = req.body;

  // Validasi
  const kesalahan = [];
  if (!name    || name.trim().length < 2)      kesalahan.push('Nama wajib diisi (minimal 2 karakter).');
  if (!email   || !emailValid(email))           kesalahan.push('Email yang valid wajib diisi.');
  if (!business|| business.trim().length < 2)  kesalahan.push('Nama bisnis wajib diisi.');
  if (!service || service.trim() === '')        kesalahan.push('Silakan pilih layanan.');
  if (!message || message.trim().length < 10)  kesalahan.push('Pesan wajib diisi (minimal 10 karakter).');

  if (kesalahan.length > 0) {
    return res.status(400).json({ error: kesalahan.join(' '), errors: kesalahan });
  }

  const pertanyaan = {
    id:        Date.now(),
    dibuatPada: new Date().toISOString(),
    nama:      name.trim(),
    email:     email.trim().toLowerCase(),
    bisnis:    business.trim(),
    layanan:   service.trim(),
    pesan:     message.trim(),
    status:    'baru'   // baru | dihubungi | selesai
  };

  try {
    simpanPertanyaan(pertanyaan);
    console.log(`[${pertanyaan.dibuatPada}] Pertanyaan baru dari ${pertanyaan.nama} <${pertanyaan.email}> — ${pertanyaan.layanan}`);
    return res.status(201).json({
      sukses: true,
      pesan:  'Pertanyaan diterima. Kami akan menghubungi Anda dalam 24 jam.',
      id:     pertanyaan.id
    });
  } catch (err) {
    console.error('Gagal menyimpan pertanyaan:', err);
    return res.status(500).json({ error: 'Kesalahan server. Silakan coba lagi nanti.' });
  }
});

// GET /api/inquiries — Lihat semua data pertanyaan (admin)
app.get('/api/inquiries', (_req, res) => {
  const semua = bacaPertanyaan();
  res.json({
    total: semua.length,
    data:  semua.sort((a, b) => b.id - a.id) // terbaru dulu
  });
});

// GET /api/health — Pengecekan status server
app.get('/api/health', (_req, res) => {
  res.json({ status: 'aktif', waktu: new Date().toISOString() });
});

// ── Fallback SPA — tampilkan index.html untuk semua rute ──
app.get('*', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// ── Jalankan server ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Server Pronexus PMI berjalan di http://localhost:${PORT}`);
  console.log(`📁  Pertanyaan disimpan di: ${FILE_PERTANYAAN}\n`);
});
