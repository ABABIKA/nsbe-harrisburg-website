import type { ReactNode } from "react";
import PublicWebsiteLink from "../auth/PublicWebsiteLink";
import SignOutButton from "../auth/SignOutButton";
import { outlineButton, signOutButton } from "./styles";

export default function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-normal text-[color:var(--nsbe-black)] sm:text-4xl">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-[color:var(--ink-muted)]">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <PublicWebsiteLink className={outlineButton} />
          <SignOutButton className={signOutButton} />
        </div>
      </div>
      {children}
    </div>
  );
}
