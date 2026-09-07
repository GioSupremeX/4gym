---
name: Admin authentication
description: Durable authentication and onboarding decisions for the administrator control room.
---

Use named administrator accounts rather than a shared passcode. Keep credential
verification on the server with PostgreSQL-backed sessions, persistent
escalating lockouts, password hashing, and role checks on every private
mutation.

**Why:** The original browser-side shared passcode exposed a single credential
and made lockout state easy to bypass. Separate accounts make revocation,
auditing, password changes, and 2FA practical.

**How to apply:** Preserve the one-time legacy migration only for existing
installations; new account and security changes must use the account APIs.
2FA onboarding should provide a QR otpauth URI plus recovery codes, use the
SHA-256 TOTP profile consistently, and keep manual secret entry only as a
fallback.

The `administrator` account is the protected owner. Credits visibility is an
owner-only operation exposed through the site hotkey, not through the regular
settings form. Additional accounts use least-privilege roles: editor,
moderator, or admin.

**Why:** This is a school site, so the owner must remain recoverable while
helpers can receive only the content or moderation access they need. Hiding a
credits control in the UI is not security; the server-side owner check is the
actual boundary.

**How to apply:** Never add a delete or disable path for the owner account.
Keep the credits hotkey as a convenience only and protect its API with the
owner role.