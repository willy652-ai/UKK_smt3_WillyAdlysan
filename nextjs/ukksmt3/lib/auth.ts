import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashSessionToken } from "@/lib/user-security";

export async function getAuthenticatedUser() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  return prisma.user.findUnique({
    where: { sessionTokenHash: hashSessionToken(token) },
    select: { id: true, fullname: true, email: true, role: true },
  });
}
