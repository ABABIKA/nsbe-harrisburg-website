import PageHeader from "../../../../components/portal/PageHeader";
import { card, darkButton, inputClass } from "../../../../components/portal/styles";
import { requireRole } from "../../../../lib/auth/dal";
import { getStore } from "../../../../lib/db";
import { roleLabel } from "../../../../lib/portal/format";
import { saveRole, saveTitle, saveTokens } from "./actions";

export const metadata = { title: "Manage Members | NSBE Penn State Harrisburg" };

const NOTICES: Record<string, { ok: boolean; text: string }> = {
  tokens_saved: { ok: true, text: "Torch Tokens saved." },
  role_saved: { ok: true, text: "Role saved." },
  title_saved: { ok: true, text: "Position saved." },
  forbidden: { ok: false, text: "Only the president and vice president can make that change." },
  invalid: { ok: false, text: "That value is not allowed. Tokens must be a whole number from 0 to 100000, and positions are at most 60 characters." },
  not_found: { ok: false, text: "That member no longer exists." },
  last_admin: { ok: false, text: "There must always be at least one admin, so the last admin cannot be changed to another role." },
};

const small = "mt-1 w-full";

export default async function ManageMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; notice?: string | string[] }>;
}) {
  await requireRole("edit_tokens");
  const params = await searchParams;
  const q = ((Array.isArray(params.q) ? params.q[0] : params.q) ?? "").slice(0, 100);
  const noticeKey = Array.isArray(params.notice) ? params.notice[0] : params.notice;
  const notice = noticeKey ? NOTICES[noticeKey] : undefined;
  const members = await getStore().listUsers(q);

  return (
    <>
      <PageHeader
        title="Manage Members"
        subtitle="Add Torch Tokens and set roles and positions. Only the president and vice president can see this page."
      />

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

      <form method="get" role="search" className="mb-6 flex max-w-xl flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor="member-q" className="text-sm font-bold">Find a member by name or email</label>
          <input id="member-q" name="q" type="search" defaultValue={q} className={`${inputClass} mt-1`} />
        </div>
        <button type="submit" className={darkButton}>Search</button>
      </form>

      <p className="mb-3 text-sm text-[color:var(--ink-muted)]" role="status">
        {members.length} {members.length === 1 ? "member" : "members"}
        {q ? ` matching "${q}"` : ""}
      </p>

      <ul className="space-y-4">
        {members.map((m) => (
          <li key={m.id} className={`${card} p-5`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">{m.name}</h2>
                <p className="text-sm text-[color:var(--ink-muted)]">{m.email}</p>
              </div>
              <p className="text-sm font-bold">
                {roleLabel(m.role, m.title)}, {m.tokens} {m.tokens === 1 ? "token" : "tokens"}
              </p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <form action={saveTokens}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="q" value={q} />
                <label htmlFor={`tokens-${m.id}`} className="text-sm font-bold">
                  Torch Tokens for {m.name}
                </label>
                <input
                  id={`tokens-${m.id}`}
                  name="tokens"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100000}
                  step={1}
                  defaultValue={m.tokens}
                  required
                  className={`${inputClass} ${small}`}
                />
                <button type="submit" className={`${darkButton} mt-2`}>Save tokens</button>
              </form>

              <form action={saveRole}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="q" value={q} />
                <label htmlFor={`role-${m.id}`} className="text-sm font-bold">
                  Role for {m.name}
                </label>
                <select id={`role-${m.id}`} name="role" defaultValue={m.role} className={`${inputClass} ${small}`}>
                  <option value="member">Member</option>
                  <option value="officer">Officer (e-board)</option>
                  <option value="admin">Admin (president, vice president)</option>
                </select>
                <button type="submit" className={`${darkButton} mt-2`}>Save role</button>
              </form>

              <form action={saveTitle}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="q" value={q} />
                <label htmlFor={`title-${m.id}`} className="text-sm font-bold">
                  Position for {m.name}
                </label>
                <input
                  id={`title-${m.id}`}
                  name="title"
                  type="text"
                  maxLength={60}
                  defaultValue={m.title ?? ""}
                  placeholder="For example, Treasurer"
                  className={`${inputClass} ${small}`}
                />
                <button type="submit" className={`${darkButton} mt-2`}>Save position</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
