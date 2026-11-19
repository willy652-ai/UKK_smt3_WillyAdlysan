import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, verifyPassword } from "@/lib/user-security";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
  }

  const email =
    "email" in body && typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "";
  const password =
    "password" in body && typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
    }

    const session = createSessionToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { sessionTokenHash: session.tokenHash },
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
    response.cookies.set("auth_token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch (error) {
    console.error("Login gagal:", error);
    return NextResponse.json({ error: "Login gagal. Periksa konfigurasi database." }, { status: 500 });
  }
}
