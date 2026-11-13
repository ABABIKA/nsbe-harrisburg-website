import Image from "next/image";
import Link from "next/link";
import type { User } from "../../lib/db/types";
import { can } from "../../lib/auth/roles";
import { firstName, initials, roleLabel } from "../../lib/portal/format";
import { PortalMobileNav, PortalNav, type NavItem } from "./PortalNav";
import { focusRing } from "./styles";

const BASE_ITEMS: NavItem[] = [
  { href: "/portal/dashboard", label: "Dashboard", dot: "red" },
  { href: "/portal/events", label: "Events", dot: "yellow" },
  { href: "/portal/announcements", label: "Announcements", dot: "green" },
  { href: "/portal/torch-tokens", label: "Torch Tokens", dot: "red" },
  { href: "/portal/opportunities", label: "Opportunities", dot: "yellow" },
  { href: "/portal/resources", label: "Resources", dot: "green" },
  { href: "/portal/profile", label: "Member Profile", dot: "red" },
  { href: "/portal/about", label: "About NSBE", dot: "yellow" },
];

function Stripe() {
  return (
    <div aria-hidden="true" className="flex h-1.5">
      <span className="flex-1 bg-[color:var(--nsbe-red)]" />
      <span className="flex-1 bg-[color:var(--nsbe-yellow)]" />
      <span className="flex-1 bg-[color:var(--nsbe-green)]" />
      <span className="flex-1 bg-[#444]" />
    </div>
  );
}

function Brand() {
  return (
    <Link href="/portal/dashboard" className={`flex items-center gap-3 rounded-[8px] ${focusRing}`}>
      <Image
        src="/images/nsbe-pennstatehbg-logo.jpeg"
        alt=""
        width={44}
        height={44}
        className="h-11 w-11 rounded-full"
      />
      <span className="leading-tight">
        <span className="block text-lg font-extrabold text-white">NSBE</span>
        <span className="block text-xs text-white/75">Penn State Harrisburg</span>
      </span>
    </Link>
  );
}

export default function PortalShell({ user, children }: { user: User; children: React.ReactNode }) {
  const items = can(user.role, "edit_tokens")
    ? [...BASE_ITEMS, { href: "/portal/admin/members", label: "Manage Members", dot: "green" as const }]
    : BASE_ITEMS;
  const label = roleLabel(user.role, user.title);

  return (
    <div className="min-h-screen bg-[color-mix(in_srgb,var(--nsbe-cream)_40%,white)] text-[color:var(--nsbe-black)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-[8px] focus:bg-white focus:px-4 focus:py-2 focus:font-bold"
      >
        Skip to main content
      </a>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-[color:var(--nsbe-black)] text-white lg:flex">
        <Stripe />
        <div className="px-4 py-5">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <PortalNav items={items} />
        </div>
        <div className="flex items-center gap-3 border-t border-white/15 px-4 py-4">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--nsbe-yellow)] text-sm font-bold text-[color:var(--nsbe-black)]"
          >
            {initials(user.name)}
          </span>
          <span className="min-w-0 text-sm leading-tight">
            <span className="block truncate font-bold">{user.name}</span>
            <span className="block truncate text-white/75">Signed in as {label}</span>
          </span>
        </div>
      </aside>

      <div className="lg:pl-64">
        <div className="bg-[color:var(--nsbe-black)] lg:hidden">
          <Stripe />
          <div className="flex items-center justify-between px-4 py-3">
            <Brand />
            <PortalMobileNav items={items} />
          </div>
        </div>

        <header className="flex flex-wrap items-center gap-3 border-b border-[color:var(--border-light)] bg-white px-5 py-3 sm:px-8">
          <form action="/portal/search" role="search" className="min-w-0 flex-1 sm:max-w-md">
            <label htmlFor="portal-search" className="sr-only">
              Search events, resources, opportunities
            </label>
            <input
              id="portal-search"
              name="q"
              type="search"
              placeholder="Search events, resources, opportunities"
              className="block w-full rounded-[6px] border border-[color:var(--border-light)] bg-white px-3 py-2 text-sm focus:border-[color:var(--nsbe-black)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--nsbe-focus)]"
            />
          </form>
          <p className="ml-auto flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--nsbe-green)_22%,white)] px-3 py-1.5 text-sm font-bold text-[#1f5a1e]">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[color:var(--nsbe-green)]" />
            {label}
          </p>
          <Link
            href="/portal/profile"
            className={`flex items-center gap-2 rounded-full border border-[color:var(--border-light)] bg-white py-1 pl-1 pr-3 text-sm font-bold ${focusRing}`}
          >
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--nsbe-yellow)] text-xs"
            >
              {initials(user.name)}
            </span>
            {firstName(user.name)}
          </Link>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-5 py-8 focus:outline-none sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
