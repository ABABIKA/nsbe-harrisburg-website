export type Role = "member" | "officer" | "admin";

export type Permission =
  | "edit_tokens"
  | "edit_roles"
  | "edit_titles"
  | "view_eboard"
  | "post_announcements"
  | "pin_announcements"
  | "delete_any_announcement";

const ROLES: readonly Role[] = ["member", "officer", "admin"];

// One table decides who can do what. To give officers a power later,
// add it to the officer list here and nowhere else.
const PERMISSIONS: Record<Role, readonly Permission[]> = {
  member: [],
  officer: ["view_eboard", "post_announcements"],
  admin: [
    "edit_tokens",
    "edit_roles",
    "edit_titles",
    "view_eboard",
    "post_announcements",
    "pin_announcements",
    "delete_any_announcement",
  ],
};

export function can(role: Role, permission: Permission): boolean {
  return PERMISSIONS[role].includes(permission);
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
