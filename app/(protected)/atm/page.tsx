import { prisma } from "@/lib/prisma";
import { deleteAtm } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { AtmListClient } from "./AtmListClient";

export default async function AtmListPage() {
  const atms = await prisma.atm.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader
        title=""
        description=""
        action={
          <LinkButton href="/atm/new">
            <FiPlus /> Tambah ATM
          </LinkButton>
        }
      />

      <AtmListClient atms={atms} onDelete={deleteAtm} />
    </div>
  );
}
