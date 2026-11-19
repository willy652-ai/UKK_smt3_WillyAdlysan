"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type User = {
  id: string | number;
  displayId: string;
  fullname: string;
  email: string;
  role: string;
  createdAt: string;
};

async function fetchUsers(): Promise<User[]> {
  const response = await fetch("/api/users");
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Gagal memuat user.");
  return result.users;
}

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Gagal memuat user.");
      setUsers(result.users);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Gagal memuat user.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchUsers()
      .then((result) => {
        if (active) setUsers(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Gagal memuat user.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function deleteUser(user: User) {
    if (!window.confirm(`Hapus user ${user.fullname}?`)) return;
    setDeletingId(user.id);
    setError("");
    try {
      const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Gagal menghapus user.");
      await loadUsers();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Gagal menghapus user.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Pengaturan akun</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">User management</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tambah, ubah, dan hapus akun pengguna.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/user-management/new">
            <Plus aria-hidden="true" />
            Tambah user
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        {error && (
          <p className="border-b px-5 py-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell className="py-8 text-center text-muted-foreground" colSpan={6}>
                    Memuat user...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell className="py-8 text-center text-muted-foreground" colSpan={6}>
                    Belum ada user.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.displayId}</TableCell>
                    <TableCell className="font-medium">{user.fullname}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          aria-label={`Edit ${user.fullname}`}
                          asChild
                          size="icon"
                          variant="ghost"
                        >
                          <Link href={`/admin/user-management/${user.id}`}>
                            <Pencil aria-hidden="true" />
                          </Link>
                        </Button>
                        <Button
                          aria-label={`Hapus ${user.fullname}`}
                          disabled={deletingId !== null}
                          onClick={() => void deleteUser(user)}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Button
        className="mt-4"
        disabled={isLoading}
        onClick={() => {
          setIsLoading(true);
          setError("");
          router.refresh();
          void loadUsers();
        }}
        variant="outline"
      >
        Muat ulang
      </Button>
    </div>
  );
}
