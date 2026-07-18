import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Page() {
  return (
    <div>
      <PageHeader
        title="Keuangan Operasional"
        description="Catatan uang masuk dan uang keluar operasional."
      />
      <EmptyState
        title="Belum terhubung ke database"
        description="Halaman ini masih placeholder — menyusul di update berikutnya."
      />
    </div>
  );
}
