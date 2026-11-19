"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Login gagal.");

      setPassword("");
      router.replace(result.user.role === "admin" ? "/admin" : "/");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login gagal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border bg-card shadow-sm md:min-h-[560px] md:grid-cols-2">
        <section className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
          <Link className="font-semibold tracking-tight" href="/">
            SMK MVP ARS Internasional
          </Link>
          <div>
            <p className="text-sm text-primary-foreground/75">Portal pengelola</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight">
              Selamat datang kembali.
            </h1>
            <p className="mt-4 leading-7 text-primary-foreground/80">
              Masuk untuk mengelola akun pengguna website sekolah.
            </p>
          </div>
          <p className="text-xs text-primary-foreground/60">SMK MVP ARS Internasional</p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <Card className="w-full border-0 p-0 shadow-none">
            <div className="mb-8">
              <Link className="text-sm font-semibold text-primary md:hidden" href="/">
                SMK MVP ARS Internasional
              </Link>
              <p className="mt-5 text-sm font-medium text-primary">Login admin</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Masuk akun</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Gunakan email dan password administrator.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    autoComplete="username"
                    className="pl-9"
                    id="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <KeyRound
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    autoComplete="current-password"
                    className="pl-9 pr-10"
                    id="password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan password"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                  />
                  <button
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((visible) => !visible)}
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" className="size-4" />
                    ) : (
                      <Eye aria-hidden="true" className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
                {isSubmitting ? "Memeriksa..." : "Masuk"}
              </Button>
            </form>

            <Link
              className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground"
              href="/"
            >
              Kembali ke halaman utama
            </Link>
          </Card>
        </section>
      </div>
    </main>
  );
}
