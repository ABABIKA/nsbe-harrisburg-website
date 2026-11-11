import { logoutAction } from "../../app/actions/auth";

// Drop this anywhere in the portal. It ends the session and returns to "/".
export default function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={
          className ??
          "rounded-md border-2 border-black bg-white px-3 py-1.5 text-sm font-bold text-[#8f2a25] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#b8423c]/50"
        }
      >
        Sign Out
      </button>
    </form>
  );
}
