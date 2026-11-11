import Link from "next/link";

// Drop this anywhere in the portal. It returns to the public website.
export default function PublicWebsiteLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={
        className ??
        "rounded-md border-2 border-black bg-white px-3 py-1.5 text-sm font-bold text-black focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b8423c]/50"
      }
    >
      Public Website
    </Link>
  );
}
