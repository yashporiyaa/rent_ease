import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f6f8f7]">
      <Sidebar />
      <main className="flex-1 ml-64">
        <Header />
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
