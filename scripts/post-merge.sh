#!/usr/bin/env bash
set -euo pipefail

# Reinstall exactly from the reviewed lockfile without interactive prompts.
npm ci --no-audit --no-fund

# Fail fast on type errors. Report dependency advisories, but keep setup moving
# so the merged app can still be schema-synced and rebuilt; remediation remains
# a separate reviewed dependency-update change.
npm run check
if ! npm run security:audit; then
  echo "WARNING: dependency advisories remain; resolve them before publishing." >&2
fi

# Apply safe schema changes. Drizzle must fail rather than auto-approve
# destructive data-loss prompts when stdin is closed by the merge runner.
npm run db:push

# Produce the production bundle after dependencies and schema are current.
npm run build
