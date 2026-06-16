const MARKET_PREFIX = "vccp.market.";
const TTL_MS = 180 * 1000;

export function getMarketFromCache(symbol) {
  const cached = getAnyCachedMarket(symbol);
  if (!cached) return null;
  return { ...cached, status: cacheStatus(cached.savedAt) };
}

export function getAnyCachedMarket(symbol) {
  try {
    const raw = localStorage.getItem(MARKET_PREFIX + symbol);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data || !parsed.savedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setMarketCache(symbol, data) {
  localStorage.setItem(MARKET_PREFIX + symbol, JSON.stringify({
    savedAt: Date.now(),
    data
  }));
}

export function cacheStatus(savedAt) {
  const age = Date.now() - Number(savedAt || 0);
  if (age <= TTL_MS) return "CACHE";
  return "STALE";
}
