import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

const KEY_LENGTH = 64;

function derive(plain: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(plain, salt, KEY_LENGTH, (err, key) =>
      err ? reject(err) : resolve(key),
    );
  });
}

function assertLength(plain: string) {
  if (plain.length > MAX_PASSWORD_LENGTH) throw new Error("password_too_long");
}

export async function hashPassword(plain: string): Promise<string> {
  assertLength(plain);
  const salt = randomBytes(16);
  const key = await derive(plain, salt);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  assertLength(plain);
  const [scheme, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  if (expected.length !== KEY_LENGTH) return false;
  const actual = await derive(plain, Buffer.from(saltHex, "hex"));
  return timingSafeEqual(actual, expected);
}
