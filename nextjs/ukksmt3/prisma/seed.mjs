import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";

const scrypt = promisify(scryptCallback);
const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("ADMIN_EMAIL harus diisi dengan alamat email yang valid.");
  }
  if (!password || password.length < 8) {
    throw new Error("ADMIN_PASSWORD harus diisi dan minimal 8 karakter.");
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log(`Akun ${email} sudah ada; tidak ada perubahan.`);
    return;
  }

  const admins = await prisma.user.findMany({
    where: { id: { startsWith: "ADM" } },
    select: { id: true },
  });
  const nextAdminNumber =
    admins.reduce((maximum, admin) => {
      const suffix = admin.id.slice(3);
      if (!/^\d+$/.test(suffix)) return maximum;
      const number = Number(suffix);
      return Number.isSafeInteger(number) ? Math.max(maximum, number) : maximum;
    }, 0) + 1;

  await prisma.user.create({
    data: {
      id: `ADM${String(nextAdminNumber).padStart(4, "0")}`,
      fullname: "Administrator",
      email,
      passwordHash: await hashPassword(password),
      role: "admin",
    },
  });
  console.log(`Akun admin ${email} berhasil dibuat.`);
}

main()
  .catch((error) => {
    console.error("Gagal membuat akun admin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
