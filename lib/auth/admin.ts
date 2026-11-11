import type { Store, User } from "../db/types";
import { can, isRole, type Permission } from "./roles";

export type AdminResult =
  | { ok: true; user: User }
  | { ok: false; error: "forbidden" | "not_found" | "invalid" | "last_admin" };

const MAX_TOKENS = 100000;
const MAX_TITLE = 60;

function publicUser(r: User & { passwordHash?: string }): User {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    title: r.title,
    tokens: r.tokens,
  };
}

// Permission comes from the role stored in the database right now, not from
// the `actor` object the caller holds, so a demoted admin loses power at once.
async function allowed(store: Store, actor: User, permission: Permission) {
  const current = await store.findUserById(actor.id);
  return current !== null && can(current.role, permission);
}

export async function setMemberTokens(
  store: Store,
  actor: User,
  targetId: number,
  tokens: number,
): Promise<AdminResult> {
  if (!(await allowed(store, actor, "edit_tokens"))) return { ok: false, error: "forbidden" };
  if (!Number.isInteger(tokens) || tokens < 0 || tokens > MAX_TOKENS) {
    return { ok: false, error: "invalid" };
  }
  const updated = await store.updateUser(targetId, { tokens });
  return updated ? { ok: true, user: publicUser(updated) } : { ok: false, error: "not_found" };
}

export async function setMemberRole(
  store: Store,
  actor: User,
  targetId: number,
  role: unknown,
): Promise<AdminResult> {
  if (!(await allowed(store, actor, "edit_roles"))) return { ok: false, error: "forbidden" };
  if (!isRole(role)) return { ok: false, error: "invalid" };
  const target = await store.findUserById(targetId);
  if (!target) return { ok: false, error: "not_found" };
  if (
    target.role === "admin" &&
    role !== "admin" &&
    (await store.countUsersWithRole("admin")) <= 1
  ) {
    return { ok: false, error: "last_admin" };
  }
  const updated = await store.updateUser(targetId, { role });
  return updated ? { ok: true, user: publicUser(updated) } : { ok: false, error: "not_found" };
}

export async function setMemberTitle(
  store: Store,
  actor: User,
  targetId: number,
  title: string | null,
): Promise<AdminResult> {
  if (!(await allowed(store, actor, "edit_titles"))) return { ok: false, error: "forbidden" };
  const cleaned = title === null ? null : title.trim();
  if (cleaned !== null && cleaned.length > MAX_TITLE) return { ok: false, error: "invalid" };
  const updated = await store.updateUser(targetId, { title: cleaned ? cleaned : null });
  return updated ? { ok: true, user: publicUser(updated) } : { ok: false, error: "not_found" };
}
