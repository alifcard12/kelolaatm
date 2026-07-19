import { prisma } from "@/lib/prisma";
import { deleteProduct } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { ProductNav } from "../ProductNav";
import { ProductListClient } from "../ProductListClient";

export default async function ProductListPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between ">
        <ProductNav />
        <PageHeader
          title=""
          description=""
          action={
            <LinkButton href="/product/new">
              <FiPlus /> Product
            </LinkButton>
          }
        />
      </div>

      <ProductListClient products={products} onDelete={deleteProduct} />
    </div>
  );
}
