// Meta (Facebook) Pixel client helpers. The base pixel + PageView are injected
// once by <MetaPixel/> in the root layout; these helpers fire standard events
// from client components. Every call safely no-ops when the pixel isn't
// configured (no NEXT_PUBLIC_META_PIXEL_ID) or hasn't loaded yet, so tracking
// never blocks or breaks the user flow.

type FbqParams = Record<string, unknown>;

declare global {
  interface Window {
    fbq?: (
      command: "init" | "track" | "trackCustom",
      eventOrId: string,
      params?: FbqParams,
      options?: { eventID: string },
    ) => void;
  }
}

/** Fire a Meta standard event (e.g. "Lead", "Schedule"). No-ops if unavailable. */
export function trackMetaEvent(event: string, params?: FbqParams, eventId?: string): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  const eventParams = event === "Lead" ? { currency: "GBP" } : params;
  if (eventId) window.fbq("track", event, eventParams, { eventID: eventId });
  else window.fbq("track", event, eventParams);
}

/** A booking link click is intent; Schedule is reserved for confirmed appointments. */
export function trackBookingStarted(): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("trackCustom", "BookingStarted", { content_name: "Endomax Lift online consultation" });
}
