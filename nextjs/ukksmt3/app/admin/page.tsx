import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

// 1. Buat komponen terpisah khusus untuk mengambil data statistik
async function StatsCards() {
  const [totalUsers, adminUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "admin" } }),
  ]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Total pengguna</p>
          <Users aria-hidden="true" className="size-5 text-primary" />
        </div>
        <p className="mt-4 text-3xl font-semibold">{totalUsers}</p>
      </Card>
      <Card className="p-5">
        <p className="text-sm text-muted-foreground">Administrator</p>
        <p className="mt-4 text-3xl font-semibold">{adminUsers}</p>
      </Card>
    </div>
  );
}

// 2. Komponen loading sebagai fallback saat data sedang dimuat
function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="p-5 animate-pulse h-28 bg-muted/50" />
      <Card className="p-5 animate-pulse h-28 bg-muted/50" />
    </div>
  );
}

// 3. Komponen utama halaman Dashboard
export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-medium text-muted-foreground">Ringkasan</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Dashboard admin</h1>
      <p className="mt-2 text-muted-foreground">
        Selamat datang di halaman pengelolaan website sekolah.
      </p>

      {/* Bungkus bagian yang melakukan query database dengan Suspense */}
      <div className="mt-8">
        <Suspense fallback={<StatsSkeleton />}>
          <StatsCards />
        </Suspense>
      </div>

      <Card className="mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="font-semibold">Kelola akun pengguna</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tambah, ubah, dan hapus akun admin atau staff.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/user-management">
            Buka user management <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </Card>
    </div>
  );
}