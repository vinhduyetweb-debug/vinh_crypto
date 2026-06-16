export async function getCoinMarket(coinId) {
  const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
  url.searchParams.set("vs_currency", "usd");
  url.searchParams.set("ids", coinId);
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", "1");
  url.searchParams.set("page", "1");
  url.searchParams.set("sparkline", "false");
  url.searchParams.set("price_change_percentage", "24h");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Không lấy được dữ liệu giá từ CoinGecko.");

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("CoinGecko chưa có dữ liệu cho token này.");
  }
  return data[0];
}

export async function getFearGreed() {
  const res = await fetch("https://api.alternative.me/fng/?limit=1");
  if (!res.ok) throw new Error("Không lấy được chỉ số Fear & Greed.");
  const data = await res.json();
  return data?.data?.[0] || null;
}

export async function getFunding(symbol) {
  try {
    if (symbol === "USDT") return null;
    const res = await fetch(`https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}USDT&limit=1`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return Number(data[0].fundingRate);
  } catch {
    return null;
  }
}
