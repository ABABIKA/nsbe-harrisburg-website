import PageHeader from "../../../components/portal/PageHeader";
import { card } from "../../../components/portal/styles";
import { verifySession } from "../../../lib/auth/dal";
import { CONFERENCE_TOKEN_GOAL } from "../../../lib/portal/content";

export const metadata = { title: "Torch Tokens | NSBE Penn State Harrisburg" };

export default async function TorchTokensPage() {
  const user = await verifySession();
  const percent = Math.min(100, Math.round((user.tokens / CONFERENCE_TOKEN_GOAL) * 100));
  const remaining = Math.max(0, CONFERENCE_TOKEN_GOAL - user.tokens);

  return (
    <>
      <PageHeader title="Torch Tokens" subtitle="Your chapter participation, counted." />
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section aria-labelledby="bal-h" className={`${card} p-6`}>
          <h2 id="bal-h" className="text-xs font-bold uppercase tracking-widest text-[color:var(--ink-muted)]">
            Your balance
          </h2>
          <p className="mt-3 text-6xl font-extrabold leading-none">{user.tokens}</p>
          <p className="mt-1 font-bold">tokens earned</p>

          <div className="mt-6">
            <div className="flex justify-between text-sm font-bold">
              <span>Conference goal</span>
              <span>{Math.min(user.tokens, CONFERENCE_TOKEN_GOAL)} of {CONFERENCE_TOKEN_GOAL}</span>
            </div>
            <div
              role="progressbar"
              aria-label="Torch Tokens toward the conference goal"
              aria-valuemin={0}
              aria-valuemax={CONFERENCE_TOKEN_GOAL}
              aria-valuenow={Math.min(user.tokens, CONFERENCE_TOKEN_GOAL)}
              className="mt-2 h-4 overflow-hidden rounded-full border border-[color:var(--nsbe-black)] bg-white"
            >
              <div className="h-full bg-[color:var(--nsbe-green)]" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-sm text-[color:var(--ink-muted)]">
              {remaining === 0
                ? "You have enough tokens to qualify for conferences."
                : `${remaining} more ${remaining === 1 ? "token" : "tokens"} to qualify for conferences.`}
            </p>
          </div>
        </section>

        <section aria-labelledby="how-h" className={`${card} p-6`}>
          <h2 id="how-h" className="text-xl font-bold">How Torch Tokens work</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[color:var(--ink-muted)]">
            <li>You earn tokens by attending chapter events, like the weekly general body meeting.</li>
            <li>You need {CONFERENCE_TOKEN_GOAL} tokens to qualify for conferences.</li>
            <li>The president and vice president add tokens to your account. If your balance looks wrong, let them know.</li>
          </ul>
          <h3 className="mt-6 text-lg font-bold">History</h3>
          <p className="mt-1 text-[color:var(--ink-muted)]">
            A list of when each token was added will appear here once attendance tracking is set up.
          </p>
        </section>
      </div>
    </>
  );
}
