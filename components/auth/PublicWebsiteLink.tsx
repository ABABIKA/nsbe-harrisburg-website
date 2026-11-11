import Link from "next/link";

// Drop this anywhere in the portal. It returns to the public website.
// Default look follows the prototype's white outlined button.
export default function PublicWebsiteLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={
        className ??
        "rounded-[8px] border border-[#1d1d1d] bg-white px-4 py-2.5 text-sm font-bold text-[#0a0b0a] focus:outline-none focus-visible:ring-4 focus-visible:ring-black"
      }
    >
      Public Website
    </Link>
  );
}
