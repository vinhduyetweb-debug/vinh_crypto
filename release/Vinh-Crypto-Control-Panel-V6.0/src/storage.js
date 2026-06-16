import { DEFAULT_WATCHLIST, TREASURY_ASSETS, normalizeSymbol } from "../data/coin-map.js";

const KEYS = Object.freeze({
  watchlist: "vccp.watchlist",
  portfolio: "vccp.portfolio",
  snapshots: "vccp.snapshots",
  journal: "vccp.journal"
});

export function getWatchlist() {
  const saved = readJson(KEYS.watchlist, null);
  if (!Array.isArray(saved)) return [...DEFAULT_WATCHLIST];
  const cleaned = saved.map(normalizeSymbol).filter(Boolean);
  return cleaned.length ? Array.from(new Set(cleaned)) : [...DEFAULT_WATCHLIST];
}

export function saveWatchlist(value) {
  localStorage.setItem(KEYS.watchlist, JSON.stringify(Array.from(new Set(value.map(normalizeSymbol).filter(Boolean)))));
}

export function getPortfolio() {
  const saved = readJson(KEYS.portfolio, {});
  return {
    amounts: saved.amounts || {},
    otherAltUsd: Number(saved.otherAltUsd || 0),
    exchangeExposure: Number(saved.exchangeExposure || 0)
  };
}

export function savePortfolio(value) {
  const amounts = {};
  TREASURY_ASSETS.forEach(asset => {
    amounts[asset] = Number(value.amounts?.[asset] || 0);
  });
  localStorage.setItem(KEYS.portfolio, JSON.stringify({
    amounts,
    otherAltUsd: Number(value.otherAltUsd || 0),
    exchangeExposure: Number(value.exchangeExposure || 0)
  }));
}

export function getSnapshots() {
  const saved = readJson(KEYS.snapshots, []);
  return Array.isArray(saved) ? saved : [];
}

export function saveSnapshots(value) {
  localStorage.setItem(KEYS.snapshots, JSON.stringify(Array.isArray(value) ? value : []));
}

export function getJournal() {
  const saved = readJson(KEYS.journal, []);
  return Array.isArray(saved) ? saved : [];
}

export function saveJournal(value) {
  localStorage.setItem(KEYS.journal, JSON.stringify(Array.isArray(value) ? value : []));
}

export function exportAppData() {
  return {
    app: "Vinh Crypto Control Panel",
    version: "6.0",
    exportedAt: new Date().toISOString(),
    data: {
      watchlist: getWatchlist(),
      portfolio: getPortfolio(),
      snapshots: getSnapshots(),
      journal: getJournal()
    }
  };
}

export function importAppData(payload) {
  if (!payload || payload.app !== "Vinh Crypto Control Panel" || !payload.data) {
    throw new Error("Invalid backup file.");
  }
  if (!Array.isArray(payload.data.watchlist)) throw new Error("Invalid watchlist.");
  saveWatchlist(payload.data.watchlist);
  savePortfolio(payload.data.portfolio || {});
  saveSnapshots(Array.isArray(payload.data.snapshots) ? payload.data.snapshots : []);
  saveJournal(Array.isArray(payload.data.journal) ? payload.data.journal : []);
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
