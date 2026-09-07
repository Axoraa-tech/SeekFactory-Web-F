import { describe, expect, it } from "vitest";
import { getMessages, t } from "@/shared/lib/messages";

describe("messages helper", () => {
  it("loads English catalog", () => {
    const messages = getMessages("en");
    expect(messages.brand.name).toBe("SEEKFACTORY");
    expect(t(messages, "nav.home")).toBe("Home");
  });

  it("loads Chinese catalog", () => {
    const messages = getMessages("zh");
    expect(messages.nav.explore).toBe("发现");
  });
});
