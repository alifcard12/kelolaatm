import Sidebar from "@/components/Sidebar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-slate-50 min-h-screen">{children}</main>
    </div>
  );
}
