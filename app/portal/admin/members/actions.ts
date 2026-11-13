"use server";

import { redirect } from "next/navigation";
import { setMemberRole, setMemberTitle, setMemberTokens } from "../../../../lib/auth/admin";
import { requireRole } from "../../../../lib/auth/dal";
import { getStore } from "../../../../lib/db";

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");

// Every action re-checks that the person is an admin, then calls the tested
// admin functions, which check again against the database.
function back(formData: FormData, notice: string): never {
  const params = new URLSearchParams();
  const q = text(formData.get("q")).slice(0, 100);
  if (q) params.set("q", q);
  params.set("notice", notice);
  redirect(`/portal/admin/members?${params.toString()}`);
}

export async function saveTokens(formData: FormData) {
  const actor = await requireRole("edit_tokens");
  const raw = text(formData.get("tokens")).trim();
  const tokens = raw === "" ? Number.NaN : Number(raw);
  const result = await setMemberTokens(getStore(), actor, Number(text(formData.get("id"))), tokens);
  back(formData, result.ok ? "tokens_saved" : result.error);
}

export async function saveRole(formData: FormData) {
  const actor = await requireRole("edit_roles");
  const result = await setMemberRole(getStore(), actor, Number(text(formData.get("id"))), text(formData.get("role")));
  back(formData, result.ok ? "role_saved" : result.error);
}

export async function saveTitle(formData: FormData) {
  const actor = await requireRole("edit_titles");
  const result = await setMemberTitle(getStore(), actor, Number(text(formData.get("id"))), text(formData.get("title")));
  back(formData, result.ok ? "title_saved" : result.error);
}
