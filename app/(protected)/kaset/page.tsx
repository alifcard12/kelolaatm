import { prisma } from "@/lib/prisma";
import { deleteKaset } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { KasetListClient } from "./KasetListClient";

export default async function KasetListPage() {
  const kasetList = await prisma.kaset.findMany({
    include: {
      logs: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const rows = kasetList.map((k) => {
    const latest = k.logs[0];
    return {
      id: k.id,
      serialNumber: k.serialNumber,
      type: k.type,
      latestCondition: latest?.condition ?? null,
      latestProblem: latest?.problem ?? null,
      latestAt: latest?.createdAt ?? null,
    };
  });

  return (
    <div>
      <PageHeader
        title="Kaset"
        description="Riwayat kondisi kaset all-in-one dan currency."
        action={
          <LinkButton href="/kaset/new">
            <FiPlus /> Tambah Kaset
          </LinkButton>
        }
      />

      <KasetListClient kasetList={rows} onDelete={deleteKaset} />
    </div>
  );
}
