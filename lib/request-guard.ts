import { isIP } from "node:net";

// ─────────────────────────────────────────────────────────────────────────────
// Guards for the endpoints that make the clinic's CRM (or GoHighLevel) act:
// /api/lead creates a contact, /api/report emails the patient a PDF. Without
// them anyone could drive these cross-site and use the clinic's own account as
// a mail relay to any address.
// ─────────────────────────────────────────────────────────────────────────────

/** The two live city sites, their Vercel hosts, and nothing else. */
export const ALLOWED_APP_ORIGINS: readonly string[] = [
  "https://endoapp.harleystreetaesthetic.clinic",
  "https://endoapp.glasgow.harleystreetaesthetic.clinic",
  "https://endoapp-hsa.vercel.app",
  "https://endoapp-hsa-dyyl.vercel.app",
];

/** http://localhost or http://127.0.0.1 on any port, for `next dev`. */
function isLocalDevOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return (
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      url.origin === origin
    );
  } catch {
    return false;
  }
}

export function isAllowedAppOrigin(origin: string | null | undefined): boolean {
  const value = origin?.trim().toLowerCase();
  if (!value) return false;
  return ALLOWED_APP_ORIGINS.includes(value) || isLocalDevOrigin(value);
}

/**
 * True only for a browser POST made by this app's own pages. The app always
 * sends an Origin header for its JSON POSTs, so a request without one is
 * rejected, as is any cross-site Sec-Fetch-Site.
 */
export function isAllowedAppRequest(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (fetchSite && fetchSite !== "same-origin") return false;
  return isAllowedAppOrigin(request.headers.get("origin"));
}

/** First x-forwarded-for hop is the client address on Vercel. */
export function clientIp(request: Request): string | null {
  const candidate =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "";
  return isIP(candidate) ? candidate : null;
}

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();
const MAX_TRACKED_KEYS = 10_000;

/**
 * Fixed-window limit per client address and endpoint. Best effort: it lives
 * in one server instance's memory, which is enough to stop one caller looping
 * on an endpoint. Requests with no identifiable address are not limited.
 */
export function rateLimited(
  request: Request,
  bucket: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): boolean {
  const ip = clientIp(request);
  if (!ip) return false;

  if (windows.size >= MAX_TRACKED_KEYS) {
    for (const [key, entry] of windows) {
      if (entry.resetAt <= now) windows.delete(key);
    }
    if (windows.size >= MAX_TRACKED_KEYS) windows.clear();
  }

  const key = `${bucket}:${ip}`;
  const entry = windows.get(key);
  if (!entry || entry.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

/** For tests. */
export function resetRateLimits(): void {
  windows.clear();
}
