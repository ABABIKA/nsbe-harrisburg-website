import PageHeader from "../../../components/portal/PageHeader";
import SampleNote from "../../../components/portal/SampleNote";
import { card } from "../../../components/portal/styles";
import { verifySession } from "../../../lib/auth/dal";
import { portalContent } from "../../../lib/portal/content";
import { formatDate } from "../../../lib/portal/format";

export const metadata = { title: "Announcements | NSBE Penn State Harrisburg" };

export default async function AnnouncementsPage() {
  await verifySession();
  const items = [...portalContent.announcements].sort(
    (a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false) || b.date.localeCompare(a.date),
  );
  return (
    <>
      <PageHeader title="Announcements" subtitle="News and reminders from your chapter officers." />
      <ul className="space-y-4">
        {items.map((a) => (
          <li key={a.id} className={`${card} p-5`}>
            <p className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--ink-muted)]">
              {a.pinned && (
                <span className="rounded-[3px] bg-[color-mix(in_srgb,var(--nsbe-red)_18%,white)] px-1.5 py-0.5 text-xs font-bold text-[#7d2118]">
                  PINNED
                </span>
              )}
              {a.from}, {formatDate(a.date)}
            </p>
            <h2 className="mt-1 text-xl font-bold">{a.title}</h2>
            <p className="mt-1 max-w-2xl text-[color:var(--ink-muted)]">{a.body}</p>
          </li>
        ))}
      </ul>
      <SampleNote />
    </>
  );
}
