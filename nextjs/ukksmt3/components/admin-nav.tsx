"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminNavProps = {
  fullname: string;
};

export function AdminNav({ fullname }: AdminNavProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    setError("");
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error ?? "Gagal keluar.");
      }
      router.replace("/login");
      router.refresh();
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Gagal keluar.");
      setIsLoggingOut(false);
    }
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b bg-card md:min-h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="border-b px-5 py-5">
        <p className="font-semibold tracking-tight">SMK MVP ARS</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">{fullname}</p>
      </div>
      <nav aria-label="Menu admin" className="flex gap-2 p-3 md:flex-1 md:flex-col">
        <Button asChild className="justify-start" variant="ghost">
          <Link href="/admin">
            <LayoutDashboard aria-hidden="true" />
            Dashboard
          </Link>
        </Button>
        <Button asChild className="justify-start" variant="ghost">
          <Link href="/admin/user-management">
            <Users aria-hidden="true" />
            User management
          </Link>
        </Button>
      </nav>
      <div className="flex items-center justify-between gap-3 border-t p-4">
        {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
        <Button
          className="ml-auto"
          disabled={isLoggingOut}
          onClick={() => void logout()}
          variant="outline"
        >
          <LogOut aria-hidden="true" />
          {isLoggingOut ? "Keluar..." : "Keluar"}
        </Button>
      </div>
    </aside>
  );
}
