# Threat Model

## Project Overview

This is a public Greek school website built with React, Express, Drizzle ORM, and
PostgreSQL. Visitors can read school content, comment, report comments, contact
the school, and subscribe to the newsletter. Administrators manage content and
private contact/subscriber data through the control room.

## Assets

- **Administrator accounts and sessions** — compromise permits content changes,
  moderation, and access to private messages and subscriber email addresses.
- **School content** — articles, announcements, settings, images, and links.
- **Visitor-submitted data** — names, email addresses, comments, reports, and
  contact messages.
- **Authentication material** — password hashes, encrypted 2FA secrets,
  recovery-code hashes, session cookies, and the session signing secret.
- **Audit history** — records of sensitive administrator actions.

## Trust Boundaries

- **Public browser to Express API** — all client input is untrusted.
- **Authenticated control room to admin API** — authentication and role checks
  must be enforced server-side, not only by the React UI.
- **Express API to PostgreSQL** — database queries and stored data must not expose
  credentials or private admin data.
- **Public content to rendered browser UI** — uploaded image data and URLs must
  be bounded and safely handled.
- **Development database to published production database** — schema changes
  must be applied through the supported publish flow.

## Scan Anchors

- **Production entry point:** `server/index.ts`
- **Highest-risk areas:** `server/auth.ts`, `server/routes.ts`, `server/storage.ts`,
  `shared/schema.ts`, and `client/src/pages/AdminDashboard.tsx`
- **Public surfaces:** articles, announcements, settings content, comments,
  reports, contact, and newsletter submission endpoints
- **Authenticated surfaces:** administrator account, content-management, private
  message/subscriber, moderation, audit, and 2FA endpoints
- **Dev-only areas:** Vite development setup and build scripts

## Threat Categories

### Spoofing

Attackers may brute-force administrator credentials or steal/reuse sessions.
Administrator passwords must be scrypt-hashed, login attempts must be tracked
persistently with escalating lockouts, sessions must be HttpOnly and rotated at
login, and optional TOTP 2FA must be verified before a session is authenticated.
Changing a password must invalidate other sessions through the account version.

### Tampering

Unauthenticated clients must not create, edit, or delete school content or
private records. Every admin route must check the session and role on the server.
All request payloads must be schema-validated with practical size limits, and
state-changing browser requests must pass same-origin checks.

### Repudiation

Sensitive administrator actions must create an audit record containing the
acting account, action, timestamp, IP address, and limited non-sensitive details.
Passwords, OTPs, recovery codes, session cookies, and private message bodies must
never be written to logs.

### Information Disclosure

The public settings response must never contain the legacy admin code, password
hashes, 2FA secrets, recovery-code hashes, audit logs, or private contact and
subscriber records. API errors should be generic for authentication failures so
they do not reveal whether a username exists.

### Denial of Service

Authentication and public form endpoints need request rate limits in addition to
business cooldowns. JSON and URL-encoded bodies, article text, image data,
comments, reports, contact messages, and account credentials must have bounded
sizes. Persistent lockout state must work across app restarts and instances.

### Elevation of Privilege

Account-management operations must be restricted to administrators, while the
client must never be trusted to decide roles. Disabled accounts and sessions
with stale authentication versions must be rejected. Database access must use
parameterized ORM queries, and user-controlled URLs must not trigger server-side
fetches.