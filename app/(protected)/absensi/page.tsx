import { cookies } from "next/headers";
import { PageHeader } from "@/components/ui/PageHeader";
import { ABSENSI_COOKIE_NAME } from "@/lib/absensi";
import AbsenForm from "./AbsenForm";
import AbsenLoginForm from "./AbsenLoginForm";

export default async function AbsensiPage() {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get(ABSENSI_COOKIE_NAME)?.value);

  return (
    <div className="max-w-md">
      <PageHeader title="Absensi" />
      {isLoggedIn ? <AbsenForm /> : <AbsenLoginForm />}
    </div>
  );
}
