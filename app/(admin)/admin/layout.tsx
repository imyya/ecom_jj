import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AdminSectionLayout({ children }: { children: React.ReactNode }) {
    const admin = await getCurrentAdmin()

  return (
    <div className="flex min-h-screen">
      <AdminSidebar name={admin?.name}/>
      <main className="flex-1 bg-neutral-50 px-8 py-10">{children}</main>
    </div>
  );
}

