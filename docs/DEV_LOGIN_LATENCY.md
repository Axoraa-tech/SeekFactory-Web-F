# DEV login investigation — 2026-10-24

Scope: Web DEV at `29a2ecf` and backend DEV at `f9695c9`. No deployment, hosting,
database data/schema, security configuration, mobile or production changes.

## Findings and limits

The reported 2–3 minute successful login was **not reproduced** in this run.
The two confirmed code issues below add avoidable waits; these measurements do
not establish that they explain the entire reported delay.

1. Buyer/manufacturer login awaited `POST /auth/login` and then `GET /auth/me`
   serially before navigating, although the login response already contains identity.
   Phone and Google sign-in have the same extra profile dependency. Remove that
   pre-navigation GET. Destination pages still load and authorize the complete profile
   using the backend and HttpOnly cookies. Registration keeps its profile request
   so its email-verification notice keeps working.
2. Middleware refreshed expired marketplace credentials on `/admin/*` and
   `/api/admin/*`. An admin request could therefore wait on an unrelated buyer
   refresh before the real admin request even started. Four regression cases
   reproduced that extra call before the change and pass after it. Skip only this
   unrelated refresh in admin context. Admin cookie gating, backend password,
   role, active-account and TOTP checks remain in place.

No automatic login retry loop was found. The general proxy can replay a protected
request once after a 401/refresh; it does not replay token-issuing login requests.
The refresh fetch has no application timeout, so the unrelated admin dependency
could last until the hosting/network timeout. Its actual long duration was not
observed here. No arbitrary short timeout or authentication bypass was added.

## Observed timings

All samples below are against existing DEV, **before deploying this patch**.
Initial samples are first observed requests, not proof of a cold instance.
The backend was already warm; no restart or forced sleep was performed.

| Request | First observed total | Repeat total | Status |
| --- | ---: | ---: | --- |
| Web `/login` | 1.338 s | 1.009 s | 200 |
| Web proxy `/auth/me`, anonymous | 0.615 s | 1.283 s | 401 |
| Direct backend `/actuator/health` | 0.509 s | 0.527 s | 200 |
| Direct backend `/categories` | 0.247 s | 0.580 s | 200 |
| Web proxy `/categories` | 0.858 s | — | 200 |

The first login HTML request spent 0.026 s in DNS, reached TCP at 0.067 s,
completed TLS at 0.415 s and reached first byte at 0.955 s. These are cumulative
curl timings, not additive stages. Small JSON/HTML responses only were requested.

An existing authorized supplier session was checked in a separate browser tab:

| Authenticated proxy response | Browser navigation wall time | Result |
| --- | ---: | --- |
| `/auth/me` | 1.306 s | Supplier profile, success |
| `/factory/profile` | 1.838 s | success |
| `/factory/stats` | 2.023 s | success |
| `/factory/verification` | 1.483 s | success |
| `/api/admin/dashboard/analytics?days=30` | 0.682 s | no admin token, rejected |

Browser values include automation/navigation overhead, so they are not precise
HTTP transfer timings. No credentials or cookies were extracted. User-owned tabs
were not navigated or logged out. The profile page redirected the supplier to
the home feed once; subsequent checks used JSON endpoints to avoid media downloads.

## Request sequence and counts

These are source counts and regression-test counts, **not a captured successful
production browser waterfall**. They exclude static assets, media, polling,
prefetches, caching effects and retries of expired protected sessions.

```text
Buyer/manufacturer before: POST login -> GET auth/me -> destination render
Buyer/manufacturer after:  POST login ----------------> destination render

Admin with expired buyer cookie before:
  buyer refresh -> POST admin login -> dashboard
  (admin route and subsequent admin APIs can also wait on buyer refresh)
Admin after:
  POST admin login -> dashboard
```

- Buyer home render: 6 shell requests in parallel plus feed and showcase = 8
  distinct initial data requests. Page/layout duplicate categories and identity
  calls share the request-scoped client added in prior work. Revalidation may
  avoid some backend hits. Additional catalog client requests are separate.
- Manufacturer destination: identity/role check, then 9 dashboard data requests
  in parallel. Page/layout identity reads share the request-scoped client.
- Admin: one password/TOTP submission; after navigation, analytics plus two
  approval-count calls. Counts poll every 15 seconds and analytics every 60
  seconds while visible. This is additional dashboard work, not repeated login.
- New login regression tests measure 1 fetch per email/Google sign-in instead
  of the previous 2. Admin regression tests measure 0 marketplace refresh calls
  on each of four admin route cases instead of the previous 1.

More API calls can add latency, but the evidence does not show an API quota being
exhausted. Removing one serial request saves that request's latency; it is not
evidence of a minutes-to-seconds improvement.

## Database and hosting evidence

DEV Supabase `vvjeqfektsfrfunksslp` was ACTIVE_HEALTHY. Read-only EXPLAIN for
an absent synthetic email used `idx_users_email`, with 0.733 ms execution and
2.908 ms planning. Five historical `pg_stat_statements` groups matching user/email
queries averaged 0.08, 0.08, 1.26, 0.61 and 24.89 ms; their maxima were 11.42,
5.65, 34.19, 13.31 and 79.18 ms. They are historical groups, not a trace of
this user's login, and exclude connection checkout/network time.

A separate connection snapshot showed 1 active query (the diagnostic), 9 idle
client connections and 2 extension-related entries, with no lock wait group.
This does not rule out intermittent pool pressure. Performance advisors listed
existing index advisories, but no schema changes were made or inferred necessary
for login. Supabase server logs and Render startup logs were not available in the
enabled tools. No reliable cold-start duration or API startup profile was measured.

Backblaze free-download-cap alerts were reported during the investigation.
No correlation with login was established. The login JSON endpoints and the
admin login source do not download bucket media. No bucket/settings/cap changes
or repeated bulk-media downloads were performed.

## Validation and remaining release checks

- Full Vitest suite: 23 files, 120 tests passed, including the new login request
  and admin-session isolation cases. Existing redirect/portal tests pass.
- `tsc --noEmit`: passed.
- `npm run lint`: passed with two pre-existing warnings in
  `profile-rfqs-panel.tsx` and `salespro-sidebar.tsx`.
- `npm run build`: passed using the DEV public backend URL. Initial sandboxed
  build could not resolve Google Fonts; rerun with network access succeeded.
- Backend unchanged; backend tests were not run.

**Keep this PR in draft until coordinated validation.** Successful buyer,
manufacturer password sign-in and admin password/TOTP sign-in were not executed;
secure credentials were not available. The existing supplier session only proves
authenticated read behavior. Real repeated/cancelled/back-forward login flows,
cold/warm successful sign-in waterfalls and deployed after-change timings remain
unrun. Use secure test-account entry, never passwords/codes in chat. Capture those
flows and correlate any long request with hosting startup/DB pool logs before
claiming the reported 2–3 minute root cause is resolved.
