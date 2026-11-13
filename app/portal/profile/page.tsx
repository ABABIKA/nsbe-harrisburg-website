import PageHeader from "../../../components/portal/PageHeader";
import { card } from "../../../components/portal/styles";
import { verifySession } from "../../../lib/auth/dal";
import { roleLabel } from "../../../lib/portal/format";

export const metadata = { title: "Member Profile | NSBE Penn State Harrisburg" };

export default async function ProfilePage() {
  const user = await verifySession();
  const rows: [string, string][] = [
    ["Name", user.name],
    ["Email", user.email],
    ["Role", user.role === "member" ? "Member" : user.role === "officer" ? "Officer" : "Admin"],
    ["Position", user.role === "member" ? "None" : roleLabel(user.role, user.title)],
    ["Torch Tokens", String(user.tokens)],
  ];
  return (
    <>
      <PageHeader title="Member Profile" subtitle="Your account details." />
      <section aria-labelledby="details-h" className={`${card} max-w-2xl p-6`}>
        <h2 id="details-h" className="sr-only">Account details</h2>
        <dl className="divide-y divide-[color:var(--border-light)]/60">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
              <dt className="text-sm font-bold text-[color:var(--ink-muted)]">{k}</dt>
              <dd className="break-words font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-[color:var(--ink-muted)]">
          To correct your name or email, or to change your position, ask a chapter officer.
        </p>
      </section>
    </>
  );
}
