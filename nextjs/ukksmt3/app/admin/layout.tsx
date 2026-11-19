import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { getAuthenticatedUser } from "@/lib/auth";

export const instant = false;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      <AdminNav fullname={user.fullname} />
      <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
    </div>
  );
}
