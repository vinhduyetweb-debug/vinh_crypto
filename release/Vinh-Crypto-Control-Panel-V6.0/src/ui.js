export const els = {
  tokenInput: document.getElementById("tokenInput"),
  btnSignal: document.getElementById("btnSignal"),
  btnRefresh: document.getElementById("btnRefresh"),
  btnAddWatch: document.getElementById("btnAddWatch"),
  btnResetWatch: document.getElementById("btnResetWatch"),
  watchSymbol: document.getElementById("watchSymbol"),
  watchlistBody: document.getElementById("watchlistBody"),
  loading: document.getElementById("loading"),
  messageBox: document.getElementById("messageBox"),
  tabs: document.querySelectorAll(".tab"),
  detailSymbol: document.getElementById("detailSymbol"),
  coinName: document.getElementById("coinName"),
  price: document.getElementById("price"),
  marketCap: document.getElementById("marketCap"),
  rank: document.getElementById("rank"),
  ath: document.getElementById("ath"),
  athDate: document.getElementById("athDate"),
  athChange: document.getElementById("athChange"),
  atl: document.getElementById("atl"),
  marketStatus: document.getElementById("marketStatus"),
  fear: document.getElementById("fear"),
  fearNote: document.getElementById("fearNote"),
  funding: document.getElementById("funding"),
  fundingNote: document.getElementById("fundingNote"),
  accumScore: document.getElementById("accumScore"),
  riskReduceScore: document.getElementById("riskReduceScore"),
  phase: document.getElementById("phase"),
  action: document.getElementById("action"),
  accumReasons: document.getElementById("accumReasons"),
  reduceReasons: document.getElementById("reduceReasons"),
  portfolioForm: document.getElementById("portfolioForm"),
  exchangeExposure: document.getElementById("exchangeExposure"),
  btnSavePortfolio: document.getElementById("btnSavePortfolio"),
  btnResetPortfolio: document.getElementById("btnResetPortfolio"),
  totalUsd: document.getElementById("totalUsd"),
  totalBtc: document.getElementById("totalBtc"),
  riskScore: document.getElementById("riskScore"),
  treasurySuggestion: document.getElementById("treasurySuggestion"),
  allocationList: document.getElementById("allocationList"),
  dcaAmount: document.getElementById("dcaAmount"),
  dcaOrders: document.getElementById("dcaOrders"),
  dcaCycle: document.getElementById("dcaCycle"),
  btnCalcDca: document.getElementById("btnCalcDca"),
  dcaResult: document.getElementById("dcaResult"),
  btnSaveSnapshot: document.getElementById("btnSaveSnapshot"),
  btnExport: document.getElementById("btnExport"),
  importFile: document.getElementById("importFile"),
  snapshotList: document.getElementById("snapshotList"),
  journalForm: document.getElementById("journalForm"),
  journalDate: document.getElementById("journalDate"),
  journalAction: document.getElementById("journalAction"),
  journalToken: document.getElementById("journalToken"),
  journalAmount: document.getElementById("journalAmount"),
  journalNote: document.getElementById("journalNote"),
  journalList: document.getElementById("journalList"),
  networkStatus: document.getElementById("networkStatus"),
  lastSuccess: document.getElementById("lastSuccess")
};

export function switchTab(name) {
  document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
  document.getElementById(`${name}Tab`).classList.add("active");
  els.tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.tab === name));
}

export function setMessage(message) {
  els.messageBox.textContent = message;
  els.messageBox.classList.toggle("hidden", !message);
}

export function setNetworkStatus(isOnline) {
  els.networkStatus.textContent = isOnline ? "Online" : "Offline";
  els.networkStatus.className = `pill ${isOnline ? "online" : "offline"}`;
  const last = localStorage.getItem("vccp.lastSuccess");
  els.lastSuccess.textContent = last ? "Cập nhật: " + formatDateTime(last) : "Chưa cập nhật";
}

export function renderWatchlist(rows, selectedSymbol) {
  els.watchlistBody.innerHTML = rows.map(row => {
    const market = row.market;
    const status = row.status || "STALE";
    const change = market?.price_change_percentage_24h;
    return `
      <tr>
        <td><strong>${row.symbol}</strong>${row.symbol === selectedSymbol ? " •" : ""}</td>
        <td>${formatUsd(market?.current_price)}</td>
        <td class="${Number(change) >= 0 ? "buy" : "reduce"}">${formatPercent(change)}</td>
        <td>${formatPercent(market?.ath_change_percentage)}</td>
        <td>${market?.market_cap_rank ? "#" + market.market_cap_rank : "--"}</td>
        <td><span class="pill ${status.toLowerCase()}">${status}</span></td>
        <td>
          <button data-action="detail" data-symbol="${row.symbol}" type="button">Xem chi tiết</button>
          <button class="ghost" data-action="remove" data-symbol="${row.symbol}" type="button">Xóa</button>
        </td>
      </tr>
    `;
  }).join("");
}

export function renderReasons(list, reasons) {
  list.innerHTML = "";
  const items = reasons.length ? reasons : ["Chưa có tín hiệu mạnh."];
  items.forEach(reason => {
    const li = document.createElement("li");
    li.textContent = reason;
    list.appendChild(li);
  });
}

export function renderAllocations(rows) {
  els.allocationList.innerHTML = rows.length ? rows.map(row => `
    <div class="allocation-item">
      <strong>${row.asset}: ${formatUsd(row.valueUsd)} (${formatPercent(row.percent)})</strong>
      <div class="bar"><span style="width:${Math.min(100, row.percent)}%"></span></div>
    </div>
  `).join("") : "<p class=\"muted\">Chưa có dữ liệu danh mục.</p>";
}

export function renderSnapshots(items) {
  els.snapshotList.innerHTML = items.length ? items.map(item => `
    <div class="history-item">
      <strong>${formatDateTime(item.createdAt)}</strong>
      <span>Tổng USD: ${formatUsd(item.portfolio?.totalUsd)} • Tổng BTC: ${item.portfolio?.totalBtc ? item.portfolio.totalBtc.toFixed(8) : "--"}</span>
      <span>BTC: ${formatPercent(item.portfolio?.btcPercent)} • Risk Score: ${item.portfolio?.riskScore ?? "--"}</span>
    </div>
  `).join("") : "<p class=\"muted\">Chưa có snapshot.</p>";
}

export function renderJournal(items) {
  els.journalList.innerHTML = items.length ? items.map(item => `
    <div class="history-item">
      <strong>${item.date} • ${item.action}${item.token ? " • " + item.token : ""}</strong>
      <span>${item.amount ? formatUsd(item.amount) : ""}</span>
      <span>${escapeHtml(item.note || "Không có ghi chú.")}</span>
    </div>
  `).join("") : "<p class=\"muted\">Chưa có journal.</p>";
}

export function setPill(element, status) {
  element.className = `pill ${String(status).toLowerCase()}`;
}

export function formatUsd(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "--";
  return "$" + Number(value).toLocaleString("vi-VN", {
    maximumFractionDigits: Math.abs(Number(value)) < 1 ? 8 : 2
  });
}

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "--";
  return Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + "%";
}

export function formatDateTime(value) {
  if (!value) return "--";
  return new Date(value).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);
}
