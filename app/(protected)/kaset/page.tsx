import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatJakartaDateTime, formatRelativeTime } from "@/lib/date";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { CONDITION_LABEL, CONDITION_TONE, KASET_TYPE_LABEL } from "@/lib/labels";

export default async function KasetListPage() {
  const kasetList = await prisma.kaset.findMany({
    include: {
      logs: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  // Urutkan berdasarkan log terbaru (last update), bukan createdAt kaset itu sendiri
  kasetList.sort((a, b) => {
    const aTime = a.logs[0]?.createdAt.getTime() ?? 0;
    const bTime = b.logs[0]?.createdAt.getTime() ?? 0;
    return bTime - aTime;
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

      {kasetList.length === 0 && (
        <EmptyState
          title="Belum ada data kaset"
          description="Tambahkan kaset pertama untuk mulai mencatat kondisinya."
          action={
            <LinkButton href="/kaset/new" size="sm">
              <FiPlus /> Tambah Kaset
            </LinkButton>
          }
        />
      )}

      {/* Kartu — mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {kasetList.map((k) => {
          const latest = k.logs[0];
          return (
            <Link key={k.id} href={`/kaset/${k.id}`}>
              <Card className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-espresso">{k.serialNumber}</p>
                    <p className="text-sm text-espresso-soft">{KASET_TYPE_LABEL[k.type]}</p>
                  </div>
                  {latest && (
                    <Badge tone={CONDITION_TONE[latest.condition]}>
                      {CONDITION_LABEL[latest.condition]}
                    </Badge>
                  )}
                </div>
                {latest?.problem && <p className="text-sm text-espresso-soft">{latest.problem}</p>}
                {latest && (
                  <p className="text-xs text-espresso-soft/70" title={formatJakartaDateTime(latest.createdAt)}>
                    {formatRelativeTime(latest.createdAt)}
                  </p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Tabel — desktop */}
      {kasetList.length > 0 && (
        <Table>
          <Thead>
            <Th>SN</Th>
            <Th>Tipe</Th>
            <Th>Kondisi Terakhir</Th>
            <Th>Problem Terakhir</Th>
            <Th>Last Update</Th>
            <Th></Th>
          </Thead>
          <Tbody>
            {kasetList.map((k) => {
              const latest = k.logs[0];
              return (
                <Tr key={k.id}>
                  <Td className="font-medium">
                    <Link href={`/kaset/${k.id}`} className="hover:text-rose transition-colors">
                      {k.serialNumber}
                    </Link>
                  </Td>
                  <Td className="text-espresso-soft">{KASET_TYPE_LABEL[k.type]}</Td>
                  <Td>
                    {latest ? (
                      <Badge tone={CONDITION_TONE[latest.condition]}>
                        {CONDITION_LABEL[latest.condition]}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </Td>
                  <Td className="text-espresso-soft">{latest?.problem ?? "-"}</Td>
                  <Td className="text-espresso-soft">
                    {latest ? (
                      <span title={formatJakartaDateTime(latest.createdAt)}>
                        {formatRelativeTime(latest.createdAt)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </Td>
                  <Td className="text-right">
                    <Link href={`/kaset/${k.id}`} className="text-xs text-espresso-soft hover:text-rose">
                      Lihat Riwayat
                    </Link>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
