// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { createHttpApi } from "./http-api";

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it("recovers committed pages on connection and retries without advancing a failed cursor", async () => {
  vi.useFakeTimers();
  const sources: EventTarget[] = [];
  class Source extends EventTarget {
    close = vi.fn();
    constructor() { super(); sources.push(this); }
  }
  vi.stubGlobal("EventSource", Source);
  const fetch = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: { messages: [{ id: "m1", messageText: "one", changeRevision: 7 }], cursor: 7, hasMore: false } })))
    .mockRejectedValueOnce(new TypeError("offline"))
    .mockResolvedValue(new Response(JSON.stringify({ data: { messages: [{ id: "m2", messageText: "two" }], cursor: 8, hasMore: false } })));
  vi.stubGlobal("fetch", fetch);
  const callback = vi.fn();
  const stop = createHttpApi("https://api.example.invalid").messages.onMessageStream("c1", callback);
  await vi.advanceTimersByTimeAsync(0);
  expect(callback).toHaveBeenCalledTimes(1);
  sources[0].dispatchEvent(new MessageEvent("message", {data: JSON.stringify({id:"m1", messageText:"stale", changeRevision:6})}));
  expect(callback).toHaveBeenCalledTimes(1);
  expect(String(fetch.mock.calls[0][0])).toContain("after=0");
  sources[0].dispatchEvent(new Event("INIT"));
  await vi.advanceTimersByTimeAsync(0);
  expect(String(fetch.mock.calls[1][0])).toContain("after=7");
  await vi.advanceTimersByTimeAsync(16000);
  expect(String(fetch.mock.calls[2][0])).toContain("after=7");
  expect(callback).toHaveBeenCalledTimes(2);
  stop();
  const count=fetch.mock.calls.length;
  await vi.advanceTimersByTimeAsync(30000);
  expect(fetch).toHaveBeenCalledTimes(count);
});

it("preserves the caller's retry ID in the send request", async () => {
  const fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({data:{id:"sent",messageText:"hello"}})));
  vi.stubGlobal("fetch",fetch);
  await createHttpApi("https://api.example.invalid").messages.sendMessage("c","hello",undefined,{clientMessageId:"retry-1"});
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({clientMessageId:"retry-1"});
});
