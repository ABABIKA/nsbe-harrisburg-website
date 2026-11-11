import Link from "next/link";
import { Barlow_Condensed } from "next/font/google";
import type { ReactNode } from "react";

const heading = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700"],
});

// Page frame shared by the sign-in and sign-up screens, styled after the
// prototype: cream background, black text, bold condensed headings.
export default function AuthShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-[#ecebdf] text-black">
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:py-16">
        <p className="text-xs font-bold uppercase tracking-widest">{eyebrow}</p>
        <h1
          className={`${heading.className} mt-2 text-5xl uppercase leading-none sm:text-6xl`}
        >
          {title}
        </h1>
        <p className="mt-4 text-base">{intro}</p>
        <div className="mt-8 rounded-lg border-2 border-black bg-[#fbfaf3] p-5 sm:p-6">
          {children}
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="font-semibold underline underline-offset-2">
            Back to the public website
          </Link>
        </p>
      </div>
    </main>
  );
}
