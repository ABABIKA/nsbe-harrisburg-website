import type { Role } from "../auth/roles";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "there";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parse(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  return m >= 1 && m <= 12 && d >= 1 && d <= 31 ? { y, m, d } : null;
}

// Built from the text parts so a date never shifts by a timezone.
export function formatDate(iso: string): string {
  const p = parse(iso);
  return p ? `${MONTHS[p.m - 1]} ${p.d}, ${p.y}` : iso;
}

export function dateParts(iso: string): { day: string; month: string; year: string } {
  const p = parse(iso);
  if (!p) return { day: "?", month: "", year: "" };
  return { day: String(p.d), month: MONTHS[p.m - 1].toUpperCase(), year: String(p.y) };
}

export function roleLabel(role: Role, title: string | null): string {
  if (role === "member") return "Member";
  return title ?? (role === "admin" ? "Admin" : "Officer");
}
