import { afterEach, describe, expect, it, vi } from "vitest";
import { submitLead } from "@/lib/api-client";
import type { LeadRequest } from "@/lib/types";

describe("lead delivery acknowledgement", () => {
  afterEach(() => vi.unstubAllGlobals());
  const request = {} as LeadRequest;
  it.each([true, false])("returns the CRM acknowledgement (%s)", async (delivered) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ok:true,json:async()=>({ok:true,delivered})}));
    expect(await submitLead(request)).toBe(delivered);
  });
  it("does not acknowledge failed requests", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ok:false}));
    expect(await submitLead(request)).toBe(false);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await submitLead(request)).toBe(false);
  });
});
