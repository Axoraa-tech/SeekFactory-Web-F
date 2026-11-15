# Media delivery review (14 November 2026)

## Observed live route, not assumed infrastructure

The public `https://www.seekfactory.com` page returned HTTP 200. Its rendered uploaded-media URLs point to `seekfactory-api-eqfxbgh3cvhqdvcv.eastasia-01.azurewebsites.net`. Sample media requests return a 302 to `seekfactorymedia.blob.core.windows.net`. The API hostname indicates East Asia; the Blob account's actual region was not inspected. Therefore “everything is US East” is not established.

Sample image: `1249cbb8-ffbb-5fc5-8d0e-5ef50f4ffcc4.png`. Its 160px derivative was 3,425 bytes and 640px derivative 28,747 bytes. Sample video: `0e8d95d1-e177-5023-93c3-e32d1104c977.mp4`, 2,320,424 bytes. Byte-range requests returned HTTP 206 and a correct Content-Range. API redirects advertise private max-age=300; Blob responses advertise public max-age=31536000, immutable. Signed URLs are intentionally not included here.

These samples took approximately 10 seconds including redirect and cloud execution egress. That is not a China measurement or a reliable production percentile; no mainland-China ISP/device measurement was available. The sampled route has an API hop and then direct Blob delivery, not a visible dedicated CDN hostname. Cache/compression/range serving already exist. Do not promise that adding a cache or rate limiter alone fixes China delivery.

## Scoped fix in this change

The feed-list observer previously compared only changed IntersectionObserver entries, and did not clear the active video when all cards left view. It could therefore keep an offscreen video playing and spending bandwidth, or switch away from an unchanged more-visible video.

Now the list remembers visible ratios across callbacks, autoplays only the most-visible video at least 50% in view, pauses autoplay when no eligible video remains or the document is hidden, resumes only an eligible visible video when returning, and cleans up observers/listeners on changes/unmount. Photo-only cards cannot win video selection. An environment without IntersectionObserver retains manual video controls without crashing. Existing offscreen `preload=none` behavior is preserved.

This is bandwidth hygiene, not adaptive streaming and not a claim of measured faster China playback. Native mobile and other web feed layouts are not changed in this PR.

## YouTube-like playback: next architecture, not implemented here

Current playback is progressive MP4 with byte-range seeking. It does not adapt rendition bitrate to network throughput. A reviewable adaptive-streaming implementation needs:

1. A bounded asynchronous media job producing a versioned HLS master manifest and multiple H.264/AAC renditions, with independent segments, aligned keyframes and poster/thumbnail derivatives. Preserve original uploads and a fallback MP4 until validation succeeds. Publish manifests only after all referenced files are ready; do not replace immutable keys in place.
2. A CDN/origin design validated from target Chinese ISPs, including cache hit ratio, DNS/TLS/TTFB, startup delay, rebuffering and error rate. Select region/CDN only after testing. Mainland hosting/acceleration eligibility and regulatory prerequisites require provider-specific review; do not assume an offshore CDN guarantees China speed.
3. Web native HLS where supported plus a compatible MediaSource-based HLS player elsewhere; native mobile player support verified separately. Keep fallback MP4 and manual quality/auto choices, and avoid eagerly downloading every rendition.
4. Cache only published public media by immutable versioned object paths. Keep private chat/RFQ documents outside public caching, preserve authorization and signed-link boundaries, and verify byte ranges/CORS/content types on each platform.
5. Resource limits, trusted upload validation, queue backpressure and per-user upload quotas. Rate limiting protects expensive uploads/APIs against abuse; it should not indiscriminately throttle media segments and make playback worse.
6. Cost estimate and explicit infrastructure approval before provisioning, backfill/transcoding spend, DNS/security changes or deployment. Canary rollout with playback telemetry and rollback to current MP4. No production changes performed in this review.

## Verification

Regression tests cover leaving the viewport, partial observer updates, visibility changes, disabling autoplay, teardown, missing IntersectionObserver and offscreen preload. Local tests do not substitute for real browser playback or China network testing.
