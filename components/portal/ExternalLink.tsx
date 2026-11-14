import type { ReactNode } from "react";
import ArrowIcon from "../auth/ArrowIcon";
import { outlineButton } from "./styles";

// A link that opens another site in a new tab, announced as such.
export default function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className ?? outlineButton}>
      {children}
      <ArrowIcon className="h-3.5 w-3.5" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
