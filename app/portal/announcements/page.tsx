import PageHeader from "../../../components/portal/PageHeader";
import { card, darkButton, inputClass, outlineButton } from "../../../components/portal/styles";
import { can } from "../../../lib/auth/roles";
import { verifySession } from "../../../lib/auth/dal";
import { getStore } from "../../../lib/db";
import { formatTimestamp, roleLabel } from "../../../lib/portal/format";
import { deleteAction, pinAction, postAction } from "./actions";

export const metadata = { title: "Announcements | NSBE Penn State Harrisburg" };

const NOTICES: Record<string, { ok: boolean; text: string }> = {
  posted: { ok: true, text: "Announcement posted." },
  deleted: { ok: true, text: "Announcement deleted." },
  pinned: { ok: true, text: "Announcement pinned to the top." },
  unpinned: { ok: true, text: "Announcement unpinned." },
  forbidden: { ok: false, text: "You do not have permission to do that." },
  invalid: { ok: false, text: "Add a title of up to 100 characters and a message of up to 1,000 characters." },
  not_found: { ok: false, text: "That announcement no longer exists." },
};

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const user = await verifySession();
  const params = await searchParams;
  const key = Array.isArray(params.notice) ? params.notice[0] : params.notice;
  const notice = key ? NOTICES[key] : undefined;
  const items = await getStore().listAnnouncements();
  const canPost = can(user.role, "post_announcements");
  const canPin = can(user.role, "pin_announcements");
  const canDeleteAny = can(user.role, "delete_any_announcement");

  return (
    <>
      <PageHeader title="Announcements" subtitle="News and reminders from your chapter officers." />

      {notice && (
        <p
          role="status"
          className={`mb-6 rounded-[6px] border-l-4 bg-white px-4 py-3 font-bold ${
            notice.ok ? "border-[color:var(--nsbe-green)]" : "border-[color:var(--nsbe-red)] text-[#7d2118]"
          }`}
        >
          {notice.ok ? "" : "Error: "}
          {notice.text}
        </p>
      )}

      {canPost && (
        <section aria-labelledby="post-h" className={`${card} mb-6 max-w-3xl p-5`}>
          <h2 id="post-h" className="text-xl font-bold">Post an announcement</h2>
          <form action={postAction} className="mt-4 space-y-4">
            <div>
              <label htmlFor="ann-title" className="text-sm font-bold">Title</label>
              <input id="ann-title" name="title" type="text" required maxLength={100} className={`${inputClass} mt-1`} />
            </div>
            <div>
              <label htmlFor="ann-body" className="text-sm font-bold">Message</label>
              <textarea id="ann-body" name="body" required maxLength={1000} rows={4} className={`${inputClass} mt-1`} />
              <p className="mt-1 text-xs text-[color:var(--ink-muted)]">Up to 1,000 characters. Every member can read it.</p>
            </div>
            {canPin && (
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" name="pinned" className="h-4 w-4 accent-black" />
                Pin to the top
              </label>
            )}
            <button type="submit" className={darkButton}>Post announcement</button>
          </form>
        </section>
      )}

      {items.length === 0 ? (
        <p className={`${card} p-5 text-[color:var(--ink-muted)]`}>
          No announcements yet.{canPost ? " Use the form above to post the first one." : " Check back soon."}
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((a) => (
            <li key={a.id} className={`${card} p-5`}>
              <p className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--ink-muted)]">
                {a.pinned && (
                  <span className="rounded-[3px] bg-[color-mix(in_srgb,var(--nsbe-red)_18%,white)] px-1.5 py-0.5 text-xs font-bold text-[#7d2118]">
                    PINNED
                  </span>
                )}
                {a.authorName}, {roleLabel(a.authorRole, a.authorTitle)}, {formatTimestamp(a.createdAt)}
              </p>
              <h2 className="mt-1 text-xl font-bold">{a.title}</h2>
              <p className="mt-1 max-w-2xl whitespace-pre-line text-[color:var(--ink-muted)]">{a.body}</p>

              {(canPin || canDeleteAny || (canPost && a.authorId === user.id)) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {canPin && (
                    <form action={pinAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="pinned" value={a.pinned ? "0" : "1"} />
                      <button type="submit" className={outlineButton}>
                        {a.pinned ? "Unpin" : "Pin"}
                        <span className="sr-only"> {a.title}</span>
                      </button>
                    </form>
                  )}
                  {(canDeleteAny || (canPost && a.authorId === user.id)) && (
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className={`${outlineButton} text-[#7d2118]!`}>
                        Delete<span className="sr-only"> {a.title}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
