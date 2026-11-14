import ExternalLink from "../../../components/portal/ExternalLink";
import PageHeader from "../../../components/portal/PageHeader";
import SampleNote from "../../../components/portal/SampleNote";
import { card } from "../../../components/portal/styles";
import { verifySession } from "../../../lib/auth/dal";
import { portalContent } from "../../../lib/portal/content";

export const metadata = { title: "Opportunities | NSBE Penn State Harrisburg" };

export default async function OpportunitiesPage() {
  await verifySession();
  return (
    <>
      <PageHeader title="Opportunities" subtitle="Internships, scholarships, and conferences for NSBE members." />
      <ul className="space-y-3">
        {portalContent.opportunities.map((o) => (
          <li key={o.id} className={`${card} flex flex-wrap items-center justify-between gap-4 p-5`}>
            <div>
              <p className="text-xs text-[color:var(--ink-muted)]">{o.kind}</p>
              <h2 className="text-xl font-bold">{o.title}</h2>
              <p className="text-sm text-[color:var(--ink-muted)]">{o.deadline}</p>
            </div>
            <ExternalLink href={o.url}>{o.kind === "Conference" ? "View details" : "Apply"}</ExternalLink>
          </li>
        ))}
      </ul>
      <SampleNote />
    </>
  );
}
