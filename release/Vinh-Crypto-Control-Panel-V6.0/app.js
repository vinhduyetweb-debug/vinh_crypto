import { COIN_MAP, DEFAULT_WATCHLIST, TREASURY_ASSETS, normalizeSymbol } from "./data/coin-map.js";
import { getCoinMarket, getFearGreed, getFunding } from "./src/api.js";
import { getMarketFromCache, setMarketCache, getAnyCachedMarket, cacheStatus } from "./src/cache.js";
import {
  exportAppData,
  getJournal,
  getPortfolio,
  getSnapshots,
  getWatchlist,
  importAppData,
  saveJournal,
  savePortfolio,
  saveSnapshots,
  saveWatchlist
} from "./src/storage.js";
import { calculateSignal, calculateTreasury, calculateDca } from "./src/signal.js";
import {
  els,
  formatDateTime,
  formatPercent,
  formatUsd,
  renderAllocations,
  renderJournal,
  renderReasons,
  renderSnapshots,
  renderWatchlist,
  setMessage,
  setNetworkStatus,
  setPill,
  switchTab
} from "./src/ui.js";

let selectedSymbol = "BTC";
let currentMarket = new Map();
let currentFear = null;
let currentTreasury = null;

init();

function init() {
  buildPortfolioForm();
  bindEvents();
  loadSavedForms();
  renderJournal(getJournal());
  renderSnapshots(getSnapshots());
  updateNetwork();
  refreshAll({ force: false });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
}

function bindEvents() {
  els.btnSignal.addEventListener("click", () => loadDetail(normalizeSymbol(els.tokenInput.value), { force: true }));
  els.tokenInput.addEventListener("keydown", event => {
    if (event.key === "Enter") loadDetail(normalizeSymbol(els.tokenInput.value), { force: true });
  });
  els.btnRefresh.addEventListener("click", () => refreshAll({ force: true }));
  els.btnAddWatch.addEventListener("click", addWatchSymbol);
  els.btnResetWatch.addEventListener("click", () => {
    saveWatchlist(DEFAULT_WATCHLIST);
    refreshAll({ force: true });
  });
  els.watchlistBody.addEventListener("click", handleWatchlistClick);
  els.tabs.forEach(tab => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));
  els.btnSavePortfolio.addEventListener("click", savePortfolioFromForm);
  els.btnResetPortfolio.addEventListener("click", resetPortfolio);
  els.btnCalcDca.addEventListener("click", renderDca);
  els.btnSaveSnapshot.addEventListener("click", saveSnapshot);
  els.btnExport.addEventListener("click", exportJson);
  els.importFile.addEventListener("change", importJson);
  els.journalForm.addEventListener("submit", saveJournalEntry);
  window.addEventListener("online", updateNetwork);
  window.addEventListener("offline", updateNetwork);
}

function updateNetwork() {
  setNetworkStatus(navigator.onLine);
}

function buildPortfolioForm() {
  els.portfolioForm.innerHTML = TREASURY_ASSETS.map(asset => `
    <label>${asset} amount
      <input id="asset_${asset}" data-asset="${asset}" type="number" min="0" step="0.00000001" placeholder="0">
    </label>
  `).join("") + `
    <label>Other alt value USD
      <input id="asset_OTHER_USD" data-asset="OTHER_USD" type="number" min="0" step="0.01" placeholder="0">
    </label>
  `;
}

function loadSavedForms() {
  const portfolio = getPortfolio();
  TREASURY_ASSETS.forEach(asset => {
    const input = document.getElementById(`asset_${asset}`);
    if (input) input.value = portfolio.amounts?.[asset] || "";
  });
  document.getElementById("asset_OTHER_USD").value = portfolio.otherAltUsd || "";
  els.exchangeExposure.value = portfolio.exchangeExposure || "";
  els.journalDate.value = new Date().toISOString().slice(0, 10);
}

async function refreshAll({ force }) {
  els.loading.classList.remove("hidden");
  setMessage("");
  try {
    const watchlist = getWatchlist();
    const rows = await Promise.all(watchlist.map(symbol => loadMarket(symbol, { force })));
    rows.forEach(row => {
      if (row.market) currentMarket.set(row.symbol, row.market);
    });
    renderWatchlist(rows, selectedSymbol);
    await loadDetail(selectedSymbol, { force: false });
    renderTreasury();
  } finally {
    els.loading.classList.add("hidden");
  }
}

async function loadMarket(symbol, { force = false } = {}) {
  const clean = normalizeSymbol(symbol);
  const cached = getMarketFromCache(clean);

  if (!force && cached && cached.status !== "STALE") {
    return { symbol: clean, market: cached.data, status: cached.status, error: "" };
  }

  if (!navigator.onLine) {
    const fallback = cached || getAnyCachedMarket(clean);
    return {
      symbol: clean,
      market: fallback?.data || null,
      status: "STALE",
      error: fallback ? "" : "Offline và chưa có cache"
    };
  }

  try {
    const coinId = COIN_MAP[clean];
    if (!coinId) throw new Error("Token chưa có trong coin map.");
    const market = await getCoinMarket(coinId);
    setMarketCache(clean, market);
    localStorage.setItem("vccp.lastSuccess", new Date().toISOString());
    els.lastSuccess.textContent = "Cập nhật: " + formatDateTime(new Date());
    return { symbol: clean, market, status: "LIVE", error: "" };
  } catch (error) {
    const fallback = cached || getAnyCachedMarket(clean);
    return {
      symbol: clean,
      market: fallback?.data || null,
      status: fallback ? cacheStatus(fallback.savedAt) : "STALE",
      error: error.message
    };
  }
}

async function loadDetail(symbol, { force = false } = {}) {
  const clean = normalizeSymbol(symbol);
  if (!clean) {
    setMessage("Vui lòng nhập token. Ví dụ: BTC, ETH, SOL.");
    return;
  }
  if (!COIN_MAP[clean]) {
    setMessage("Token chưa được hỗ trợ trong bản V6.0. Hãy thử BTC, ETH, SOL, ATOM, OKB, SHIB, PEPE.");
    return;
  }

  selectedSymbol = clean;
  els.tokenInput.value = clean;

  const [marketResult, fearResult, fundingResult] = await Promise.allSettled([
    loadMarket(clean, { force }),
    navigator.onLine ? getFearGreed() : Promise.resolve(null),
    navigator.onLine ? getFunding(clean) : Promise.resolve(null)
  ]);

  const marketRow = marketResult.status === "fulfilled" ? marketResult.value : { market: null, status: "STALE", error: "Không lấy được dữ liệu giá." };
  const market = marketRow.market;
  if (market) currentMarket.set(clean, market);

  currentFear = fearResult.status === "fulfilled" ? fearResult.value : null;
  const fundingRate = fundingResult.status === "fulfilled" ? fundingResult.value : null;
  const fearValue = currentFear ? Number(currentFear.value) : null;
  const signal = calculateSignal(fearValue, fundingRate, market?.ath_change_percentage);

  renderDetail(clean, market, marketRow.status, currentFear, fundingRate, signal);
  renderTreasury();
}

function renderDetail(symbol, market, status, fearData, fundingRate, signal) {
  els.detailSymbol.textContent = market?.symbol?.toUpperCase() || symbol;
  els.coinName.textContent = market?.name || "Không có dữ liệu CoinGecko";
  els.price.textContent = formatUsd(market?.current_price);
  els.marketCap.textContent = formatUsd(market?.market_cap);
  els.rank.textContent = market?.market_cap_rank ? `#${market.market_cap_rank}` : "--";
  els.ath.textContent = formatUsd(market?.ath);
  els.athDate.textContent = market?.ath_date ? "Thời gian ATH: " + formatDateTime(market.ath_date) : "Thời gian ATH: --";
  els.athChange.textContent = formatPercent(market?.ath_change_percentage);
  els.atl.textContent = formatUsd(market?.atl);
  els.marketStatus.textContent = status;
  setPill(els.marketStatus, status);

  els.fear.textContent = fearData ? `${fearData.value}/100 (${fearData.value_classification})` : "Không có dữ liệu";
  els.fearNote.textContent = fearData ? "Đo tâm lý chung của thị trường crypto." : "Fear & Greed fail hoặc đang offline.";

  if (fundingRate === null || fundingRate === undefined) {
    els.funding.textContent = "Không hỗ trợ / Không có dữ liệu";
    els.fundingNote.textContent = "Token này có thể chưa được Binance Futures hỗ trợ hoặc API đang lỗi.";
  } else {
    els.funding.textContent = (fundingRate * 100).toFixed(4) + "%";
    els.fundingNote.textContent = "Funding Rate từ Binance Futures.";
  }

  els.accumScore.textContent = signal.accumulationScore;
  els.riskReduceScore.textContent = signal.riskReductionScore;
  els.phase.textContent = signal.phase;
  els.action.textContent = signal.action;
  renderReasons(els.accumReasons, signal.accumulationReasons);
  renderReasons(els.reduceReasons, signal.riskReductionReasons);
}

function addWatchSymbol() {
  const symbol = normalizeSymbol(els.watchSymbol.value);
  if (!symbol || !COIN_MAP[symbol]) {
    setMessage("Token chưa được hỗ trợ hoặc nhập chưa đúng. Có thể thêm nhanh: BTC, ETH, SOL, ATOM, OKB, SHIB, PEPE, USDT.");
    return;
  }
  const next = Array.from(new Set([...getWatchlist(), symbol]));
  saveWatchlist(next);
  els.watchSymbol.value = "";
  refreshAll({ force: false });
}

function handleWatchlistClick(event) {
  const action = event.target.dataset.action;
  const symbol = event.target.dataset.symbol;
  if (!action || !symbol) return;

  if (action === "detail") {
    loadDetail(symbol, { force: false });
  }
  if (action === "remove") {
    saveWatchlist(getWatchlist().filter(item => item !== symbol));
    refreshAll({ force: false });
  }
}

function savePortfolioFromForm() {
  const amounts = {};
  TREASURY_ASSETS.forEach(asset => {
    amounts[asset] = Number(document.getElementById(`asset_${asset}`).value || 0);
  });
  savePortfolio({
    amounts,
    otherAltUsd: Number(document.getElementById("asset_OTHER_USD").value || 0),
    exchangeExposure: Number(els.exchangeExposure.value || 0)
  });
  renderTreasury();
}

function resetPortfolio() {
  savePortfolio({ amounts: {}, otherAltUsd: 0, exchangeExposure: 0 });
  loadSavedForms();
  renderTreasury();
}

function renderTreasury() {
  currentTreasury = calculateTreasury(getPortfolio(), currentMarket);
  els.totalUsd.textContent = formatUsd(currentTreasury.totalUsd);
  els.totalBtc.textContent = currentTreasury.totalBtc ? currentTreasury.totalBtc.toFixed(8) + " BTC" : "--";
  els.riskScore.textContent = currentTreasury.riskScore;
  els.treasurySuggestion.textContent = currentTreasury.suggestion;
  renderAllocations(currentTreasury.allocations);
}

function renderDca() {
  const btcMarket = currentMarket.get("BTC") || getAnyCachedMarket("BTC")?.data;
  const result = calculateDca({
    amount: Number(els.dcaAmount.value || 0),
    orders: Number(els.dcaOrders.value || 0),
    cycle: els.dcaCycle.value,
    btcPrice: btcMarket?.current_price
  });
  els.dcaResult.textContent = result;
}

function saveSnapshot() {
  renderTreasury();
  const snapshot = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    watchlist: getWatchlist().map(symbol => {
      const market = currentMarket.get(symbol) || getAnyCachedMarket(symbol)?.data;
      return { symbol, price: market?.current_price || null, change24h: market?.price_change_percentage_24h || null };
    }),
    portfolio: currentTreasury,
    fearGreed: currentFear ? { value: currentFear.value, classification: currentFear.value_classification } : null,
    dcaSuggestion: els.dcaResult.textContent
  };
  const next = [snapshot, ...getSnapshots()].slice(0, 50);
  saveSnapshots(next);
  renderSnapshots(next);
}

function exportJson() {
  const blob = new Blob([JSON.stringify(exportAppData(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vinh-crypto-control-panel-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

async function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!confirm("Import JSON sẽ ghi đè dữ liệu hiện tại của app. Tiếp tục?")) return;
    importAppData(parsed);
    loadSavedForms();
    renderJournal(getJournal());
    renderSnapshots(getSnapshots());
    refreshAll({ force: false });
  } catch (error) {
    setMessage("File import không hợp lệ. Dữ liệu cũ vẫn được giữ nguyên.");
  } finally {
    event.target.value = "";
  }
}

function saveJournalEntry(event) {
  event.preventDefault();
  const entry = {
    id: crypto.randomUUID(),
    date: els.journalDate.value || new Date().toISOString().slice(0, 10),
    action: els.journalAction.value,
    token: normalizeSymbol(els.journalToken.value),
    amount: Number(els.journalAmount.value || 0),
    note: els.journalNote.value.trim(),
    createdAt: new Date().toISOString()
  };
  const next = [entry, ...getJournal()].slice(0, 100);
  saveJournal(next);
  els.journalNote.value = "";
  els.journalAmount.value = "";
  renderJournal(next);
}
