"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type UserFormProps = {
  userId?: string;
};

type ManagedUser = {
  id: string;
  fullname: string;
  email: string;
  role: string;
};

export function UserForm({ userId }: UserFormProps) {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let active = true;
    async function loadUser() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Gagal memuat user.");
        const user = result.user as ManagedUser;
        if (active) {
          setFullname(user.fullname);
          setEmail(user.email);
          setRole(user.role);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Gagal memuat user.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadUser();
    return () => {
      active = false;
    };
  }, [userId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const response = await fetch(userId ? `/api/users/${userId}` : "/api/users", {
        method: userId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: fullname.trim(),
          email: email.trim(),
          role,
          ...(password ? { password } : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Gagal menyimpan user.");
      router.push("/admin/user-management");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan user.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">User management</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {userId ? "Edit user" : "Tambah user"}
          </h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/user-management">
            <ArrowLeft aria-hidden="true" /> Kembali
          </Link>
        </Button>
      </div>

      <Card className="p-5 sm:p-6">
        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {isLoading ? (
          <p className="py-6 text-sm text-muted-foreground">Memuat user...</p>
        ) : (
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="fullname">
                Nama lengkap
              </label>
              <Input
                autoComplete="name"
                id="fullname"
                maxLength={191}
                onChange={(event) => setFullname(event.target.value)}
                required
                value={fullname}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input
                autoComplete="email"
                id="email"
                maxLength={191}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="password">
                {userId ? "Password baru (opsional)" : "Password"}
              </label>
              <Input
                autoComplete="new-password"
                id="password"
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={userId ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"}
                required={!userId}
                type="password"
                value={password}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="role">
                Role
              </label>
              <select
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                id="role"
                onChange={(event) => setRole(event.target.value)}
                value={role}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button asChild disabled={isSaving} variant="outline">
                <Link href="/admin/user-management">Batal</Link>
              </Button>
              <Button disabled={isSaving} type="submit">
                {isSaving ? "Menyimpan..." : userId ? "Simpan perubahan" : "Buat user"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
