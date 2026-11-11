import { EmailTakenError, type Store, type User, type UserRecord } from "../db/types";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  hashPassword,
  verifyPassword,
} from "./password";

export type FieldErrors = {
  name?: string[];
  email?: string[];
  password?: string[];
  joinCode?: string[];
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Never hand the password hash to callers outside the store.
function toUser(record: UserRecord): User {
  const { passwordHash: _unused, ...user } = record;
  void _unused;
  return user;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

function validEmail(email: string): boolean {
  if (email.length > 254) return false;
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  return local.length > 0 && domain.includes(".") && !domain.startsWith(".") && !domain.endsWith(".");
}

export async function signUp(
  store: Store,
  input: { name: unknown; email: unknown; password: unknown; joinCode?: unknown },
  opts: { requiredJoinCode?: string } = {},
): Promise<{ ok: true; user: User } | { ok: false; errors: FieldErrors }> {
  const name = str(input.name).trim();
  const email = normalizeEmail(str(input.email));
  const password = str(input.password);
  const errors: FieldErrors = {};

  if (name.length < 2 || name.length > 80) {
    errors.name = ["Enter your name (2 to 80 characters)."];
  }
  if (!validEmail(email)) {
    errors.email = ["Enter a valid email address."];
  }
  const pwProblems: string[] = [];
  if (password.length < MIN_PASSWORD_LENGTH) {
    pwProblems.push(`Be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    pwProblems.push(`Be no more than ${MAX_PASSWORD_LENGTH} characters long.`);
  }
  if (!/[a-zA-Z]/.test(password)) pwProblems.push("Contain at least one letter.");
  if (!/[0-9]/.test(password)) pwProblems.push("Contain at least one number.");
  if (pwProblems.length) errors.password = pwProblems;

  if (opts.requiredJoinCode && str(input.joinCode).trim() !== opts.requiredJoinCode) {
    errors.joinCode = ["That chapter join code is not correct."];
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  try {
    const record = await store.createUser({
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "member",
      title: null,
    });
    return { ok: true, user: toUser(record) };
  } catch (err) {
    if (err instanceof EmailTakenError) {
      return { ok: false, errors: { email: ["An account with this email already exists."] } };
    }
    throw err;
  }
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map<string, number[]>();

export function resetRateLimits(): void {
  failures.clear();
}

export function rateLimitEntries(): number {
  return failures.size;
}

function recentFailures(email: string, now: number): number[] {
  const recent = (failures.get(email) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length) failures.set(email, recent);
  else failures.delete(email);
  return recent;
}

const BAD_LOGIN = { ok: false as const, message: "Incorrect email or password." };

let dummyHash: Promise<string> | undefined;

export async function signIn(
  store: Store,
  input: { email: unknown; password: unknown },
  opts: { now?: number } = {},
): Promise<{ ok: true; user: User } | { ok: false; message: string }> {
  const now = opts.now ?? Date.now();
  const email = normalizeEmail(str(input.email));
  const password = str(input.password);

  // No real email is this long; refusing early keeps attacker-chosen keys
  // out of the in-memory table.
  if (email.length > 254) return BAD_LOGIN;

  const recent = recentFailures(email, now);
  if (recent.length >= MAX_FAILURES) {
    return { ok: false, message: "Too many attempts. Try again in a few minutes." };
  }
  // Count this attempt now, before the slow password check, so parallel
  // guesses cannot all slip under the limit. A success clears it below.
  failures.set(email, [...recent, now]);

  const record = await store.findUserByEmail(email);
  let valid = false;
  if (password.length <= MAX_PASSWORD_LENGTH) {
    if (record) {
      valid = await verifyPassword(password, record.passwordHash);
    } else {
      // Same work as a real check so timing does not reveal unknown emails.
      dummyHash ??= hashPassword("dummy-password-1");
      await verifyPassword(password, await dummyHash);
    }
  }

  if (!record || !valid) return BAD_LOGIN;
  failures.delete(email);
  return { ok: true, user: toUser(record) };
}
