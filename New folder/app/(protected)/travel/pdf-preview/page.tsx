import { FiDownload, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

export default async function TravelPdfPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids: idsParam } = await searchParams;
  const ids = idsParam ?? "";
  const query = ids ? `?ids=${ids}` : "";

  return (
    <div className="flex flex-col h-[calc(100vh-1rem)] md:h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between gap-3 pb-3">
        <Link
          href="/travel"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-espresso-soft hover:text-espresso transition-colors"
        >
          <FiArrowLeft /> Kembali
        </Link>

        <a
          href={`/travel/pdf${query}`}
          className="inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-150 text-sm px-4 py-2.5 gap-2 bg-espresso text-paper hover:bg-espresso/90"
        >
          <FiDownload /> Download PDF
        </a>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-taupe-dark/60 bg-gray-100">
        <iframe
          src={`/travel/pdf${query}${query ? "&" : "?"}inline=1`}
          className="w-full h-full"
          title="Preview Invoice Travel"
        />
      </div>
    </div>
  );
}
