"use server";

import { redirect } from "next/navigation";
import { signIn, signUp, type FieldErrors } from "../../lib/auth/accounts";
import { DEFAULT_AFTER_LOGIN, safeNextPath } from "../../lib/auth/redirect";
import { createSession, deleteSession } from "../../lib/auth/session";
import { getStore } from "../../lib/db";

// `values` echoes back what the person typed (never the password) so the
// form can keep it after an error.
export type FormState =
  | {
      errors?: FieldErrors;
      message?: string;
      values?: { name?: string; email?: string; joinCode?: string };
    }
  | undefined;

const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v : "");

// Only the named form fields are read. A posted "role" or "tokens" is ignored.
export async function signupAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await signUp(
    getStore(),
    {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      joinCode: formData.get("joinCode"),
    },
    { requiredJoinCode: process.env.JOIN_CODE?.trim() || undefined },
  );
  if (!result.ok) {
    return {
      errors: result.errors,
      values: {
        name: text(formData.get("name")),
        email: text(formData.get("email")),
        joinCode: text(formData.get("joinCode")),
      },
    };
  }
  await createSession(result.user.id);
  redirect(DEFAULT_AFTER_LOGIN);
}

export async function loginAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await signIn(getStore(), {
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!result.ok) {
    return { message: result.message, values: { email: text(formData.get("email")) } };
  }
  await createSession(result.user.id);
  redirect(safeNextPath(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/");
}
