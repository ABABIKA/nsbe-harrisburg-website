import type { AnnouncementRecord, Store, User } from "../db/types";
import { can } from "./roles";

export type AnnouncementResult =
  | { ok: true; announcement: AnnouncementRecord }
  | { ok: false; error: "forbidden" | "invalid" | "not_found" };

const MAX_TITLE = 100;
const MAX_BODY = 1000;

// Permissions come from the role stored in the database right now, not from
// the `actor` object the caller holds.
async function currentRole(store: Store, actor: User) {
  return (await store.findUserById(actor.id))?.role ?? null;
}

export async function postAnnouncement(
  store: Store,
  actor: User,
  input: { title: unknown; body: unknown; pinned?: unknown },
): Promise<AnnouncementResult> {
  const role = await currentRole(store, actor);
  if (!role || !can(role, "post_announcements")) return { ok: false, error: "forbidden" };
  if (typeof input.title !== "string" || typeof input.body !== "string") {
    return { ok: false, error: "invalid" };
  }
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || title.length > MAX_TITLE || !body || body.length > MAX_BODY) {
    return { ok: false, error: "invalid" };
  }
  // Only admins can pin. An officer's pin request is ignored, not an error.
  const pinned = input.pinned === true && can(role, "pin_announcements");
  const announcement = await store.createAnnouncement({ authorId: actor.id, title, body, pinned });
  return { ok: true, announcement };
}

export async function deleteAnnouncement(
  store: Store,
  actor: User,
  id: number,
): Promise<{ ok: true } | { ok: false; error: "forbidden" | "not_found" }> {
  const role = await currentRole(store, actor);
  if (!role) return { ok: false, error: "forbidden" };
  const isAdmin = can(role, "delete_any_announcement");
  if (!isAdmin && !can(role, "post_announcements")) return { ok: false, error: "forbidden" };
  const existing = await store.findAnnouncement(id);
  if (!existing) return { ok: false, error: "not_found" };
  if (!isAdmin && existing.authorId !== actor.id) return { ok: false, error: "forbidden" };
  await store.deleteAnnouncement(id);
  return { ok: true };
}

export async function setAnnouncementPinned(
  store: Store,
  actor: User,
  id: number,
  pinned: boolean,
): Promise<AnnouncementResult> {
  const role = await currentRole(store, actor);
  if (!role || !can(role, "pin_announcements")) return { ok: false, error: "forbidden" };
  const updated = await store.setAnnouncementPinned(id, pinned);
  return updated ? { ok: true, announcement: updated } : { ok: false, error: "not_found" };
}
