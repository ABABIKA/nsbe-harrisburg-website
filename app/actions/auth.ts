"use server";

import { redirect } from "next/navigation";
import { signIn, signUp, type FieldErrors } from "../../lib/auth/accounts";
import { DEFAULT_AFTER_LOGIN, safeNextPath } from "../../lib/auth/redirect";
import { createSession, deleteSession } from "../../lib/auth/session";
import { getStore } from "../../lib/db";

export type FormState = { errors?: FieldErrors; message?: string } | undefined;

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
  if (!result.ok) return { errors: result.errors };
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
  if (!result.ok) return { message: result.message };
  await createSession(result.user.id);
  redirect(safeNextPath(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/");
}
