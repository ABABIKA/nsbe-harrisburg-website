export const DEFAULT_AFTER_LOGIN = "/portal/dashboard";

// Only same-site paths inside /portal may be used as a post-login destination.
// Anything else (other sites, protocol-relative links, backslash tricks)
// falls back to the dashboard so the login page cannot be used for phishing.
export function safeNextPath(next: unknown): string {
  if (typeof next !== "string") return DEFAULT_AFTER_LOGIN;
  if (!/^\/portal(?:[/?#]|$)/.test(next)) return DEFAULT_AFTER_LOGIN;
  const path = next.split(/[?#]/)[0];
  if (path.includes("//") || path.includes("\\") || path.includes(":")) {
    return DEFAULT_AFTER_LOGIN;
  }
  return next;
}
