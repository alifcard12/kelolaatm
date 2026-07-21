// Klien tipis untuk API absensi.itsview.id. Endpoint ini di luar aplikasi
// kita (bukan Prisma), jadi kita cuma meneruskan request via fetch dan
// menyimpan session cookie-nya sendiri.

export const ABSENSI_BASE_URL = "https://absensi.itsview.id";
export const ABSENSI_COOKIE_NAME = "absensi_ci_session";
export const ABSENSI_LOGIN_COOKIE_KEY = "ci_session";

export class AbsensiError extends Error {}

/**
 * Ambil nilai `ci_session=...` dari header Set-Cookie hasil login.
 * Contoh header: "ci_session=e80s...; Path=/; HttpOnly; Expires=..."
 */
function extractSessionCookie(setCookieHeader: string | null): string | null {
  if (!setCookieHeader) return null;

  // fetch bisa menggabungkan beberapa Set-Cookie jadi satu string dipisah koma,
  // jadi kita cari pola "ci_session=..." di mana pun posisinya.
  const match = setCookieHeader.match(/ci_session=([^;,\s]+)/);
  return match ? match[1] : null;
}

/**
 * Login ke absensi.itsview.id dan mengembalikan nilai cookie ci_session
 * yang perlu disimpan untuk request absen berikutnya.
 */
export async function loginAbsensi(
  username: string,
  password: string
): Promise<string> {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  const res = await fetch(`${ABSENSI_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    redirect: "manual", // supaya kita tetap bisa baca Set-Cookie kalaupun servernya redirect
  });

  const setCookie = res.headers.get("set-cookie");
  const sessionValue = extractSessionCookie(setCookie);

  if (!sessionValue) {
    if (!res.ok && res.status !== 0) {
      throw new AbsensiError(
        `Login absensi gagal (status ${res.status}). Periksa username/password.`
      );
    }
    throw new AbsensiError(
      "Login absensi gagal: server tidak mengirim session cookie. Periksa username/password."
    );
  }

  return sessionValue;
}

export type SubmitAbsenParams = {
  sessionValue: string;
  keterangan: string;
  latitude: string;
  longitude: string;
  manualLocation: string;
  alasanTerlambat: string;
  secureScore: string;
  accuracy: string;
};

export type SubmitAbsenResult = {
  ok: boolean;
  status: number;
  raw: string;
};

export async function submitAbsen(
  params: SubmitAbsenParams
): Promise<SubmitAbsenResult> {
  const body = new URLSearchParams();
  body.set("keterangan", params.keterangan);
  body.set("latitude", params.latitude);
  body.set("longitude", params.longitude);
  body.set("manual_location", params.manualLocation);
  body.set("alasan_terlambat", params.alasanTerlambat);
  body.set("secure_score", params.secureScore);
  body.set("accuracy", params.accuracy);

  const res = await fetch(`${ABSENSI_BASE_URL}/absensi/absen`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: `${ABSENSI_LOGIN_COOKIE_KEY}=${params.sessionValue}`,
    },
    body: body.toString(),
  });

  const raw = await res.text();

  if (res.status === 401 || res.status === 403) {
    throw new AbsensiError("Sesi absensi sudah habis, silakan login ulang.");
  }
  if (!res.ok) {
    throw new AbsensiError(`Absen gagal (status ${res.status}). ${raw.slice(0, 200)}`);
  }

  return { ok: true, status: res.status, raw };
}
