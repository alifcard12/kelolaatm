import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteDevice } from "./actions";
import { formatJakartaDateTime, formatRelativeTime } from "@/lib/date";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { CONDITION_LABEL, CONDITION_TONE } from "@/lib/labels";

export default async function DevicesPage() {
  const devices = await prisma.device.findMany({
    include: { atm: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Perangkat Pendukung"
        description="NVR, monitor, CCTV, dan UPS yang terpasang di tiap ATM."
        action={
          <LinkButton href="/devices/new">
            <FiPlus /> Tambah Perangkat
          </LinkButton>
        }
      />

      {devices.length === 0 && (
        <EmptyState
          title="Belum ada data perangkat"
          description="Tambahkan perangkat pendukung untuk mulai mencatat kondisi dan riwayatnya."
          action={
            <LinkButton href="/devices/new" size="sm">
              <FiPlus /> Tambah Perangkat
            </LinkButton>
          }
        />
      )}

      {/* Kartu — mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {devices.map((d) => (
          <Card key={d.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/devices/${d.id}`} className="min-w-0">
                <p className="font-display font-semibold text-espresso">
                  {d.type} — {d.brand}
                </p>
                <p className="text-sm text-espresso-soft truncate">SN {d.serialNumber}</p>
              </Link>
              <Badge tone={CONDITION_TONE[d.condition]}>{CONDITION_LABEL[d.condition]}</Badge>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-espresso-soft">
              <Link href={`/atm/${d.atm.id}`} className="hover:text-rose">
                TID {d.atm.tid} — {d.atm.location}
              </Link>
              <span title={formatJakartaDateTime(d.updatedAt)}>{formatRelativeTime(d.updatedAt)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabel — desktop */}
      {devices.length > 0 && (
        <Table>
          <Thead>
            <Th>Tipe</Th>
            <Th>Brand</Th>
            <Th>SN</Th>
            <Th>ATM (TID)</Th>
            <Th>Kondisi</Th>
            <Th>Last Update</Th>
            <Th></Th>
          </Thead>
          <Tbody>
            {devices.map((d) => (
              <Tr key={d.id}>
                <Td className="font-medium">
                  <Link href={`/devices/${d.id}`} className="hover:text-rose transition-colors">
                    {d.type}
                  </Link>
                </Td>
                <Td>{d.brand}</Td>
                <Td className="text-espresso-soft">{d.serialNumber}</Td>
                <Td>
                  <Link href={`/atm/${d.atm.id}`} className="hover:text-rose transition-colors">
                    {d.atm.tid} — {d.atm.location}
                  </Link>
                </Td>
                <Td>
                  <Badge tone={CONDITION_TONE[d.condition]}>{CONDITION_LABEL[d.condition]}</Badge>
                </Td>
                <Td className="text-espresso-soft">
                  <span title={formatJakartaDateTime(d.updatedAt)}>
                    {formatRelativeTime(d.updatedAt)}
                  </span>
                </Td>
                <Td className="text-right">
                  <DeleteButton action={deleteDevice.bind(null, d.id)} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
