# SMK MVP ARS Internasional

Website profil sederhana dengan landing page, login admin, dashboard, dan CRUD user.
Dibuat dengan Next.js, shadcn/ui (Radix), Prisma, dan SQLite.

## Menjalankan project

1. Install dependency: `npm install`
2. Salin `.env.example` menjadi `.env`.
3. Siapkan database dan Prisma Client:

   ```bash
   npm run db:push
   npm run db:generate
   ```

4. Buat akun admin. Di PowerShell, isi email dan password pilihan Anda:

   ```powershell
   $env:ADMIN_EMAIL = "admin@example.com"
   $env:ADMIN_PASSWORD = "password-pilihan-minimal-8-karakter"
   npm run db:seed
   ```

5. Jalankan aplikasi: `npm run dev`, lalu buka http://localhost:3000.

Database lokal tersimpan di `prisma/profile-company.db`. Login admin memakai
email dan password yang ditentukan saat proses seed.
