import { prisma } from "@/lib/prisma";
import { deleteHotel } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { HotelListClient } from "./HotelListClient";

export default async function HotelListPage() {
  const hotels = await prisma.hotel.findMany({
    orderBy: { bookingDate: "desc" },
  });

  return (
    <div>
      <PageHeader
        title=""
        description=""
        action={
          <LinkButton href="/hotel/new">
            <FiPlus /> Tambah Pemesanan
          </LinkButton>
        }
      />

      <HotelListClient hotels={hotels} onDelete={deleteHotel} />
    </div>
  );
}
