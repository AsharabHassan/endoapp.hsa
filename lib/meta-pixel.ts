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
    ) => void;
  }
}

/** Fire a Meta standard event (e.g. "Lead", "Schedule"). No-ops if unavailable. */
export function trackMetaEvent(event: string, params?: FbqParams): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
}
