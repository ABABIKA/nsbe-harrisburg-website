import Link from "next/link";
import ExternalLink from "../../../components/portal/ExternalLink";
import PageHeader from "../../../components/portal/PageHeader";
import SampleNote from "../../../components/portal/SampleNote";
import { borderColor, card, displayFont, outlineButton, redLink } from "../../../components/portal/styles";
import { verifySession } from "../../../lib/auth/dal";
import { getStore } from "../../../lib/db";
import {
  CONFERENCE_TOKEN_GOAL,
  DISCOVER_EAST_URL,
  NEXT_MEETING,
  portalContent,
} from "../../../lib/portal/content";
import { dateParts, firstName, formatDate, formatTimestamp, roleLabel } from "../../../lib/portal/format";

export const metadata = { title: "Dashboard | NSBE Penn State Harrisburg" };

export default async function DashboardPage() {
  const user = await verifySession();
  const events = portalContent.events.slice(0, 3);
  const announcements = (await getStore().listAnnouncements()).slice(0, 3);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName(user.name)}`}
        subtitle="Everything NSBE in one place. No more digging through emails and GroupMe."
      />

      {user.tokens === 0 && (
        <p
          role="status"
          className="mb-6 rounded-[6px] border-l-4 border-[color:var(--nsbe-yellow)] bg-white px-4 py-3"
        >
          <strong>Your account starts with 0 Torch Tokens.</strong> After you attend an event, let the
          vice president know so your tokens can be added.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <section aria-labelledby="membership-h" className={`${card} p-5`}>
          <h2 id="membership-h" className="text-xs font-bold uppercase tracking-widest text-[color:var(--ink-muted)]">
            Membership status
          </h2>
          <p className="mt-3 text-3xl font-extrabold text-[#1f5a1e]">{roleLabel(user.role, user.title)}</p>
          <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
            National dues are tracked through your NSBE national account.
          </p>
          <Link href="/portal/profile" className={`${redLink} mt-4 inline-block text-sm`}>
            View profile
          </Link>
        </section>

        <section aria-labelledby="tokens-h" className={`${card} p-5`}>
          <h2 id="tokens-h" className="text-xs font-bold uppercase tracking-widest text-[color:var(--ink-muted)]">
            Torch Tokens
          </h2>
          <p className="mt-3 text-3xl font-extrabold">
            {user.tokens} <span className="text-lg font-bold">tokens earned</span>
          </p>
          <p className="mt-2 text-sm text-[color:var(--ink-muted)]">Earned by attending events.</p>
          <p className="mt-3 inline-block rounded-full bg-[color-mix(in_srgb,var(--nsbe-yellow)_45%,white)] px-3 py-1 text-xs font-bold">
            Conferences: {CONFERENCE_TOKEN_GOAL} tokens to qualify
          </p>
          <div>
            <Link href="/portal/torch-tokens" className={`${redLink} mt-4 inline-block text-sm`}>
              How tokens work
            </Link>
          </div>
        </section>

        <section
          aria-labelledby="meeting-h"
          className="rounded-[6px] bg-[color:var(--nsbe-black)] p-5 text-white"
        >
          <h2 id="meeting-h" className="text-xs font-bold uppercase tracking-widest text-[color:var(--nsbe-yellow)]">
            Next chapter meeting
          </h2>
          <p className="mt-3 text-3xl font-extrabold">{NEXT_MEETING.title}</p>
          <p className="mt-2 text-sm text-white/85">
            {NEXT_MEETING.when}
            <br />
            {NEXT_MEETING.where}
          </p>
          <p className="mt-2 text-sm font-bold text-[color:var(--nsbe-yellow)]">Attending earns Torch Tokens</p>
          <Link
            href="/portal/events"
            className="mt-4 inline-block rounded-[8px] border border-white/60 px-4 py-2 text-sm! font-bold! text-white! underline-offset-2 hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--nsbe-focus)]"
          >
            View meeting details
          </Link>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section aria-labelledby="events-h" className={`${card} p-5`}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="events-h" className="text-xl font-bold">Upcoming Events</h2>
            <Link href="/portal/events" className={`${redLink} text-sm`}>View calendar</Link>
          </div>
          <ul className="mt-4 divide-y divide-[color:var(--border-light)]/60">
            {events.map((e, i) => {
              const d = dateParts(e.date);
              return (
                <li key={e.id} className="flex flex-wrap items-center gap-4 py-3">
                  <div
                    className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center border-2 ${borderColor[i % 3]} text-center leading-none`}
                  >
                    <span className={`${displayFont} text-xl`}>{d.day}</span>
                    <span className="text-[10px] font-bold">{d.month}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{e.title}</p>
                    <p className="text-sm text-[color:var(--ink-muted)]">
                      {formatDate(e.date)}, {e.time}, {e.location}
                    </p>
                  </div>
                  <ExternalLink href={DISCOVER_EAST_URL} className={outlineButton}>
                    View on Discover East
                  </ExternalLink>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="ann-h" className={`${card} p-5`}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="ann-h" className="text-xl font-bold">Announcements</h2>
            <Link href="/portal/announcements" className={`${redLink} text-sm`}>See all</Link>
          </div>
          {announcements.length === 0 ? (
            <p className="mt-4 text-[color:var(--ink-muted)]">No announcements yet. Check back soon.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {announcements.map((a) => (
                <li key={a.id}>
                  <p className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--ink-muted)]">
                    {a.pinned && (
                      <span className="rounded-[3px] bg-[color-mix(in_srgb,var(--nsbe-red)_18%,white)] px-1.5 py-0.5 font-bold text-[#7d2118]">
                        PINNED
                      </span>
                    )}
                    {roleLabel(a.authorRole, a.authorTitle)}, {formatTimestamp(a.createdAt)}
                  </p>
                  <p className="mt-1 font-bold">{a.title}</p>
                  <p className="line-clamp-3 whitespace-pre-line text-sm text-[color:var(--ink-muted)]">{a.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <SampleNote />
    </>
  );
}
