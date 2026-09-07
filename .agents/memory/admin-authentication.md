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