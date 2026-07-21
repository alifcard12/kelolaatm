import Sidebar from "@/components/Sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="md:flex min-h-screen bg-cream print:block print:bg-white print:min-h-0">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <main className="flex-1 min-w-0 print:!min-w-0">
        <div className="max-w-6xl mx-auto px-4 py-2 pb-24 md:px-10 md:py-10 md:pb-10 print:max-w-none print:p-0">
          {children}
        </div>
      </main>
    </div>
  );
}
