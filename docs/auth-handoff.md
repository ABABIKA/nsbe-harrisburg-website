# Member Login: Hand-off Notes

For teammates building the dashboard, portal pages, and public pages. Written by Daron (login and member entry). Design: `docs/superpowers/specs/2026-11-10-member-login-design.md`.

## The one rule: member pages live under `/portal`

- Everything a signed-in member sees goes in `app/portal/...` (for example `app/portal/dashboard/page.tsx`, `app/portal/torch-tokens/page.tsx`).
- Anyone not signed in who opens a `/portal` address is sent to `/login`, and after signing in is returned to the page they wanted.
- After signing in or signing up with no specific destination, people land on **`/portal/dashboard`**. Whoever builds the dashboard should create that page. (Daron has a local-only stub of it for testing that is not in git.)
- Public pages (home, e-board, events calendar, how to join, public resources) stay outside `/portal` and need no account. Never show Torch Token data on a public page.
- The sign-in page is `/login` and the sign-up page is `/signup`. Public-site buttons labelled "Member Login" should link to `/login`.

## Getting the signed-in user

Import from `lib/auth/dal.ts` in Server Components, Server Actions, and route handlers:

```tsx
import { verifySession } from "../../../lib/auth/dal";

export default async function DashboardPage() {
  const user = await verifySession(); // redirects to /login if signed out
  return <h1>Welcome back, {user.name}</h1>;
}
```

- `verifySession(): Promise<User>` for member pages (redirects when signed out).
- `getCurrentUser(): Promise<User | null>` when a page should work for both guests and members.
- `requireRole(permission)` for admin-only screens: `await requireRole("edit_tokens")`.

The `User` shape (never includes the password):

```ts
{ id: number; name: string; email: string; role: "member" | "officer" | "admin"; title: string | null; tokens: number }
```

Put the check in each page or action, not only in a layout. Layouts do not re-run on every navigation.

## Sign out and "Public Website"

Ready-made, unstyled-by-default components for whoever builds the portal frame (sidebar and top bar):

- `components/auth/SignOutButton.tsx` ends the session and returns to `/`.
- `components/auth/PublicWebsiteLink.tsx` links to `/`.

Both accept a `className` to match the shared styles.

## Roles

| Role | Who | Can do |
|---|---|---|
| `member` | Anyone who signs up | Own dashboard, profile, tokens |
| `officer` | Everyone on the e-board | Same as member, plus officer-only features added later |
| `admin` | President and vice president | Everything, plus edit Torch Tokens and change roles and titles |

Each account also has a free-text `title` such as "Treasurer". It is a label only. Permissions come from the role. The permission table is `lib/auth/roles.ts`; to give officers a power later, add it there.

## Editing tokens, roles, titles (for the officer screen)

Admin-only functions in `lib/auth/admin.ts`. Any screen that edits members must call these and never write to the store directly:

- `setMemberTokens(store, actor, targetId, tokens)` (whole number, 0 to 100000)
- `setMemberRole(store, actor, targetId, role)` (refuses to demote the last admin)
- `setMemberTitle(store, actor, targetId, title)`

The `actor` must always come from `verifySession()` or `requireRole()`, never from form fields or request input.

Each returns `{ ok: true, user }` or `{ ok: false, error }` where error is `forbidden`, `not_found`, `invalid`, or `last_admin`. They re-check the actor's role in the database on every call. Use `getStore()` from `lib/db` and the actor from `verifySession()`.

## Setup on your computer

1. `npm install`
2. Copy `.env.example` to `.env` if you want to change anything. Nothing is required.
3. `npm run dev`, then open `/signup` to make a test account.
4. To make yourself an admin for testing:
   `npx tsx --env-file-if-exists=.env scripts/create-admin.ts "Your Name" "you@example.com" "A-Password-1" "President"`
   If that email already has an account, the script refuses and says so (sign-up is open, so someone else could have registered it first). If the account really is yours, add `--promote`: it makes the account admin, **replaces its password** with the one you give, and signs out every existing session.
5. `npm test` runs the unit tests.

Settings in `.env`:

- `JOIN_CODE` empty (default): anyone can sign up. Set it to a word like `GBM-2026` to require that code on the sign-up form.
- `DATABASE_FILE` (default `./data/nsbe.sqlite`): where the local database lives. The `data/` folder and every `.env*` file except `.env.example` are ignored by git. Never commit them.

**Accounts live only on the computer that created them.** A teammate's sign-up will not exist on anyone else's machine. That is fine for the demo and is expected until a hosted database exists.

## Sign-in limits (know these before launch)

- After 5 wrong passwords for one email within 15 minutes, that email cannot sign in until the window passes, even with the right password.
- Consequence: anyone who knows a member's email can keep that member locked out by failing five times every 15 minutes. That is acceptable for the class demo. Before a real launch, key the limit on email plus the visitor's network address and move the counters into the hosted database.
- The counters live in memory in one server process. They reset on restart and are not shared between servers.

## Moving to a real hosted database later

All database access goes through the `Store` interface in `lib/db/types.ts`; only `lib/db/sqlite.ts` knows about SQLite.

1. Pick a hosted database and write a class that implements `Store` for it in `lib/db/`.
2. Change `getStore()` in `lib/db/index.ts` to return the new class (read its connection settings from environment variables).
3. Run the same tests from `lib/db/sqlite.test.ts` against the new class so both behave the same (duplicate emails rejected regardless of case, sessions, role counts).
4. Set the real database settings and `JOIN_CODE` in the hosting provider's environment settings. Never put them in the code.
5. Create the real first admin once with the script, pointing `DATABASE_FILE` or the new connection settings at production.
6. Turn on HTTPS on the host. Session cookies are marked `Secure` automatically in production.

The pages, forms, and admin functions do not change.

## Colors and logo used on the login screens

Taken from the NSBE color card the chapter has (swatches as shown on the card):

- Green `#569A52`, red `#F14B2D`, yellow `#E9D85D`, black `#050403`. Cream `#F1F0E8` and white come from the Figma prototype, not the card.
- The sign-in button fill is a deeper red, `#C8321A`, so white text on it reaches 4.5:1 contrast. The brand red is used for the headline accent and the top stripe.
- The card's printed hex and RGB numbers do not match its own swatches (for example green is listed as RGB 0,255,0 with hex 4FF00, which is not a valid hex code). Confirm exact values with NSBE national before launch.
- The chapter logo is `public/images/nsbe-pennstatehbg-logo.jpeg`. Do not stretch, recolor, or edit it. The screens only show it inside its own circle.
- Colors are written directly in `components/auth/AuthShell.tsx` and `AuthForm.tsx`. When the shared styles land, swap them for the shared color settings.

## The member portal (built from the Figma video)

Everything under `app/portal/` is the signed-in area. The layout (`app/portal/layout.tsx`) draws the sidebar, top bar, and "Skip to main content" link, and checks sign-in. Each page also calls `verifySession()`.

| Page | Address | Notes |
|---|---|---|
| Dashboard | `/portal/dashboard` | Membership status, Torch Tokens, next meeting, upcoming events, announcements |
| Events | `/portal/events` | Links out to Discover East |
| Announcements | `/portal/announcements` | |
| Torch Tokens | `/portal/torch-tokens` | Real balance, progress to the 10-token conference goal. History is an empty note until attendance tracking exists |
| Opportunities | `/portal/opportunities` | |
| Resources | `/portal/resources` | |
| Member Profile | `/portal/profile` | Read-only account details |
| About NSBE | `/portal/about` | |
| Search | `/portal/search?q=` | Searches events, opportunities, resources |
| Manage Members | `/portal/admin/members` | Admins only. Edit tokens, roles, and positions |

- **Real data:** name, role, position, and Torch Tokens come from the signed-in account.
- **Sample content:** events, announcements, opportunities, resources, and the next-meeting card live in `lib/portal/content.ts` and are labelled "sample content" on the pages. Replace them with real information, or feed them from Michael's Discover East events API.
- **Admin screen:** uses the tested functions in `lib/auth/admin.ts`. Only admins see the "Manage Members" link, and the server re-checks on every change.
- **Shared look:** shared class strings are in `components/portal/styles.ts`. They use the colors from `app/globals.css`. The global stylesheet resets link colors and button fonts, so portal links and buttons use Tailwind's `!` where they need a color or weight.

## Not built here (on purpose)

- Automatic Torch Tokens from event attendance (QR or check-in), and a token history list.
- Real announcements, opportunities, and resources (sample content only).
- Editing your own profile, changing your password, email verification, and password reset by email.
