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

type RouteContext = { params: Promise<{ id: string }> };

function isDuplicateEmail(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function isMissingUser(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}

async function getRouteUser(context: RouteContext) {
  const { id } = await context.params;
  const userId = Number(id);
  return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
}

async function getAdmin() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Silakan login untuk melanjutkan." },
        { status: 401 },
      ),
    };
  }
  if (user.role !== "admin") {
    return {
      user: null,
      response: NextResponse.json({ error: "Akses hanya untuk admin." }, { status: 403 }),
    };
  }
  return { user, response: null };
}

export async function GET(_request: Request, context: RouteContext) {
  const { response } = await getAdmin();
  if (response) return response;

  const userId = await getRouteUser(context);
  if (!userId) {
    return NextResponse.json({ error: "ID user tidak valid." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userFields,
    });
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Gagal mengambil data user:", error);
    return NextResponse.json({ error: "Gagal memuat data user." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { user: admin, response } = await getAdmin();
  if (response) return response;

  const userId = await getRouteUser(context);
  if (!userId) {
    return NextResponse.json({ error: "ID user tidak valid." }, { status: 400 });
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
  const role = "role" in body && typeof body.role === "string" ? body.role : "";

  if (
    !fullname ||
    fullname.length > 191 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 191
  ) {
    return NextResponse.json({ error: "Nama atau email tidak valid." }, { status: 400 });
  }
  if (role !== "admin" && role !== "staff") {
    return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
  }
  if (password && password.length < 8) {
    return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!currentUser) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }
    if (currentUser.id === admin?.id && role !== "admin") {
      return NextResponse.json(
        { error: "Role admin yang sedang login tidak dapat diubah." },
        { status: 400 },
      );
    }
    if (currentUser.role === "admin" && role !== "admin") {
      const adminCount = await prisma.user.count({ where: { role: "admin" } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Minimal harus ada satu akun admin." },
          { status: 400 },
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullname,
        email,
        role,
        ...(password
          ? {
              passwordHash: await hashPassword(password),
              sessionTokenHash: null,
            }
          : {}),
      },
      select: userFields,
    });
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (isDuplicateEmail(error)) {
      return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });
    }
    if (isMissingUser(error)) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }
    console.error("Gagal memperbarui user:", error);
    return NextResponse.json({ error: "Gagal memperbarui user." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { user: admin, response } = await getAdmin();
  if (response) return response;

  const userId = await getRouteUser(context);
  if (!userId) {
    return NextResponse.json({ error: "ID user tidak valid." }, { status: 400 });
  }
  if (userId === admin?.id) {
    return NextResponse.json(
      { error: "Akun admin yang sedang login tidak dapat dihapus." },
      { status: 400 },
    );
  }

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!userToDelete) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }
    if (userToDelete.role === "admin") {
      const adminCount = await prisma.user.count({ where: { role: "admin" } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Minimal harus ada satu akun admin." },
          { status: 400 },
        );
      }
    }
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isMissingUser(error)) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }
    console.error("Gagal menghapus user:", error);
    return NextResponse.json({ error: "Gagal menghapus user." }, { status: 500 });
  }
}
