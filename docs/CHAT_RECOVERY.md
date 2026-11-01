# Reliable chat recovery

This web change requires the companion backend concurrency change and V25 database migration.
Deploy the backend through the normal reviewed process before deploying this web change. Neither
application has been deployed by this task.

The backend uses PostgreSQL transactional pub/sub for cross-instance fan-out. SSE wakes up the UI,
while a revision-based database sync recovers sends/edits/deletes after reconnects or missed hints.
The client retries failed cursors, consumes all 100-message pages, and reconciles on connection,
visibility changes and every 15 seconds while visible. Revision checks discard delayed older events.
History loading merges with messages already delivered by the stream.

Send calls carry a client-generated retry ID. The interactive chat keeps the same ID after an uncertain
failure when the user retries the same payload, and starts a new ID after a successful send. Read
acknowledgments are explicit and debounced rather than inferred from stream registration.

Validation: `npm test` and `npx tsc --noEmit`. Added tests cover recovery cursor retries, stale-event
rejection, cleanup and retry-ID preservation. See the backend draft PR and its committed local-load
results for isolated synthetic HTTP tests. These tests are not production/browser/CDN capacity
certification; initial full-history pagination and cross-instance online-presence still need follow-up.
