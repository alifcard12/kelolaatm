import { prisma } from "@/lib/prisma";
import { deleteDevice } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { DeviceListClient } from "./DeviceListClient";

export default async function DevicesPage() {
  const devices = await prisma.device.findMany({
    include: { atm: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title=""
        description=""
        action={
          <LinkButton href="/devices/new">
            <FiPlus /> Tambah Perangkat
          </LinkButton>
        }
      />

      <DeviceListClient devices={devices} onDelete={deleteDevice} />
    </div>
  );
}
