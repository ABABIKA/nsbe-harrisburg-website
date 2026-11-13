import Image from "next/image";
import Link from "next/link";
import { Barlow_Condensed, Inter } from "next/font/google";
import type { ReactNode } from "react";
import ArrowIcon from "./ArrowIcon";

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["800"] });
const body = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

// Page frame shared by sign-in and sign-up. Follows the prototype's
// split-panel pattern: a black panel with a big stacked headline and the
// concentric-ring motif, next to a cream panel holding the form.
export default function AuthShell({
  eyebrow,
  lines,
  accent,
  intro,
  children,
}: {
  eyebrow: string;
  lines: [string, string];
  accent: "red" | "green";
  intro: string;
  children: ReactNode;
}) {
  return (
    <main
      className={`${body.className} min-h-screen bg-[color:var(--nsbe-cream)] text-[color:var(--nsbe-black)] lg:grid lg:grid-cols-[1.1fr_1fr]`}
    >
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-10 flex h-1.5 lg:h-2">
        <span className="flex-1 bg-[color:var(--nsbe-red)]" />
        <span className="flex-1 bg-[color:var(--nsbe-yellow)]" />
        <span className="flex-1 bg-[color:var(--nsbe-green)]" />
        <span className="flex-1 bg-[color:var(--nsbe-black)]" />
      </div>
      <section className="relative overflow-hidden bg-[color:var(--nsbe-black)] px-6 py-10 text-white sm:px-12 lg:flex lg:flex-col lg:justify-center lg:px-16 lg:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-72 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full border border-[color:var(--nsbe-green)]/80 shadow-[0_0_0_44px_#241d15,0_0_0_96px_#140e0c] lg:-right-52"
        />
        <div className="relative">
          <div className="flex items-center gap-4">
            <Image
              src="/images/nsbe-pennstatehbg-logo.jpeg"
              alt="NSBE Penn State Harrisburg chapter logo"
              width={72}
              height={72}
              priority
              className="h-16 w-16 rounded-full sm:h-[72px] sm:w-[72px]"
            />
            <p className="text-sm font-bold tracking-wide text-white/90">
              NSBE Penn State Harrisburg
            </p>
          </div>
          <h1
            className={`${display.className} mt-6 text-[clamp(3.5rem,11vw,7.5rem)] uppercase leading-[0.88]`}
          >
            {lines[0]}
            <br />
            <span className={accent === "red" ? "text-[color:var(--nsbe-red)]" : "text-[color:var(--nsbe-green)]"}>
              {lines[1]}
            </span>
          </h1>
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-white/85">
            {intro}
          </p>
        </div>
      </section>

      <section className="flex items-center px-6 py-10 sm:px-12 lg:px-16 lg:py-20">
        <div className="mx-auto w-full max-w-md">
          <p className="text-xs font-bold uppercase tracking-widest">{eyebrow}</p>
          <div className="mt-4 rounded-[4px] border border-[color:var(--border-light)] bg-white p-6 sm:p-8">
            {children}
          </div>
          <p className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-[8px] border border-[color:var(--nsbe-black)] bg-white px-4 py-2.5 text-sm font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--nsbe-focus)]"
            >
              Back to the public website
              <ArrowIcon />
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
