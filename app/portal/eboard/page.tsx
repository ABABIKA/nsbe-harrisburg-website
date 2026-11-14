import Link from "next/link";
import PageHeader from "../../../components/portal/PageHeader";
import SampleNote from "../../../components/portal/SampleNote";
import { card, darkButton } from "../../../components/portal/styles";
import { requireRole } from "../../../lib/auth/dal";
import { getStore } from "../../../lib/db";
import { EBOARD_MEETING } from "../../../lib/portal/content";
import { roleLabel } from "../../../lib/portal/format";

export const metadata = { title: "E-Board Meetings | NSBE Penn State Harrisburg" };

// Officers and admins only. requireRole sends everyone else to the dashboard.
export default async function EboardPage() {
  await requireRole("view_eboard");
  const everyone = await getStore().listUsers();
  const eboard = everyone
    .filter((u) => u.role === "admin" || u.role === "officer")
    .sort((a, b) => Number(b.role === "admin") - Number(a.role === "admin") || a.name.localeCompare(b.name));

  return (
    <>
      <PageHeader
        title="E-Board Meetings"
        subtitle="For chapter officers and the president only. Members cannot see this page."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section aria-labelledby="mtg-h" className="rounded-[6px] bg-[color:var(--nsbe-black)] p-6 text-white">
          <h2 id="mtg-h" className="text-xs font-bold uppercase tracking-widest text-[color:var(--nsbe-yellow)]">
            Next e-board meeting
          </h2>
          <p className="mt-3 text-3xl font-extrabold">{EBOARD_MEETING.title}</p>
          <p className="mt-2 text-white/85">
            {EBOARD_MEETING.when}
            <br />
            {EBOARD_MEETING.where}
          </p>
        </section>

        <section aria-labelledby="tools-h" className={`${card} p-6`}>
          <h2 id="tools-h" className="text-xl font-bold">Officer tools</h2>
          <ul className="mt-3 space-y-3">
            <li>
              <Link href="/portal/announcements" className={darkButton}>Post an announcement</Link>
            </li>
            <li className="text-sm text-[color:var(--ink-muted)]">
              Agendas and meeting minutes will be posted here once the e-board decides how to share them.
            </li>
          </ul>
        </section>
      </div>

      <section aria-labelledby="roster-h" className={`${card} mt-4 p-6`}>
        <h2 id="roster-h" className="text-xl font-bold">E-Board roster</h2>
        <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
          Everyone with the officer or admin role. Positions are set by the president and vice president.
        </p>
        {eboard.length === 0 ? (
          <p className="mt-4">No officers yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {eboard.map((m) => (
              <li key={m.id} className="rounded-[6px] border border-[color:var(--border-light)] p-4">
                <p className="font-bold">{m.name}</p>
                <p className="text-sm text-[color:var(--ink-muted)]">{roleLabel(m.role, m.title)}</p>
                <p className="mt-1 break-words text-sm">{m.email}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <SampleNote />
    </>
  );
}
