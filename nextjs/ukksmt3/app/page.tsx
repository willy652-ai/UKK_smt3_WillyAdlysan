import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link className="font-bold tracking-tight text-primary" href="/">
          SMK MVP ARS
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <a className="hidden hover:text-foreground sm:inline" href="#tentang">
            Tentang
          </a>
          <a className="hidden hover:text-foreground sm:inline" href="#program">
            Program
          </a>
          <Button asChild size="sm">
            <Link href="/login">Login admin</Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[620px] max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-5 inline-flex rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Sekolah Menengah Kejuruan
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
            Siapkan masa depanmu bersama{" "}
            <span className="text-primary">SMK MVP ARS Internasional.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Belajar, berkarya, dan tumbuh menjadi generasi yang berkarakter,
            berprestasi, serta siap menghadapi dunia kerja.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#program">
                Lihat program <ArrowRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#tentang">Tentang sekolah</a>
            </Button>
          </div>
        </div>
        <div className="rounded-3xl bg-primary p-8 text-primary-foreground shadow-lg sm:p-10">
          <p className="text-sm font-medium text-primary-foreground/75">
            Belajar untuk berkarya
          </p>
          <p className="mt-4 text-3xl font-semibold leading-snug">
            Pendidikan yang dekat dengan potensi dan cita-cita.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <GraduationCap aria-hidden="true" className="mb-3 size-6" />
              <p className="text-sm font-medium">Belajar terarah</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <BookOpen aria-hidden="true" className="mb-3 size-6" />
              <p className="text-sm font-medium">Ilmu dan keterampilan</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/40" id="tentang">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">Tentang kami</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Tumbuh bersama lingkungan belajar yang positif.
            </h2>
          </div>
          <p className="leading-7 text-muted-foreground">
            SMK MVP ARS Internasional hadir untuk membantu siswa mengenali
            potensinya, mengembangkan keterampilan, dan mempersiapkan diri
            menghadapi langkah berikutnya.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16" id="program">
        <div className="flex items-center gap-3">
          <Users aria-hidden="true" className="size-6 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Program sekolah</h2>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Kegiatan belajar yang menggabungkan pengetahuan, praktik, dan
          pengembangan karakter.
        </p>
      </section>

      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        © SMK MVP ARS Internasional
      </footer>
    </main>
  );
}
