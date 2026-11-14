// Shared class strings for the member portal. Colors come from the shared
// settings in app/globals.css. The "!" keeps these winning over the global
// resets for buttons and links.
export const card =
  "rounded-[6px] border border-[color:var(--border-light)] bg-white";

export const displayFont =
  "font-[family-name:var(--font-barlow-condensed)] font-extrabold uppercase";

const focus =
  "focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--nsbe-focus)]";

export const outlineButton = `inline-flex items-center gap-2 rounded-[8px] border border-[color:var(--nsbe-black)] bg-white px-4 py-2.5 text-sm! font-bold! text-[color:var(--nsbe-black)]! hover:bg-[color:var(--nsbe-cream)] ${focus}`;

export const signOutButton = outlineButton.replace(
  "text-[color:var(--nsbe-black)]!",
  "text-[#7d2118]!",
);

export const darkButton = `inline-flex items-center gap-2 rounded-[8px] bg-[color:var(--nsbe-black)] px-4 py-2.5 text-sm! font-bold! text-white! hover:opacity-85 ${focus}`;

export const redLink =
  "font-bold! text-[#9a2b1f]! underline! underline-offset-2 hover:text-[#7d2118]";

export const dotColor = {
  red: "bg-[color:var(--nsbe-red)]",
  yellow: "bg-[color:var(--nsbe-yellow)]",
  green: "bg-[color:var(--nsbe-green)]",
} as const;

export const borderColor = [
  "border-[color:var(--nsbe-red)]",
  "border-[color:var(--nsbe-green)]",
  "border-[color:var(--nsbe-yellow)]",
] as const;

export const inputClass = `block w-full rounded-[6px] border border-[color:var(--nsbe-black)] bg-white px-3 py-2 text-base text-[color:var(--nsbe-black)] ${focus}`;

export const focusRing = focus;
