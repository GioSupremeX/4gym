---
name: Dependency security updates
description: Safe dependency maintenance policy for the school site.
---

Dependency updates should be applied through the lockfile and reviewed update proposals, with a scheduled audit check. The running application must never download and replace its own dependencies at runtime.

**Why:** Runtime self-updates create a supply-chain and availability risk; a compromised registry response or broken package could immediately alter or take down the site. Audited lockfile updates preserve reproducibility while keeping the project current.

**How to apply:** Use the package manager to update direct/transitive pins, run the dependency audit, type-check, build, and security scanners, then restart the workflow. Keep Dependabot or an equivalent weekly update mechanism enabled.