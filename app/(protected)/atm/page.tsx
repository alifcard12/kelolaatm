import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteAtm } from "./actions";
import { formatJakartaDateTime, formatRelativeTime } from "@/lib/date";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";

export default async function AtmListPage() {
  const atms = await prisma.atm.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeader
        title="Data ATM"
        description="Semua unit ATM yang sedang dikelola."
        action={
          <LinkButton href="/atm/new">
            <FiPlus /> Tambah ATM
          </LinkButton>
        }
      />

      {atms.length === 0 && (
        <EmptyState
          title="Belum ada data ATM"
          description="Tambahkan unit ATM pertama untuk mulai mengelola perangkat, tiket, dan kunjungan."
          action={
            <LinkButton href="/atm/new" size="sm">
              <FiPlus /> Tambah ATM
            </LinkButton>
          }
        />
      )}

      {/* Kartu — mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {atms.map((atm) => (
          <Card key={atm.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/atm/${atm.id}`} className="min-w-0">
                <p className="font-display font-semibold text-espresso">TID {atm.tid}</p>
                <p className="text-sm text-espresso-soft truncate">{atm.location}</p>
              </Link>
              <DeleteButton action={deleteAtm.bind(null, atm.id)} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-espresso-soft">
              <span>Branch: {atm.branch}</span>
              <span>SSB: {atm.ssb}</span>
              <span title={formatJakartaDateTime(atm.updatedAt)}>
                {formatRelativeTime(atm.updatedAt)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabel — desktop */}
      {atms.length > 0 && (
        <Table>
          <Thead>
            <Th>TID</Th>
            <Th>Lokasi</Th>
            <Th>Branch</Th>
            <Th>SSB</Th>
            <Th>Last Update</Th>
            <Th></Th>
          </Thead>
          <Tbody>
            {atms.map((atm) => (
              <Tr key={atm.id}>
                <Td className="font-medium">
                  <Link href={`/atm/${atm.id}`} className="hover:text-rose transition-colors">
                    {atm.tid}
                  </Link>
                </Td>
                <Td>{atm.location}</Td>
                <Td className="text-espresso-soft">{atm.branch}</Td>
                <Td className="text-espresso-soft">{atm.ssb}</Td>
                <Td className="text-espresso-soft">
                  <span title={formatJakartaDateTime(atm.updatedAt)}>
                    {formatRelativeTime(atm.updatedAt)}
                  </span>
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/atm/${atm.id}`} className="text-xs text-espresso-soft hover:text-rose">
                      Detail
                    </Link>
                    <DeleteButton action={deleteAtm.bind(null, atm.id)} />
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
