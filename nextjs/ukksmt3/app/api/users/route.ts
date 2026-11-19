import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/user-security";

const userFields = {
  id: true,
  fullname: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

function isDuplicateEmail(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Silakan login untuk melanjutkan." }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Akses hanya untuk admin." }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: userFields,
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Gagal mengambil daftar user:", error);
    return NextResponse.json({ error: "Gagal memuat daftar user." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedUser();
  if (!admin) {
    return NextResponse.json({ error: "Silakan login untuk melanjutkan." }, { status: 401 });
  }
  if (admin.role !== "admin") {
    return NextResponse.json({ error: "Akses hanya untuk admin." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Data user tidak valid." }, { status: 400 });
  }

  const fullname = "fullname" in body && typeof body.fullname === "string" ? body.fullname.trim() : "";
  const email =
    "email" in body && typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "";
  const password = "password" in body && typeof body.password === "string" ? body.password : "";
  const role = "role" in body && typeof body.role === "string" ? body.role : "staff";

  if (
    !fullname ||
    fullname.length > 191 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 191
  ) {
    return NextResponse.json({ error: "Nama atau email tidak valid." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
  }
  if (role !== "admin" && role !== "staff") {
    return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
  }

  try {
    const createdUser = await prisma.user.create({
      data: {
        fullname,
        email,
        passwordHash: await hashPassword(password),
        role,
      },
      select: userFields,
    });
    return NextResponse.json({ user: createdUser }, { status: 201 });
  } catch (error) {
    if (isDuplicateEmail(error)) {
      return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });
    }
    console.error("Gagal membuat user:", error);
    return NextResponse.json({ error: "Gagal membuat user." }, { status: 500 });
  }
}
