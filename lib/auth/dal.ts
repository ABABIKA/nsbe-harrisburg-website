import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "../db/types";
import { can, type Permission } from "./roles";
import { readSessionUser } from "./session";

// The single place other pages ask "who is signed in?".
// Returns the User shape only (never the password hash).
export const getCurrentUser = cache(async (): Promise<User | null> => {
  return readSessionUser();
});

// For member pages: sends visitors who are not signed in to the sign-in page.
export async function verifySession(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// For admin-only screens and actions: signed-in users without the
// permission are sent back to the dashboard.
export async function requireRole(permission: Permission): Promise<User> {
  const user = await verifySession();
  if (!can(user.role, permission)) redirect("/portal/dashboard");
  return user;
}
