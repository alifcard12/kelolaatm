# Setup Jadwal Absen Otomatis (GitHub Actions + Vercel)

## Konsep

Masalah utamanya: cookie session absensi (`ci_session`) cuma hidup ~1 hari,
jadi kalau GitHub Actions cuma "titip" cookie session lama, pas jadwal
jalan beberapa hari kemudian sesinya sudah kadaluarsa.

Solusinya: **jangan simpan session sama sekali**. Setiap kali jadwal
dieksekusi, servernya login dulu (dapat session baru), langsung kirim
absen, selesai. Login + absen jadi satu paket sekali jalan, jadi cookie
browser kamu di aplikasi (yang dipakai buat absen manual) sama sekali
tidak tersentuh/tidak dipakai oleh proses otomatis ini.

Alurnya:

1. Kamu buat jadwal dari halaman **Absensi** di web (isi tanggal & jam,
   lat/lon, accuracy, secure score manual -- karena memang beda tiap kali).
   Jadwal disimpan di database (tabel `absen_schedules`, status `PENDING`).
2. GitHub Actions jalan tiap 5 menit (`cron: "*/5 * * * *"`), memanggil satu
   endpoint di Vercel: `POST /api/cron/run-absen-schedule`.
3. Endpoint itu cek: jadwal `PENDING` mana yang `scheduledAt <= sekarang`.
   Untuk tiap jadwal yang jatuh tempo: login ke `absensi.itsview.id`
   (dapat session baru), langsung `submitAbsen(...)` pakai lat/lon/accuracy/
   secureScore yang tersimpan di jadwal itu, lalu tandai `DONE`/`FAILED`.

## Troubleshooting: HTTP 307 "Redirecting..."

Kalau GitHub Actions dapat status **307** dengan body `Redirecting...`, itu
**bukan error dari endpoint kita** -- itu ciri khas **Vercel Deployment
Protection** (Password Protection / Vercel Authentication) yang meredirect
semua request ke halaman login Vercel sebelum sempat menyentuh kode kita.

Cek di **Vercel Dashboard → Project → Settings → Deployment Protection**:

- Kalau `ABSEN_APP_URL` mengarah ke URL **Preview** (bukan domain production),
  itu memang protected secara default -- pastikan pakai URL production.
- Kalau protection aktif juga di **Production**, ada 2 opsi:
  1. Matikan protection untuk Production (biarkan hanya Preview yang protected), atau
  2. Generate token di **"Protection Bypass for Automation"**, simpan sebagai
     secret GitHub baru bernama `ABSEN_VERCEL_BYPASS`. Workflow yang sudah
     diupdate otomatis mengirim header `x-vercel-protection-bypass` kalau
     secret ini diisi.

## Yang perlu kamu lakukan

### 1. Migrasi database

Model baru `AbsenSchedule` sudah ditambahkan di `prisma/schema.prisma`.
Jalankan:

```bash
npx prisma migrate dev --name add_absen_schedule
```

(atau `npx prisma db push` kalau kamu tidak pakai migration history).

### 2. Environment Variables di Vercel

Buka **Project Settings → Environment Variables** di Vercel, tambahkan:

| Key                 | Isi                                                              |
|---------------------|-------------------------------------------------------------------|
| `ABSENSI_USERNAME`  | Username login absensi (mis. `83045`)                             |
| `ABSENSI_PASSWORD`  | Password login absensi                                            |
| `CRON_SECRET`       | String rahasia bebas kamu buat sendiri, mis. hasil `openssl rand -hex 32` |

`CRON_SECRET` ini yang jadi "kunci" supaya endpoint `/api/cron/run-absen-schedule`
tidak bisa dipanggil sembarang orang -- cuma yang tahu secretnya (GitHub
Actions kamu) yang bisa memicu eksekusi jadwal.

Setelah menambahkan env var, **redeploy** project di Vercel.

### 3. Secrets di GitHub Actions

Di repo GitHub, buka **Settings → Secrets and variables → Actions**,
tambahkan:

| Secret name         | Isi                                                       |
|---------------------|------------------------------------------------------------|
| `ABSEN_APP_URL`     | URL production Vercel kamu, mis. `https://kelatm.vercel.app` (tanpa trailing slash) |
| `ABSEN_CRON_SECRET` | Nilai yang SAMA PERSIS dengan `CRON_SECRET` di Vercel      |

Workflow-nya sudah ada di `.github/workflows/absen-schedule.yml`, tidak
perlu diubah lagi setelah secrets di atas terisi.

### 4. Coba manual dulu

Sebelum mengandalkan jadwal beneran, tes dulu:

- Buka tab **Actions** di GitHub → pilih workflow "Jalankan Jadwal Absen"
  → **Run workflow** (trigger manual lewat `workflow_dispatch`).
- Atau tes langsung endpointnya dengan curl:

  ```bash
  curl -X POST https://kelatm.vercel.app/api/cron/run-absen-schedule \
    -H "Authorization: Bearer <CRON_SECRET_KAMU>"
  ```

  Kalau belum ada jadwal yang jatuh tempo, responnya `{"ok":true,"executed":0,"results":[]}`
  -- itu normal, artinya endpoint & auth-nya sudah benar.

## Catatan penting soal presisi waktu

GitHub Actions **tidak menjamin** cron jalan tepat di menit yang ditulis --
resminya interval minimum yang didukung adalah 5 menit, dan saat traffic
GitHub lagi tinggi, eksekusinya bisa telat beberapa menit dari jadwal cron
itu sendiri. Jadi:

- Anggap presisi realistisnya **±5-10 menit** dari jam yang kamu jadwalkan,
  bukan tepat ke detik.
- Kalau kamu butuh jauh lebih presisi (misal harus persis jam 08:00:00),
  opsi yang lebih pas adalah pakai layanan cron pihak ketiga yang lebih presisi
  (misal cron-job.org, EasyCron, atau Vercel Cron Jobs -- yang juga tetap
  tunduk pada batas plan Vercel-mu) yang memanggil endpoint yang sama
  (`/api/cron/run-absen-schedule`), workflow GitHub Actions ini bisa
  dijadikan cadangan/tidak dipakai.
- Endpoint-nya sendiri sudah didesain generik (tinggal `POST` + header
  `Authorization: Bearer <CRON_SECRET>`), jadi bisa dipanggil dari trigger
  apapun, tidak harus dari GitHub Actions.

## File yang ditambahkan/diubah

- `prisma/schema.prisma` -- tambah model `AbsenSchedule` + enum `AbsenScheduleStatus`
- `lib/absenSchedule.ts` -- CRUD jadwal + fungsi eksekusi jadwal jatuh tempo
- `app/api/cron/run-absen-schedule/route.ts` -- endpoint yang dipanggil cron
- `app/(protected)/absensi/schedule-actions.ts` -- server actions untuk UI
- `app/(protected)/absensi/AbsenScheduleForm.tsx` -- form buat jadwal baru
- `app/(protected)/absensi/AbsenScheduleList.tsx` -- daftar jadwal + status
- `app/(protected)/absensi/page.tsx` -- diupdate untuk menampilkan form & list di atas
- `.github/workflows/absen-schedule.yml` -- workflow cron GitHub Actions
