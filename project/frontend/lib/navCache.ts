/**
 * navCache.ts  – nav-config ek hadama ekkai fetch wenawa.
 * Layout mount wena hadama ekk ekk fetch karanne nha.
 */

const NAV_CACHE_KEY   = "tabs_cache_navbar";
const NAV_TS_KEY      = "tabs_cache_ts";
const CACHE_TTL_MS    = 5 * 60 * 1000; // 5 minutes

let _inFlight: Promise<any[]> | null = null;

export async function getNavConfig(): Promise<any[]> {
  // 1. In-memory: same page load eke concurrent calls hadapi ekak
  if (_inFlight) return _inFlight;

  // 2. LocalStorage cache (still fresh?)
  try {
    const ts = Number(localStorage.getItem(NAV_TS_KEY) || "0");
    if (Date.now() - ts < CACHE_TTL_MS) {
      const cached = localStorage.getItem(NAV_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch {}

  // 3. Fetch (one request only)
  _inFlight = fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/nav-config`)
    .then(r => r.json())
    .then(data => {
      if (Array.isArray(data)) {
        try {
          localStorage.setItem(NAV_CACHE_KEY, JSON.stringify(data));
          localStorage.setItem(NAV_TS_KEY, String(Date.now()));
        } catch {}
      }
      _inFlight = null;
      return Array.isArray(data) ? data : [];
    })
    .catch(() => { _inFlight = null; return []; });

  return _inFlight;
}

/** Login wena welawa call karanna - cache clear + fresh data set */
export function invalidateNavCache() {
  try {
    localStorage.removeItem(NAV_CACHE_KEY);
    localStorage.removeItem(NAV_TS_KEY);
  } catch {}
  _inFlight = null;
}
