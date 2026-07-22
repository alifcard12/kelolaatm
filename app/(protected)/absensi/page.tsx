import { cookies } from "next/headers";
import { PageHeader } from "@/components/ui/PageHeader";
import { ABSENSI_COOKIE_NAME } from "@/lib/absensi";
import AbsenForm from "./AbsenForm";
import AbsenLoginForm from "./AbsenLoginForm";
import AbsensiHistory from "./AbsensiHistory";
import AbsenScheduleForm from "./AbsenScheduleForm";
import AbsenScheduleList from "./AbsenScheduleList";

export default async function AbsensiPage() {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get(ABSENSI_COOKIE_NAME)?.value);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Absensi" />
      <div className="max-w-md">
        {isLoggedIn ? <AbsenForm /> : <AbsenLoginForm />}
      </div>
      <AbsensiHistory />

      {/* Jadwal absen otomatis: dieksekusi oleh GitHub Actions lewat
          /api/cron/run-absen-schedule, tidak bergantung pada login/cookie
          di atas -- jadi tetap login sendiri setiap dijalankan. */}
      <div className="max-w-md">
        <AbsenScheduleForm />
      </div>
      <AbsenScheduleList />
    </div>
  );
}
