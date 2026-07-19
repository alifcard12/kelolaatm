import { prisma } from "@/lib/prisma";
import { deleteVisit } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { VisitListClient } from "./VisitListClient";

export default async function VisitsPage() {
  const visits = await prisma.visit.findMany({
    include: { atm: true, ticket: true },
    orderBy: { visitDate: "desc" },
  });

  return (
    <div>
      <PageHeader
        title=""
        description=""
        action={
          <LinkButton href="/visits/new">
            <FiPlus /> Catat Kunjungan
          </LinkButton>
        }
      />

      <VisitListClient visits={visits} onDelete={deleteVisit} />
    </div>
  );
}
