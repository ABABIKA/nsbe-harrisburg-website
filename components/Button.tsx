import type { AnchorHTMLAttributes } from "react";

type ButtonVariant = "red" | "outline" | "dark";
type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant };

export function Button({ variant = "red", className = "", ...props }: ButtonProps) {
  return <a className={`button button-${variant} ${className}`.trim()} {...props} />;
}
