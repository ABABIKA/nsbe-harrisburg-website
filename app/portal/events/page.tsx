import ExternalLink from "../../../components/portal/ExternalLink";
import PageHeader from "../../../components/portal/PageHeader";
import SampleNote from "../../../components/portal/SampleNote";
import { borderColor, card, displayFont } from "../../../components/portal/styles";
import { verifySession } from "../../../lib/auth/dal";
import { DISCOVER_EAST_URL, portalContent } from "../../../lib/portal/content";
import { dateParts } from "../../../lib/portal/format";

export const metadata = { title: "Events | NSBE Penn State Harrisburg" };

export default async function EventsPage() {
  await verifySession();
  return (
    <>
      <PageHeader
        title="Events"
        subtitle="Chapter meetings, study sessions, and service events. Attending earns Torch Tokens."
      />
      <ul className="space-y-4">
        {portalContent.events.map((e, i) => {
          const d = dateParts(e.date);
          return (
            <li key={e.id} className={`${card} flex flex-wrap items-center gap-5 p-5`}>
              <div
                className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center border-2 ${borderColor[i % 3]} text-center leading-none`}
              >
                <span className={`${displayFont} text-3xl`}>{d.day}</span>
                <span className="mt-1 text-xs font-bold">{d.month}</span>
                <span className="text-[10px]">{d.year}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide">{e.category}</p>
                <h2 className={`${displayFont} mt-1 text-3xl leading-none`}>{e.title}</h2>
                <p className="mt-2 max-w-2xl text-[color:var(--ink-muted)]">{e.summary}</p>
                <p className="mt-2 text-sm font-bold">
                  {e.time}
                  <span className="mx-2 font-normal" aria-hidden="true">|</span>
                  {e.location}
                </p>
              </div>
              <ExternalLink href={DISCOVER_EAST_URL}>Event details</ExternalLink>
            </li>
          );
        })}
      </ul>
      <SampleNote />
    </>
  );
}
