import Sidebar from "@/components/Sidebar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:flex min-h-screen bg-cream">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-10 md:py-10">{children}</div>
      </main>
    </div>
  );
}
