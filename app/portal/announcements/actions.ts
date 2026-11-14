"use server";

import { redirect } from "next/navigation";
import {
  deleteAnnouncement,
  postAnnouncement,
  setAnnouncementPinned,
} from "../../../lib/auth/announcements";
import { requireRole } from "../../../lib/auth/dal";
import { getStore } from "../../../lib/db";

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");

function back(notice: string): never {
  redirect(`/portal/announcements?notice=${notice}`);
}

// Each action checks the permission, then calls the tested functions in
// lib/auth/announcements.ts, which check the role in the database again.
export async function postAction(formData: FormData) {
  const actor = await requireRole("post_announcements");
  const result = await postAnnouncement(getStore(), actor, {
    title: formData.get("title"),
    body: formData.get("body"),
    pinned: formData.get("pinned") === "on",
  });
  back(result.ok ? "posted" : result.error);
}

export async function deleteAction(formData: FormData) {
  const actor = await requireRole("post_announcements");
  const result = await deleteAnnouncement(getStore(), actor, Number(text(formData.get("id"))));
  back(result.ok ? "deleted" : result.error);
}

export async function pinAction(formData: FormData) {
  const actor = await requireRole("pin_announcements");
  const pinned = text(formData.get("pinned")) === "1";
  const result = await setAnnouncementPinned(getStore(), actor, Number(text(formData.get("id"))), pinned);
  back(result.ok ? (pinned ? "pinned" : "unpinned") : result.error);
}
