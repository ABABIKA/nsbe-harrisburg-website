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
      className={`${body.className} min-h-screen bg-[#f1f0e8] text-[#0a0b0a] lg:grid lg:grid-cols-[1.1fr_1fr]`}
    >
      <section className="relative overflow-hidden bg-[#0a0b0a] px-6 py-10 text-white sm:px-12 lg:flex lg:flex-col lg:justify-center lg:px-16 lg:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-72 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full border border-[#8bc077]/80 shadow-[0_0_0_44px_#241d15,0_0_0_96px_#140e0c] lg:-right-52"
        />
        <div className="relative">
          <p className="text-sm font-bold tracking-wide text-white/80">
            NSBE Penn State Harrisburg
          </p>
          <h1
            className={`${display.className} mt-6 text-[clamp(3.5rem,11vw,7.5rem)] uppercase leading-[0.88]`}
          >
            {lines[0]}
            <br />
            <span className={accent === "red" ? "text-[#c85a4e]" : "text-[#8bc077]"}>
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
          <div className="mt-4 rounded-[4px] border border-[#d4d2c4] bg-white p-6 sm:p-8">
            {children}
          </div>
          <p className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#1d1d1d] bg-white px-4 py-2.5 text-sm font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-black"
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
