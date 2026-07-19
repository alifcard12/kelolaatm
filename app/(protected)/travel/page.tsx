import { prisma } from "@/lib/prisma";
import { deleteTravel } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { TravelListClient } from "./TravelListClient";

export default async function TravelListPage() {
  const travels = await prisma.travel.findMany({
    orderBy: { orderDate: "desc" },
  });

  return (
    <div>
      <PageHeader
        title=""
        description=""
        action={
          <LinkButton href="/travel/new">
            <FiPlus /> Tambah Pemesanan
          </LinkButton>
        }
      />

      <TravelListClient travels={travels} onDelete={deleteTravel} />
    </div>
  );
}
