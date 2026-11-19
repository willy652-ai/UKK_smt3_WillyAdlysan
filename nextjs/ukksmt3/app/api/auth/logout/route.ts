import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSessionToken } from "@/lib/user-security";

export async function POST() {
  const token = (await cookies()).get("auth_token")?.value;
  const response = NextResponse.json({ success: true });
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  if (token) {
    try {
      await prisma.user.updateMany({
        where: { sessionTokenHash: hashSessionToken(token) },
        data: { sessionTokenHash: null },
      });
    } catch (error) {
      console.error("Logout gagal:", error);
      return NextResponse.json(
        { error: "Sesi tidak dapat dihapus. Silakan coba lagi." },
        { status: 500, headers: response.headers },
      );
    }
  }

  return response;
}
