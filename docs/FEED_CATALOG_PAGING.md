# Home catalog paging

## Scope and behavior

The home LINE/SIDE photo views now share one randomly ordered, page-scoped catalog snapshot. They reveal 24 cards at a time without a 60-card ceiling. Switching layouts or loading another page preserves order; changing the viewer remounts the snapshot to avoid carrying viewer-specific saved state across sessions. Central manufacturer groups use the same uncapped snapshot.

This is **client-side pagination**, not a new server cursor. Existing recommendation/search endpoints cap results, so the adapter enumerates public category partitions using the existing uncapped category endpoint. It covers descendants, orphan roots and cyclic components, deduplicates product IDs, and uses at most four concurrent partition requests. The backend remains responsible for active/listed/verified-supplier eligibility. No private supplier endpoint is requested.

The snapshot is retained only while the page provider is mounted, not persisted globally or in local storage. Category/query filters preserve snapshot order. Partial partition failures never produce a misleading complete catalog: loading/error/retry is visible even with the photo panel hidden, and a 45-second timeout prevents indefinite loading. Refreshing/retrying may generate a new order. Concurrent backend edits are not a transactional snapshot.

## Evidence and cost

A read-only probe of the existing dev preview on 2026-10-24 returned 207 categories, 20 root partitions, 280 approved manufacturers and **634 unique eligible products, including 631 legacy-import products**. All 634 had images. This verifies the dev preview's eligible API inventory, not raw database totals or the client's production host.

Cold enumeration took 19.37 seconds and approximately 1.52 MB of response payload over 22 requests (categories, manufacturers, 20 partitions). A visible loading hint explains this delay. This bounded adapter is suitable for the observed catalog, but a backend paginated public catalog endpoint is preferable as inventory grows.

## Videos

Unfiltered home videos now use the existing page/size API with 50-item pages, stable append ordering, ID deduplication and retry. The API defaults to 50, not 24; the current dev preview returned only six eligible videos, so the reported 24-video count was not reproduced. No arbitrary server limit was removed.

Filtered video search still has the existing backend 50-result limit and no paging API. Existing video offset pagination sorts by creation time without an ID tie-break/snapshot cursor; concurrent inserts/deletes or tied timestamps can shift pages. This change does not guarantee complete video traversal under concurrent edits.

## Validation

Automated tests cover 634 products through every 24-card page, LINE/SIDE order stability, filter resets, hidden-photo errors/retry, viewer remount, timeout, partition coverage, duplicate IDs, repeated video clicks, retry offsets and stale source responses. TypeScript, lint and production build also run locally.

Visual browser validation remains outstanding: the cloud execution sandbox could not launch Chromium, and the separate browser could not reach its localhost server. DOM integration tests are not a substitute for visual QA. Before merging, check LINE/SIDE scrolling, controls and loading/error states in the deployed preview. No mobile changes, database writes, explicit deployment or merge are included.
