import { afterEach, expect, it, vi } from "vitest";
import { trackMetaEvent } from "@/lib/meta-pixel";

afterEach(() => vi.unstubAllGlobals());

it("tracks GBP with the shared browser/server ID and excludes assessment parameters", () => {
  const fbq = vi.fn();
  vi.stubGlobal("window", { fbq });
  trackMetaEvent("Lead", { content_category: "alternative", score: 20 }, "shared-id");
  expect(fbq).toHaveBeenCalledWith("track", "Lead", { currency: "GBP" }, { eventID: "shared-id" });
});

it("keeps tracking optional when the pixel is unavailable", () => {
  vi.stubGlobal("window", {});
  expect(() => trackMetaEvent("Lead", undefined, "shared-id")).not.toThrow();
});
