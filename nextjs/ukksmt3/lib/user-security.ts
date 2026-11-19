import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, encodedHash: string) {
  const [algorithm, saltHex, digestHex, extra] = encodedHash.split(":");
  if (
    algorithm !== "scrypt" ||
    !saltHex ||
    !digestHex ||
    extra !== undefined ||
    !/^[\da-f]+$/i.test(saltHex) ||
    !/^[\da-f]+$/i.test(digestHex)
  ) {
    return false;
  }

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(digestHex, "hex");
  if (salt.length !== 16 || expected.length !== 64) return false;

  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return timingSafeEqual(actual, expected);
}

export function createSessionToken() {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashSessionToken(token) };
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
