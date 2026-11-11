// One-time setup: create the first admin (president or vice president), or
// promote an existing account to admin.
//
//   npx tsx --env-file-if-exists=.env scripts/create-admin.ts "<name>" "<email>" "<password>" "<title>"
//
// The password is never printed.
import { pathToFileURL } from "node:url";
import { normalizeEmail } from "../lib/auth/accounts";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, hashPassword } from "../lib/auth/password";
import type { Store, UserRecord } from "../lib/db/types";

export async function createAdmin(
  store: Store,
  input: { name: string; email: string; password: string; title: string },
): Promise<UserRecord> {
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) throw new Error("A valid email is required.");
  if (input.password.length < MIN_PASSWORD_LENGTH || input.password.length > MAX_PASSWORD_LENGTH) {
    throw new Error(
      `Password must be ${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_LENGTH} characters.`,
    );
  }
  const title = input.title.trim() || null;

  const existing = await store.findUserByEmail(email);
  if (existing) {
    // Keep the existing password, id, and tokens; only raise the role.
    return (await store.updateUser(existing.id, { role: "admin", title }))!;
  }
  return store.createUser({
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(input.password),
    role: "admin",
    title,
  });
}

async function main() {
  const [name, email, password, title] = process.argv.slice(2);
  if (!name || !email || !password || !title) {
    console.error('Usage: create-admin.ts "<name>" "<email>" "<password>" "<title>"');
    process.exit(1);
  }
  const { getStore } = await import("../lib/db");
  const user = await createAdmin(getStore(), { name, email, password, title });
  console.log(`Admin ready: ${user.email} (role ${user.role}, title ${user.title ?? "none"})`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
