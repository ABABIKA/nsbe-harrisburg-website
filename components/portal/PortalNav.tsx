"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dotColor, focusRing } from "./styles";

export type NavItem = { href: string; label: string; dot: keyof typeof dotColor };

export function PortalNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Member portal">
      <ul className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-bold ${focusRing} ${
                  active
                    ? "bg-white text-[color:var(--nsbe-black)]!"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-sm ${dotColor[item.dot]}`} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Phone-width menu. Keyed by the current page so it closes after you navigate.
export function PortalMobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <details key={pathname} className="group relative">
      <summary
        className={`flex cursor-pointer list-none items-center rounded-[8px] border border-white/60 px-4 py-2 text-sm font-bold text-white ${focusRing}`}
      >
        Menu
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-64 rounded-[8px] bg-[color:var(--nsbe-black)] p-3 text-white shadow-xl ring-1 ring-white/20">
        <PortalNav items={items} />
      </div>
    </details>
  );
}
