# Member Login and Member Entry Flow: Design

Project: NSBE Penn State Harrisburg website redesign (HCDD 440 capstone, "Project NSBE Nexus").
Owner of this piece: Daron Nyarko. Written 2026-11-10.

## Intent and why

The redesigned site has a public side for prospective members and a private member portal (dashboard, events, announcements, Torch Tokens, opportunities, resources, member profile, about). The portal is only useful if each member has their own identity, because **Torch Tokens** are per-person: members earn them by attending events, and the chapter uses them (for example, 10 tokens to qualify for conferences). So the site needs accounts.

This piece delivers: accounts, sign-in, sign-out, roles, and protected member pages, so the portal is fully functional with the rest of the site. It is one of four parallel work streams (home page + shared components, dashboard, About/Events/Resources pages, and this one). Teammates must be able to build on it without touching the same files.

The visual target is the existing Figma prototype (shown in the screen recording `Screen Recording 2026-11-04 195531.mp4`): cream, black, red, green, and yellow palette, bold condensed headings, black left sidebar in the portal. The recording does not include a sign-in or sign-up screen, so those screens are designed here in the same style.

## Goals

1. Anyone can create an account with an email and a password made for this site.
2. A signed-in member can reach the member portal; a visitor who is not signed in cannot, and is sent to sign in.
2a. **Guests can browse the public site freely.** The site never opens on a sign-in or sign-up page. The public landing page, events, officers, and other public pages need no account. Sign-in is only required for member pages, and is reached by choosing "Member Login".
   - **Public (guests and prospective members):** landing page, about the chapter, meet the e-board / officers, public event calendar and upcoming events, how to join (Discover East), public resources, and the sign-in and sign-up pages.
   - **Members only (requires sign-in):** dashboard, Torch Tokens and token history, member profile, announcements, opportunities, member-only resources, RSVP status and member notes. A guest who opens any of these addresses sees no member data and is sent to sign in. No Torch Token information appears anywhere on public pages.
3. Each account has its own Torch Token balance. New accounts start at 0.
4. A role system with three levels: member, officer, admin.
5. Only admins can change anyone's Torch Tokens or anyone's role. This is enforced on the server, not just hidden in the interface.
6. The public site and member portal are linked as in the prototype: "Member Login" on the public site, "Public Website" and "Sign Out" in the portal.
7. Other teammates can read the signed-in user (name, role, title, tokens) from one clear place and can protect their own pages with one clear mechanism.

## Non-goals

- Penn State single sign-on or any Penn State credential handling.
- The officer-facing screen for looking up a member and editing tokens (belongs to the dashboard work stream; this piece only provides the permission check and the data field).
- Automatic Torch Tokens from event attendance (QR or check-in code). Possible later add-on for the team.
- Email verification, password reset by email, and two-factor sign-in, unless the builder finds one is cheap. Not required for the capstone.
- Final shared components, navbar, and global styles (Hafsah's work stream).

## Anti-goals (would make this a failure even if it technically works)

- Asking for, storing, or accepting a Penn State password anywhere.
- Passwords stored in readable form, or committed to GitHub in any form (including secrets and database files).
- A member being able to raise their own tokens, change their own role, or see another member's private data by editing a URL or request.
- The interface claiming "Signed in with Penn State SSO" (the prototype's sidebar footer says this; it must be changed to something true).
- Edits that collide with teammates' files and cause merge conflicts.

## Roles

| Role | Who | Can do |
|---|---|---|
| member | Anyone who signs up | See own dashboard, profile, and tokens |
| officer | Everyone on the e-board: treasurer, secretary, senator, social media manager, communications chair, event planning chair, and similar | Everything a member can; plus officer-only features that teammates may add later |
| admin | President and vice president | Everything an officer can; plus edit any member's Torch Tokens and change any member's role |

Each account also has a **title**, a free-text display label such as "Treasurer" or "Event Planning Chair". The title is a label only. Permissions come only from the role. Officers have no token powers for now; the structure allows granting officers specific powers later without redesign.

Admins assign and change roles from inside the site, so when new officers are elected nobody edits code. The first admin(s) must exist without a chicken-and-egg problem: a short, configured list of admin emails (for example in an environment setting, not in source code) makes matching sign-ups admins on creation. *(Builder's call on exact mechanism; see below.)*

## The member entry flow (what a person experiences)

1. A prospective member lands on the public site (the prototype's landing page). It shows the chapter, events, officers, and the "Join through Discover East" call to action. Discover East is where Penn State students formally join the organization; that link stays as is.
2. A current member clicks **Member Login** (public site header or the "Access member event tools" band on the events page). They reach the sign-in screen.
3. Sign-in: email and password, a link to create an account, clear error messages that do not reveal whether an email exists.
4. Sign-up: name, email, password (with a visible requirements hint and a show-password option). On success the person is signed in and lands on the dashboard with 0 tokens. The dashboard should make clear what to do next: let the vice president know so tokens can be added. *(Guess: a short banner; wording left to builder.)*
5. In the portal, "Public Website" returns to the public site and "Sign Out" ends the session and returns to the public site. A signed-out visitor who opens a portal URL is sent to sign in and, after signing in, returned to the page they wanted.
6. Token updates: an admin changes a member's balance; the member sees the new value on their next page load.

Accessibility matters here because the owner of this piece is the project's accessibility and usability specialist: labelled form fields, visible keyboard focus, error messages announced to screen readers and not conveyed by color alone, sufficient contrast, usable on phone, tablet, and desktop (the project's WCAG goals).

## Constraints

- Stack is fixed by the team: Next.js 16.3.4 (App Router, TypeScript, Tailwind v4), React 19. The repo's `AGENTS.md` states this Next.js version has breaking changes; the builder must read `node_modules/next/dist/docs/` before writing code.
- Work in a branch named for this piece. Never push to `main` directly. Keep changes in new files and folders where possible so they do not collide with teammates (shared components and styles are Hafsah's; dashboard is another teammate's; About/Events/Resources are another's).
- Project budget allows roughly $400 for website and hosting, so the solution should not depend on a paid service. Hosting is not decided; the chosen approach should be able to run on common hosting for Next.js and also run on each teammate's laptop with minimal setup.
- This is a class project, not a production system for real student identity data. Keep stored personal data to the minimum needed (name, email, role, title, token balance).

## Decided by the owner

- No Penn State SSO. Own accounts, separate from Penn State.
- Anyone can sign up; new accounts start at 0 tokens.
- Three roles (member, officer, admin); president and vice president are admin; the rest of the e-board are officers; officers cannot edit tokens.
- Token editing screen and automatic attendance tokens are out of this piece's scope.
- Design the sign-in and sign-up screens in the prototype's style.

## Left to the builder

- How accounts and tokens are stored (database choice), and how sessions work, within the constraints above.
- Whether to use an established authentication library or write the minimum by hand.
- Exact password rules, rate limiting on sign-in attempts, and session length.
- The route structure and file layout, as long as it follows the Next.js conventions in the installed docs and stays out of teammates' files.
- How the first admin accounts are created and how officers' titles are set.
- Exact wording of messages and banners.

## Decided by the owner after the builder check

- **Scope boundary:** this piece does not build the portal shell (sidebar, top bar, layout, dashboard, other portal pages). It provides: sign-in and sign-up pages, sign-out, session/current-user helper, protection for member pages, roles, and the server-side admin functions. It also provides a ready-to-use sign-out button and the "Public Website" link behavior for the portal owner to place. The owner is confirming with the team lead who builds the portal shell. After sign-in or sign-up, the person is sent to the dashboard route owned by the dashboard teammate; until it exists, a throwaway local stub may be used for testing and must not be committed.
- **Sign-up is open to any email address** with no verification.
- **Chapter join code:** the owner considers it not really necessary. Build it as an optional setting that is **off by default**, so officers can turn it on later if outsiders become a problem.

## Team agreement from the group chat (2026-11-10)

- Work split: Hafsah builds the home page and the shared components and styles; Michael builds About, Resources, and Events; this piece (Daron) builds login and member entry; the dashboard work stream is not yet claimed in the chat (the fourth team member, Connor, has not replied, so the portal shell and dashboard are most likely his, unconfirmed).
- Michael pointed out that real users need a real database ("SQL stuff"), and that this can come later. Hafsah's priority is: get the general flow between pages and the login working first; a working version could let NSBE launch later.
- **Consequence for this piece:** the goal now is a fully working sign-up, sign-in, role, and token flow that runs on each teammate's laptop for the demo, with all data access kept behind one small layer so a real hosted database can replace the local one later without rewriting pages. The local data store must be excluded from GitHub. Choosing and setting up the hosted production database is a separate later task, not part of this piece, and the final document should say clearly what has to be done to move to it.

## Calls made by the writer (marked as guesses; owner may overrule)

- **Admin screens:** this piece delivers only server-side functions to set a member's role, title, and tokens (admin-only, enforced on the server), plus protection against demoting the last admin. Any screen that uses them belongs to the dashboard work stream.
- **Who sees what:** a member can read only their own record (name, email, role, title, tokens). Admins can read and edit every record. Officers see only their own record for now. No directory or leaderboard is part of this piece.
- **First admin:** created by a one-time setup step run by the owner of this piece (not by "first person to sign up with a listed email"), so nobody can claim admin by signing up first.

## Open assumptions (guesses, not confirmed by the owner)

- Officer and admin status can be seeded from a configured email list and later changed by an admin in the site.
- A member who had tokens before the site existed starts at 0 and the vice president enters their balance by hand.
