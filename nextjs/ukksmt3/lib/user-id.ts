import { prisma } from "@/lib/prisma";

const PREFIX = {
  admin: "ADM",
  staff: "STF",
} as const;

type UserRole = keyof typeof PREFIX;

export async function generateUserId(role: UserRole): Promise<string> {
  const prefix = PREFIX[role];
  const users = await prisma.user.findMany({
    where: { role },
    select: { id: true },
  });
  const { lastNumber, legacyCount } = users.reduce(
    (counts, user) => {
      const id = String(user.id);
      const suffix = id.startsWith(prefix) ? id.slice(prefix.length) : "";
      if (!/^\d+$/.test(suffix)) {
        if (/^\d+$/.test(id)) counts.legacyCount += 1;
        return counts;
      }
      const number = Number(suffix);
      if (Number.isSafeInteger(number)) counts.lastNumber = Math.max(counts.lastNumber, number);
      return counts;
    },
    { lastNumber: 0, legacyCount: 0 },
  );
  const next = Math.max(lastNumber, legacyCount) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}