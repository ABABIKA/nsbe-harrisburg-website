import Link from "next/link";
import PageHeader from "../../../components/portal/PageHeader";
import { card, redLink } from "../../../components/portal/styles";
import { verifySession } from "../../../lib/auth/dal";
import { searchContent } from "../../../lib/portal/search";

export const metadata = { title: "Search | NSBE Penn State Harrisburg" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  await verifySession();
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q) ?? "";
  const hits = searchContent(query.slice(0, 100));

  return (
    <>
      <PageHeader title="Search" subtitle="Events, opportunities, and resources." />
      {query.trim() === "" ? (
        <p>Type a word in the search box at the top of the page.</p>
      ) : (
        <>
          <p role="status" className="mb-4">
            {hits.length === 0
              ? "No results for that search. Try a different word."
              : `${hits.length} ${hits.length === 1 ? "result" : "results"}.`}
          </p>
          <ul className="space-y-3">
            {hits.map((h) => (
              <li key={`${h.section}-${h.id}`} className={`${card} p-4`}>
                <p className="text-xs font-bold uppercase tracking-wide text-[color:var(--ink-muted)]">{h.section}</p>
                <Link href={h.href} className={`${redLink} text-lg`}>{h.title}</Link>
                <p className="text-sm text-[color:var(--ink-muted)]">{h.summary}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
