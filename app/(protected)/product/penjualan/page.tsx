import { prisma } from "@/lib/prisma";
import { deleteSale } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { ProductNav } from "../ProductNav";
import { SaleListClient } from "./SaleListClient";

export default async function SaleListPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { saleDate: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between ">
        <ProductNav />
        <PageHeader
          title=""
          description=""
          action={
            <LinkButton href="/product/penjualan/new">
              <FiPlus /> Penjualan
            </LinkButton>
          }
        />
      </div>

      <SaleListClient
        sales={sales.map((s) => ({
          id: s.id,
          invoiceNo: s.invoiceNo,
          customerName: s.customerName,
          saleDate: s.saleDate,
          totalAmount: s.totalAmount,
          itemCount: s.items.length,
        }))}
        onDelete={deleteSale}
      />
    </div>
  );
}
