import ExternalLink from "../../../components/portal/ExternalLink";
import PageHeader from "../../../components/portal/PageHeader";
import SampleNote from "../../../components/portal/SampleNote";
import { card } from "../../../components/portal/styles";
import { verifySession } from "../../../lib/auth/dal";
import { portalContent } from "../../../lib/portal/content";

export const metadata = { title: "Resources | NSBE Penn State Harrisburg" };

export default async function ResourcesPage() {
  await verifySession();
  return (
    <>
      <PageHeader title="Resources" subtitle="Tools to help you succeed in school and in your career." />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {portalContent.resources.map((r) => (
          <li key={r.id} className={`${card} flex flex-col p-5`}>
            <h2 className="text-xl font-bold">{r.title}</h2>
            <p className="mt-2 flex-1 text-[color:var(--ink-muted)]">{r.summary}</p>
            <div className="mt-4">
              <ExternalLink href={r.url}>Open</ExternalLink>
            </div>
          </li>
        ))}
      </ul>
      <SampleNote />
    </>
  );
}
