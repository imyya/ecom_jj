"use client"
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-neutral-50 px-8 py-10">{children}</main>
    </div>
  );
}

