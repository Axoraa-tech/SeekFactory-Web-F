# Production dependency remediation

Compatible security updates on the existing concurrency PR:

| Package | Before | After |
| --- | --- | --- |
| Next.js / matching eslint config | 15.5.26 | 15.5.28 |
| next-intl | 4.4.0 | 4.9.2 |
| sharp | 0.34.5 | 0.35.5 |
| Next's nested PostCSS | 8.4.31 | 8.5.26 (override/deduplication) |
| source-map-js | 1.2.1 | 1.2.2 |

`npm audit --omit=dev` reports zero production findings after the lockfile update. This replaces the
earlier result of one critical, three high and one moderate affected-package entry. It is not a full
security audit or a claim that every vulnerability is known to the registry. Existing configuration
continues to disallow remote Next image hosts and does not enable SVG optimization.

The Next patch addresses the relevant App Router / Server Actions denial-of-service advisory
[GHSA-p3m5-59mp-jv5r](https://github.com/advisories/GHSA-p3m5-59mp-jv5r) and image optimization advisory
[GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw). The other package patches address
the transitive image/source-map and next-intl findings recorded in the original PR audit.

Regression checks: all 154 web tests, TypeScript checking and a production standalone build passed
locally. The public API URL used for build validation was loopback-only; no production API or cloud
resource was used. See the PR for the current remote CI status and the backend validation report for
resource-limited full-stack results, including failures. No production deployment or merge is part
of this change.

The API proxy now removes hop-by-hop headers in both directions, including headers named by the
`Connection` field. In particular, Tomcat's `Keep-Alive` metadata must not describe the separate
browser-to-Next connection. A route-level regression checks request filtering and a206 media response,
preserving range/cache headers while removing backend cookies and transport framing. See the backend
burst diagnostic evidence for measured transport outcomes; this correction alone is not a capacity claim.
