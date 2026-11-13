import { beforeEach, describe, expect, it } from "vitest";
import { SqliteStore } from "../db/sqlite";
import type { User } from "../db/types";
import type { Role } from "./roles";
import { deleteAnnouncement, postAnnouncement, setAnnouncementPinned } from "./announcements";

let store: SqliteStore;

async function make(email: string, role: Role): Promise<User> {
  const r = await store.createUser({ name: email, email, passwordHash: "h", role, title: null });
  const { passwordHash: _p, ...user } = r;
  void _p;
  return user;
}

beforeEach(() => {
  store = new SqliteStore(":memory:");
});

describe("postAnnouncement", () => {
  it("lets officers and admins post, and trims the text", async () => {
    const officer = await make("o@x.com", "officer");
    const r = await postAnnouncement(store, officer, { title: "  GBM moved  ", body: " Room change. " });
    expect(r.ok && r.announcement.title).toBe("GBM moved");
    expect(r.ok && r.announcement.body).toBe("Room change.");
    const admin = await make("a@x.com", "admin");
    expect((await postAnnouncement(store, admin, { title: "x", body: "y" })).ok).toBe(true);
  });

  it("refuses members", async () => {
    const member = await make("m@x.com", "member");
    expect(await postAnnouncement(store, member, { title: "x", body: "y" })).toEqual({ ok: false, error: "forbidden" });
    expect(await store.listAnnouncements()).toEqual([]);
  });

  it("uses the stored role, so a demoted officer cannot post", async () => {
    const officer = await make("o@x.com", "officer");
    await store.updateUser(officer.id, { role: "member" });
    expect(await postAnnouncement(store, officer, { title: "x", body: "y" })).toEqual({ ok: false, error: "forbidden" });
  });

  it("rejects empty, over-long, and non-text input", async () => {
    const officer = await make("o@x.com", "officer");
    for (const bad of [
      { title: "", body: "y" },
      { title: "   ", body: "y" },
      { title: "x", body: "" },
      { title: "x".repeat(101), body: "y" },
      { title: "x", body: "y".repeat(1001) },
      { title: 5, body: "y" },
      { title: "x", body: null },
    ]) {
      expect(await postAnnouncement(store, officer, bad as never)).toEqual({ ok: false, error: "invalid" });
    }
  });

  it("only admins can pin at posting time; an officer's pin request is ignored", async () => {
    const officer = await make("o@x.com", "officer");
    const admin = await make("a@x.com", "admin");
    const a = await postAnnouncement(store, officer, { title: "x", body: "y", pinned: true });
    expect(a.ok && a.announcement.pinned).toBe(false);
    const b = await postAnnouncement(store, admin, { title: "x", body: "y", pinned: true });
    expect(b.ok && b.announcement.pinned).toBe(true);
  });
});

describe("deleteAnnouncement", () => {
  it("lets an officer delete their own post but not someone else's", async () => {
    const o1 = await make("o1@x.com", "officer");
    const o2 = await make("o2@x.com", "officer");
    const post = await postAnnouncement(store, o1, { title: "x", body: "y" });
    if (!post.ok) throw new Error("setup");
    expect(await deleteAnnouncement(store, o2, post.announcement.id)).toEqual({ ok: false, error: "forbidden" });
    expect(await deleteAnnouncement(store, o1, post.announcement.id)).toEqual({ ok: true });
    expect(await store.findAnnouncement(post.announcement.id)).toBeNull();
  });

  it("lets an admin delete anyone's post", async () => {
    const o = await make("o@x.com", "officer");
    const admin = await make("a@x.com", "admin");
    const post = await postAnnouncement(store, o, { title: "x", body: "y" });
    if (!post.ok) throw new Error("setup");
    expect(await deleteAnnouncement(store, admin, post.announcement.id)).toEqual({ ok: true });
  });

  it("refuses members and reports unknown posts", async () => {
    const member = await make("m@x.com", "member");
    const admin = await make("a@x.com", "admin");
    expect(await deleteAnnouncement(store, member, 1)).toEqual({ ok: false, error: "forbidden" });
    expect(await deleteAnnouncement(store, admin, 999)).toEqual({ ok: false, error: "not_found" });
  });
});

describe("setAnnouncementPinned", () => {
  it("lets admins pin and refuses officers", async () => {
    const o = await make("o@x.com", "officer");
    const admin = await make("a@x.com", "admin");
    const post = await postAnnouncement(store, o, { title: "x", body: "y" });
    if (!post.ok) throw new Error("setup");
    expect(await setAnnouncementPinned(store, o, post.announcement.id, true)).toEqual({ ok: false, error: "forbidden" });
    const r = await setAnnouncementPinned(store, admin, post.announcement.id, true);
    expect(r.ok && r.announcement.pinned).toBe(true);
    expect(await setAnnouncementPinned(store, admin, 999, true)).toEqual({ ok: false, error: "not_found" });
  });
});
