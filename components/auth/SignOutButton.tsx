import { logoutAction } from "../../app/actions/auth";

// Drop this anywhere in the portal. It ends the session and returns to "/".
// Default look follows the prototype's white outlined button.
export default function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={
          className ??
          "rounded-[8px] border border-[#1d1d1d] bg-white px-4 py-2.5 text-sm font-bold text-[#8f2a25] focus:outline-none focus-visible:ring-4 focus-visible:ring-black"
        }
      >
        Sign Out
      </button>
    </form>
  );
}
