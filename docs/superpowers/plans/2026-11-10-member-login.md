# Member Login and Member Entry Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Working sign-up, sign-in, sign-out, three roles, per-member Torch Token balances, admin-only token/role/title functions, and protected member pages, all running locally and swappable to a hosted database later.

**Architecture:** A store-agnostic account layer (`lib/auth/*`) talks to an async `Store` interface (`lib/db/types.ts`); the only implementation now is a local SQLite file via Node's built-in `node:sqlite` (Node 24 here, no native dependency). Sessions are database sessions: a random token in an HttpOnly cookie, only its SHA-256 hash stored. `proxy.ts` does a cheap cookie-presence redirect for `/portal/*`; the real check is `verifySession()` in the data access layer, as the bundled Next.js docs recommend. Server Actions with `useActionState` run the forms.

**Tech Stack:** Next.js 16.3.4 (App Router, TypeScript, Tailwind v4), React 19, Node 24 `node:sqlite`, Node `crypto` (scrypt), Vitest for tests. No auth library, no extra runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-11-10-member-login-design.md`

## Global Constraints

- Next.js 16.3.4 has breaking changes: before writing Next-specific code, read the relevant guide in `node_modules/next/dist/docs/` (already read: `01-app/02-guides/authentication.md`, `01-app/03-api-reference/03-file-conventions/proxy.md`). In this version `middleware` is renamed `proxy` (`proxy.ts` in the project root), and `cookies()` is async.
- Work on branch `daron-login`. Never commit to or push `main`. Never commit secrets, `.env*` files (except `.env.example`), or the database file.
- Put new code in new files and folders. Do not edit `app/page.tsx`, `app/layout.tsx`, `app/globals.css` (teammates' files). Shared components and styles are Hafsah's; the portal shell and dashboard are not this piece's.
- No Penn State SSO and no Penn State credentials. Passwords stored only as scrypt hashes.
- Roles are exactly `member`, `officer`, `admin`. Sign-up always creates `member` with 0 tokens and `title` null. Only `admin` can change tokens, roles, or titles, enforced on the server.
- Stored personal data is only: name, email, role, title, token balance.
- Guests browse public pages with no account; member pages live under `/portal` and require sign-in. No Torch Token data on public pages.
- Chapter join code is an optional setting, **off by default** (env `JOIN_CODE` empty or unset means off).
- Sign-in errors never reveal whether an email exists.
- Forms are accessible: labelled fields, visible focus, errors in an element with `role="alert"`, not color alone, usable at phone width.
- Commits end with these two lines (separated from the message by a blank line):
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01Bsomk3AL2wXqxd6haSh5c6`
- Project decision to confirm with the team: member pages live under `/portal/*`, and the post-login destination is `/portal/dashboard`.

## Review Focus

Inputs and conditions the spec implies but no one will think to test; each has a test in the task named.

1. Same email typed with different case or surrounding spaces (`" Jane@X.com "` vs `jane@x.com`) must be one account (Task 4).
2. The `next` redirect parameter carrying `//evil.com`, `https://evil.com`, `/\evil.com`, or a non-`/portal` path must fall back to `/portal/dashboard` (Task 6).
3. A sign-up request that also posts `role=admin` or `tokens=999` must still create a plain member with 0 tokens (Task 4).
4. An admin demoting themselves, or demoting the only remaining admin, must be refused (Task 5).
5. A garbage, expired, or deleted session cookie must be treated as signed out, never throw (Task 3 and Task 6).
6. A 10,000-character password must be rejected before hashing (Task 1).

## File Structure

```
.env.example                    sample settings, committed
.gitignore                      modify: ignore .env*, data/
vitest.config.ts                test config
proxy.ts                        optimistic redirect for /portal/*
lib/auth/password.ts            hash/verify (scrypt), length cap
lib/auth/roles.ts               Role type, permission check
lib/auth/accounts.ts            validators, signUp, signIn, rate limit
lib/auth/admin.ts               admin-only token/role/title functions
lib/auth/session-core.ts        token generation, hashing, expiry (pure)
lib/auth/session.ts             cookie create/read/delete (Next-specific)
lib/auth/dal.ts                 verifySession, getCurrentUser, requireRole
lib/auth/redirect.ts            safeNextPath
lib/db/types.ts                 User types, Store interface, EmailTakenError
lib/db/sqlite.ts                SqliteStore (node:sqlite)
lib/db/index.ts                 getStore() singleton
app/actions/auth.ts             signup, login, logout Server Actions
app/login/page.tsx              sign-in page
app/signup/page.tsx             sign-up page
components/auth/AuthForm.tsx    shared accessible form pieces (client)
components/auth/SignOutButton.tsx   for the portal-shell owner to place
components/auth/PublicWebsiteLink.tsx   same
scripts/create-admin.ts         one-time first-admin setup
docs/auth-handoff.md            how teammates use all of this, and how to move to a hosted DB
```

---

### Task 1: Branch, test tooling, password hashing

**Files:**
- Create: `vitest.config.ts`, `.env.example`, `lib/auth/password.ts`, `lib/auth/password.test.ts`
- Modify: `.gitignore`, `package.json` (add `"test": "vitest run"` script and `vitest` devDependency)

**Interfaces:**
- Produces: `hashPassword(plain: string): Promise<string>`; `verifyPassword(plain: string, stored: string): Promise<boolean>`; `export const MAX_PASSWORD_LENGTH = 128`; `export const MIN_PASSWORD_LENGTH = 8`. `hashPassword` and `verifyPassword` throw `Error("password_too_long")` if `plain.length > MAX_PASSWORD_LENGTH`.

- [ ] **Step 1:** `git switch -c daron-login`. Run `npm install -D vitest`. Add the `test` script. Create `vitest.config.ts` (environment `node`, include `**/*.test.ts`, exclude `node_modules`, `.next`). Append to `.gitignore`: `.env*`, `!.env.example`, `/data/`. Create `.env.example` with `JOIN_CODE=` and `DATABASE_FILE=./data/nsbe.sqlite` (comments explain: empty join code means off).
- [ ] **Step 2: Write the failing test** `lib/auth/password.test.ts` with tests:
  - `hashes are not the plain password and differ per call`: `hashPassword("Correct-Horse-9")` twice gives two different strings, neither containing the plain text.
  - `verifies the right password`: `verifyPassword("Correct-Horse-9", hash)` is `true`.
  - `rejects the wrong password`: `verifyPassword("wrong", hash)` is `false`.
  - `rejects a malformed stored value without throwing`: `verifyPassword("x", "not-a-hash")` resolves `false`.
  - `refuses a 10,000 character password`: `hashPassword("a".repeat(10000))` rejects with message `password_too_long`.
- [ ] **Step 3:** Run `npx vitest run lib/auth/password.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 4:** Implement in `lib/auth/password.ts` using `node:crypto` `scrypt` with a random 16-byte salt, stored as `scrypt$<saltHex>$<hashHex>`; compare with `timingSafeEqual`.
- [ ] **Step 5:** Run the same command. Expected: 5 passed.
- [ ] **Step 6: Commit** `git add -A && git commit` with message `feat: password hashing and test tooling` (plus the two attribution lines).

---

### Task 2: Roles and permissions

**Files:**
- Create: `lib/auth/roles.ts`, `lib/auth/roles.test.ts`

**Interfaces:**
- Produces: `export type Role = "member" | "officer" | "admin"`; `export type Permission = "edit_tokens" | "edit_roles" | "edit_titles"`; `can(role: Role, permission: Permission): boolean`; `isRole(value: unknown): value is Role`.

- [ ] **Step 1: Write the failing test:** `can("admin", p)` is true for all three permissions; `can("officer", p)` and `can("member", p)` are false for all three; `isRole("admin")` true, `isRole("president")` false, `isRole(undefined)` false.
- [ ] **Step 2:** Run `npx vitest run lib/auth/roles.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `lib/auth/roles.ts` with a single permission table keyed by role, so later giving officers a permission is a one-line change.
- [ ] **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5: Commit** `feat: role and permission model`.

---

### Task 3: Store interface, SQLite store, session primitives

**Files:**
- Create: `lib/db/types.ts`, `lib/db/sqlite.ts`, `lib/db/sqlite.test.ts`, `lib/db/index.ts`, `lib/auth/session-core.ts`, `lib/auth/session-core.test.ts`

**Interfaces:**
- Produces in `lib/db/types.ts`:
  - `interface User { id: number; name: string; email: string; role: Role; title: string | null; tokens: number }`
  - `interface UserRecord extends User { passwordHash: string }`
  - `class EmailTakenError extends Error {}`
  - `interface Store` with: `createUser(input: { name: string; email: string; passwordHash: string; role: Role; title: string | null }): Promise<UserRecord>` (throws `EmailTakenError`); `findUserByEmail(email: string): Promise<UserRecord | null>`; `findUserById(id: number): Promise<UserRecord | null>`; `updateUser(id: number, patch: { role?: Role; title?: string | null; tokens?: number }): Promise<UserRecord | null>`; `countUsersWithRole(role: Role): Promise<number>`; `createSession(input: { tokenHash: string; userId: number; expiresAt: number }): Promise<void>`; `findSession(tokenHash: string): Promise<{ userId: number; expiresAt: number } | null>`; `deleteSession(tokenHash: string): Promise<void>`.
  - Emails are stored and matched lowercase; the store lowercases and trims defensively.
- Produces in `lib/db/sqlite.ts`: `class SqliteStore implements Store` with `constructor(file: string)` (`":memory:"` allowed; creates parent folder and tables if missing).
- Produces in `lib/db/index.ts`: `getStore(): Store` returning one shared `SqliteStore` at `process.env.DATABASE_FILE ?? "./data/nsbe.sqlite"`.
- Produces in `lib/auth/session-core.ts`: `SESSION_DAYS = 7`; `newSessionToken(): string` (32 random bytes, base64url); `hashSessionToken(token: string): string` (SHA-256 hex); `sessionExpiry(now?: number): number` (ms epoch).

- [ ] **Step 1: Write the failing tests.**
  - `sqlite.test.ts` (uses `new SqliteStore(":memory:")`): creates a user and finds it by email and by id; new users have `tokens` 0 when created through the store defaults; creating a second user with the same email in different case rejects with `EmailTakenError`; `updateUser` changes `tokens` and `role` independently and returns the new record; `countUsersWithRole("admin")` counts correctly; session create, find, delete round trip; `findSession` of an unknown hash is `null`.
  - `session-core.test.ts`: two `newSessionToken()` calls differ and are at least 40 characters; `hashSessionToken` is deterministic and not equal to its input; `sessionExpiry(0)` equals 7 days in ms.
- [ ] **Step 2:** Run `npx vitest run lib/db lib/auth/session-core.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement. Use `DatabaseSync` from `node:sqlite` with parameterized statements only. If Vitest cannot load `node:sqlite` (error mentioning an unknown builtin), add `server: { deps: { external: [/^node:sqlite$/] } }` to `vitest.config.ts` or run these tests with `node --test`; do not replace `node:sqlite`.
- [ ] **Step 4:** Run the same command. Expected: all pass.
- [ ] **Step 5: Commit** `feat: store interface, sqlite store, session primitives`.

---

### Task 4: Accounts: sign-up, sign-in, validation, rate limiting

**Files:**
- Create: `lib/auth/accounts.ts`, `lib/auth/accounts.test.ts`

**Interfaces:**
- Consumes: `Store`, `User`, `EmailTakenError` (Task 3); `hashPassword`, `verifyPassword`, `MIN_PASSWORD_LENGTH`, `MAX_PASSWORD_LENGTH` (Task 1).
- Produces:
  - `normalizeEmail(email: string): string` (trim + lowercase)
  - `type FieldErrors = { name?: string[]; email?: string[]; password?: string[]; joinCode?: string[] }`
  - `signUp(store: Store, input: { name: unknown; email: unknown; password: unknown; joinCode?: unknown }, opts?: { requiredJoinCode?: string }): Promise<{ ok: true; user: User } | { ok: false; errors: FieldErrors }>` — any other fields on `input` are ignored; always creates `role: "member"`, `title: null`.
  - `signIn(store: Store, input: { email: unknown; password: unknown }, opts?: { now?: number }): Promise<{ ok: true; user: User } | { ok: false; message: string }>` — failure message is always exactly `"Incorrect email or password."`; also returned when rate-limited, with message `"Too many attempts. Try again in a few minutes."`
  - Rate limit: 5 failed attempts per normalized email within 15 minutes, tracked in memory; success clears the counter. Exported `resetRateLimits(): void` for tests.
  - Validation rules: name 2 to 80 characters after trimming; email contains one `@` with text on both sides and a dot in the domain, max 254; password `MIN_PASSWORD_LENGTH` to `MAX_PASSWORD_LENGTH` characters and at least one letter and one number; join code checked only when `opts.requiredJoinCode` is a non-empty string.

- [ ] **Step 1: Write the failing tests** (each with a fresh `SqliteStore(":memory:")` and `resetRateLimits()` in `beforeEach`):
  - `signUp creates a member with 0 tokens and no title`.
  - `signUp ignores role and tokens in the input`: pass `{ ..., role: "admin", tokens: 999 }`; result user has `role "member"`, `tokens 0`.
  - `signUp treats email case and spaces as the same account`: sign up `"jane@x.com"`, then `" Jane@X.com "` returns `ok: false` with an `email` error.
  - `signUp reports each invalid field`: empty name, `"nope"` email, `"short1"` password each yield errors on the right key; a 10,000-character password yields a `password` error without throwing.
  - `join code is only enforced when configured`: with `requiredJoinCode: "GBM-2026"`, missing or wrong code fails with a `joinCode` error and the right code succeeds; with no `requiredJoinCode`, no code is needed.
  - `signIn succeeds with correct credentials, any email case`.
  - `signIn gives the identical message for unknown email and wrong password`.
  - `signIn locks after 5 failures`: the 6th attempt, even with the right password, returns the "Too many attempts" message; with `opts.now` 16 minutes later it succeeds.
- [ ] **Step 2:** Run `npx vitest run lib/auth/accounts.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `lib/auth/accounts.ts` to the signatures above. To keep unknown-email and wrong-password timing similar, verify against a fixed dummy hash when the user is not found.
- [ ] **Step 4:** Run it. Expected: all pass.
- [ ] **Step 5: Commit** `feat: sign-up and sign-in logic`.

---

### Task 5: Admin-only functions

**Files:**
- Create: `lib/auth/admin.ts`, `lib/auth/admin.test.ts`

**Interfaces:**
- Consumes: `Store`, `User`, `Role`, `can`, `isRole`.
- Produces (each takes the acting user as `actor: User` and returns `{ ok: true; user: User } | { ok: false; error: "forbidden" | "not_found" | "invalid" | "last_admin" }`):
  - `setMemberTokens(store: Store, actor: User, targetId: number, tokens: number)` — tokens must be an integer from 0 to 100000.
  - `setMemberRole(store: Store, actor: User, targetId: number, role: unknown)`
  - `setMemberTitle(store: Store, actor: User, targetId: number, title: string | null)` — trimmed, max 60 characters, empty becomes `null`.
- Permission is decided from the actor's role as stored in the database at call time, not from the `actor` object passed in (so a stale session cannot keep admin powers).

- [ ] **Step 1: Write the failing tests:**
  - member and officer actors get `forbidden` from all three functions and the target is unchanged.
  - admin can set tokens (`42`), and an officer-then-promoted account can be given a title.
  - `setMemberTokens` rejects `-1`, `1.5`, `NaN`, and `1e9` with `invalid`.
  - `setMemberRole` rejects `"president"` with `invalid`.
  - unknown `targetId` gives `not_found`.
  - an admin changing their own role to `member` while they are the only admin gives `last_admin`; with a second admin present it succeeds.
  - an admin demoted in the database after their session was loaded gets `forbidden` even though the `actor` object still says `admin`.
- [ ] **Step 2:** Run `npx vitest run lib/auth/admin.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement. Re-read the actor with `store.findUserById` before checking `can`.
- [ ] **Step 4:** Run it. Expected: all pass.
- [ ] **Step 5: Commit** `feat: admin-only token, role, and title functions`.

---

### Task 6: Cookie session, data access layer, safe redirects, proxy

**Files:**
- Create: `lib/auth/redirect.ts`, `lib/auth/redirect.test.ts`, `lib/auth/session.ts`, `lib/auth/dal.ts`, `proxy.ts`
- Test (pure parts only): `lib/auth/redirect.test.ts`

**Interfaces:**
- Consumes: `getStore`, `newSessionToken`, `hashSessionToken`, `sessionExpiry`, `SESSION_DAYS`, `User`, `Role`.
- Produces:
  - `safeNextPath(next: unknown): string` — returns `next` only if it is a string starting with `/portal` followed by end, `/`, `?`, or `#`, and contains no `//`, `\`, or `:` before the first `?`; otherwise `"/portal/dashboard"`.
  - `SESSION_COOKIE = "nsbe_session"`; `createSession(userId: number): Promise<void>`, `deleteSession(): Promise<void>`, `readSessionUser(): Promise<User | null>` in `lib/auth/session.ts` (`import "server-only"`; cookie options `httpOnly`, `sameSite: "lax"`, `path: "/"`, `secure` only when `NODE_ENV === "production"`, `expires` at the session expiry). `readSessionUser` returns `null` for a missing, unknown, or expired token and deletes expired sessions.
  - In `lib/auth/dal.ts` (`import "server-only"`): `getCurrentUser(): Promise<User | null>` (cached per request with React `cache`); `verifySession(): Promise<User>` redirects to `/login` when signed out; `requireRole(permission: Permission): Promise<User>` redirects to `/portal/dashboard` when the user lacks the permission. These return the `User` shape only (no password hash).
  - `proxy.ts`: for paths matching `/portal/:path*`, if the `nsbe_session` cookie is absent, redirect to `/login?next=<original path and query>`; otherwise `NextResponse.next()`. Cookie presence only, no database access.

- [ ] **Step 1: Write the failing test** `redirect.test.ts`: `safeNextPath("/portal/events")` returns it unchanged; `"/portal/torch-tokens?tab=history"` unchanged; each of `"//evil.com"`, `"https://evil.com"`, `"/\\evil.com"`, `"/dashboard"`, `"/portalx"`, `"/portal//evil.com"`, `undefined`, `""`, and `["/portal/a"]` returns `"/portal/dashboard"`.
- [ ] **Step 2:** Run `npx vitest run lib/auth/redirect.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `redirect.ts`, then `session.ts`, `dal.ts`, `proxy.ts` per the interfaces, following the bundled docs' patterns (async `cookies()`, `proxy` export, `config.matcher`).
- [ ] **Step 4:** Run `npx vitest run lib/auth/redirect.test.ts` (expect PASS), then `npx tsc --noEmit` (expect no errors) and `npm run build` (expect a successful build; if Next reports a convention problem, re-read the proxy doc before changing code).
- [ ] **Step 5: Commit** `feat: cookie sessions, data access layer, route proxy`.

---

### Task 7: Server Actions, sign-in and sign-up pages, portal components

**Files:**
- Create: `app/actions/auth.ts`, `app/login/page.tsx`, `app/signup/page.tsx`, `components/auth/AuthForm.tsx`, `components/auth/SignOutButton.tsx`, `components/auth/PublicWebsiteLink.tsx`
- Local-only (never committed): `app/portal/dashboard/page.tsx` stub, excluded via `.git/info/exclude`

**Interfaces:**
- Consumes: `signUp`, `signIn`, `getStore`, `createSession`, `deleteSession`, `safeNextPath`, `FieldErrors`.
- Produces in `app/actions/auth.ts` (`"use server"`):
  - `type FormState = { errors?: FieldErrors; message?: string } | undefined`
  - `signupAction(state: FormState, formData: FormData): Promise<FormState>` — on success creates the session and `redirect("/portal/dashboard")`. Reads `JOIN_CODE` from the environment as `requiredJoinCode`.
  - `loginAction(state: FormState, formData: FormData): Promise<FormState>` — on success creates the session and `redirect(safeNextPath(formData.get("next")))`.
  - `logoutAction(): Promise<void>` — deletes the session (database row and cookie) and `redirect("/")`.
- Produces components: `<SignOutButton />` (a form posting `logoutAction`, button text "Sign Out"); `<PublicWebsiteLink />` (a link to `/`, text "Public Website"); `<AuthForm mode="login" | "signup" next?: string />` (client component using `useActionState`).
- Pages: `/login` and `/signup` read `searchParams.next` (a Promise in this Next version; await it) and pass it through; each links to the other; a signed-in visitor opening either is redirected to `/portal/dashboard`. The sign-up form includes the join-code field only when `process.env.JOIN_CODE` is non-empty. Styling follows the prototype: cream background (`#ECEBDF`-like), black text, red primary button, bold condensed uppercase headings, plain Tailwind classes, no imports of teammates' components.

- [ ] **Step 1:** Add `app/portal/dashboard/page.tsx` as a stub that calls `verifySession()` and shows `Signed in as {name} ({role}), {tokens} tokens`, the `SignOutButton`, and `PublicWebsiteLink`. Append `app/portal/` to `.git/info/exclude`. Confirm `git status` does not list it.
- [ ] **Step 2:** Implement the actions, components, and pages to the interfaces above, reading the bundled `forms.md` and `server-actions.md` guides first.
- [ ] **Step 3:** Run `npx tsc --noEmit` and `npm run lint`. Expected: no errors.
- [ ] **Step 4: Commit** `feat: login and sign-up pages, auth actions, portal components` (the stub must not be included; check `git show --stat HEAD`).

---

### Task 8: First-admin setup script

**Files:**
- Create: `scripts/create-admin.ts`, `scripts/create-admin.test.ts`

**Interfaces:**
- Consumes: `SqliteStore`, `hashPassword`, `normalizeEmail`.
- Produces: `createAdmin(store: Store, input: { name: string; email: string; password: string; title: string }): Promise<UserRecord>` (exported, creates or promotes: if the email already exists, sets role `admin` and the title; otherwise creates the account as `admin`). CLI: `node --env-file-if-exists=.env scripts/create-admin.ts "<name>" "<email>" "<password>" "<title>"` prints the new admin's email and role, never the password.

- [ ] **Step 1: Write the failing test:** with an in-memory store, `createAdmin` on a new email gives role `admin` and the title; on an existing member email promotes the same account (same id) without changing their tokens; a password under 8 characters rejects.
- [ ] **Step 2:** Run `npx vitest run scripts/create-admin.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `createAdmin` and a small CLI wrapper guarded so importing the module does not run the CLI.
- [ ] **Step 4:** Run the test (expect PASS), then run the CLI once against `DATABASE_FILE=./data/dev.sqlite` and confirm the output line.
- [ ] **Step 5: Commit** `feat: first-admin setup script`.

---

### Task 9: End-to-end verification in a browser and hand-off notes

**Files:**
- Create: `docs/auth-handoff.md`

- [ ] **Step 1:** Run `npm run test` (all green) and `npm run build` (succeeds).
- [ ] **Step 2:** Start `npm run dev` and use the browser-automation skill to verify, with a screenshot of each: (a) `/` still loads for a guest with no redirect; (b) `/portal/dashboard` as a guest redirects to `/login?next=%2Fportal%2Fdashboard`; (c) sign-up with a new email lands on the dashboard stub showing role `member`, tokens 0; (d) sign out returns to `/`, and `/portal/dashboard` redirects to sign-in again; (e) sign-in with a wrong password shows the generic error in an element with `role="alert"`; (f) sign-in with the right password lands on the originally requested page; (g) `/login?next=//evil.com` signs in and lands on `/portal/dashboard`; (h) keyboard-only: Tab reaches every field and button with visible focus; (i) the pages have no horizontal scroll at 375px width. No console errors.
- [ ] **Step 3:** Write `docs/auth-handoff.md` covering, for teammates: the `/portal/*` rule and the post-login route; `verifySession()`, `getCurrentUser()`, `requireRole()` with one example each; `SignOutButton` and `PublicWebsiteLink` placement; the `User` shape; the three roles and which functions only admins may call (`setMemberTokens`, `setMemberRole`, `setMemberTitle`) with the note that an officer-only screen should call these and never write to the store directly; `.env.example` settings including how to turn on `JOIN_CODE`; how to create the first admin; and **how to move to a hosted database**: implement `Store` for the new database in `lib/db/`, point `getStore()` at it, keep the tests in `lib/db/` running against both stores, and set the real session and database settings in the host's environment. State plainly that until then accounts exist only on the computer that created them.
- [ ] **Step 4:** Confirm `git status` shows no `data/`, `.env`, or `app/portal/` files staged. **Commit** `docs: authentication hand-off notes`.
- [ ] **Step 5:** Push the branch with `git push -u origin daron-login` only after the owner says to push; then report the branch name so the team lead can review and merge.
