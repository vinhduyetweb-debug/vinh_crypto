import { TREASURY_ASSETS } from "../data/coin-map.js";

export function calculateSignal(fear, fundingRate, athChangePercentage) {
  let accumulationScore = 0;
  let riskReductionScore = 0;
  const accumulationReasons = [];
  const riskReductionReasons = [];

  if (Number.isFinite(fear)) {
    if (fear <= 25) {
      accumulationScore += 40;
      accumulationReasons.push("Fear & Greed thấp: thị trường đang thận trọng.");
    } else if (fear >= 75) {
      riskReductionScore += 40;
      riskReductionReasons.push("Fear & Greed cao: thị trường đang hưng phấn.");
    }
    if (fear <= 20) {
      accumulationScore += 20;
      accumulationReasons.push("Tâm lý yếu, chỉ cân nhắc DCA nhỏ theo kế hoạch.");
    }
    if (fear >= 85) {
      riskReductionScore += 20;
      riskReductionReasons.push("Tâm lý quá nóng, ưu tiên quản trị rủi ro.");
    }
  } else {
    accumulationReasons.push("Không có dữ liệu Fear & Greed.");
    riskReductionReasons.push("Không có dữ liệu Fear & Greed.");
  }

  if (fundingRate === null || fundingRate === undefined || Number.isNaN(fundingRate)) {
    accumulationReasons.push("Không hỗ trợ / Không có dữ liệu Funding Rate.");
    riskReductionReasons.push("Không hỗ trợ / Không có dữ liệu Funding Rate.");
  } else {
    if (fundingRate <= 0) {
      accumulationScore += 30;
      accumulationReasons.push("Funding thấp hoặc âm: áp lực long chưa quá nóng.");
    }
    if (fundingRate >= 0.0005) {
      riskReductionScore += 30;
      riskReductionReasons.push("Funding nóng: nhiều vị thế long dùng đòn bẩy.");
    }
  }

  if (Number.isFinite(athChangePercentage) && athChangePercentage > -10) {
    riskReductionScore += 15;
    riskReductionReasons.push("Giá đang gần ATH, cần kiểm soát mức rủi ro.");
  }

  let phase = "Trung lập / Theo dõi";
  let action = "Ổn: tiếp tục theo dõi";

  if (!Number.isFinite(fear) && !Number.isFinite(athChangePercentage)) {
    phase = "Dữ liệu chưa đủ";
    action = "Dữ liệu chưa đủ, không hành động";
  } else if (accumulationScore >= 60 && accumulationScore > riskReductionScore) {
    phase = "Thận trọng / Vùng tích lũy";
    action = "Có thể DCA nhỏ theo kế hoạch";
  } else if (riskReductionScore >= 60 && riskReductionScore >= accumulationScore) {
    phase = "Hưng phấn / Rủi ro cao hơn";
    action = "Cân nhắc giảm rủi ro";
  }

  return { accumulationScore, riskReductionScore, phase, action, accumulationReasons, riskReductionReasons };
}

export function calculateTreasury(portfolio, marketMap) {
  const rows = [];
  let totalUsd = Number(portfolio.otherAltUsd || 0);
  let totalBtc = 0;
  const btcPrice = marketMap.get("BTC")?.current_price;

  TREASURY_ASSETS.forEach(asset => {
    const amount = Number(portfolio.amounts?.[asset] || 0);
    const price = asset === "USDT" ? 1 : Number(marketMap.get(asset)?.current_price || 0);
    const valueUsd = amount * price;
    totalUsd += valueUsd;
    rows.push({ asset, amount, price, valueUsd });
  });

  if (Number.isFinite(btcPrice) && btcPrice > 0) {
    totalBtc = totalUsd / btcPrice;
  }

  if (portfolio.otherAltUsd) {
    rows.push({ asset: "OTHER_ALT", amount: 1, price: Number(portfolio.otherAltUsd), valueUsd: Number(portfolio.otherAltUsd) });
  }

  const allocations = rows.map(row => ({
    ...row,
    percent: totalUsd > 0 ? (row.valueUsd / totalUsd) * 100 : 0
  }));

  const btcPercent = findPercent(allocations, "BTC");
  const usdtPercent = findPercent(allocations, "USDT");
  const altPercent = Math.max(0, 100 - btcPercent - usdtPercent);
  const largestAlt = allocations
    .filter(row => !["BTC", "USDT"].includes(row.asset))
    .reduce((max, row) => Math.max(max, row.percent), 0);
  const exchangePercent = totalUsd > 0 ? (Number(portfolio.exchangeExposure || 0) / totalUsd) * 100 : 0;

  let riskScore = 50;
  if (btcPercent >= 70) riskScore -= 18;
  if (btcPercent < 50 && totalUsd > 0) riskScore += 12;
  if (usdtPercent >= 3 && usdtPercent <= 10) riskScore -= 8;
  if (usdtPercent < 3 && totalUsd > 0) riskScore += 5;
  if (altPercent > 30) riskScore += Math.min(25, (altPercent - 30) * 0.8);
  if (largestAlt > 20) riskScore += 12;
  if (exchangePercent > 25) riskScore += 15;
  riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));

  let suggestion = "Ổn: tiếp tục theo dõi";
  if (totalUsd <= 0 || !Number.isFinite(totalUsd)) {
    suggestion = "Dữ liệu chưa đủ, không hành động";
  } else if (altPercent > 35 || largestAlt > 20) {
    suggestion = "Alt đang cao, cân nhắc giảm rủi ro";
  } else if (usdtPercent < 3) {
    suggestion = "Ưu tiên giữ USDT";
  } else if (btcPercent < 70 && usdtPercent >= 3) {
    suggestion = "Có thể DCA BTC nhỏ";
  }

  return { totalUsd, totalBtc, allocations, riskScore, suggestion, btcPercent, altPercent, usdtPercent };
}

export function calculateDca({ amount, orders, cycle, btcPrice }) {
  if (!Number.isFinite(btcPrice) || btcPrice <= 0) return "BTC price lỗi hoặc chưa có dữ liệu. Không tính DCA.";
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(orders) || orders <= 0) {
    return "Nhập số USDT và số lệnh hợp lệ. Không mua đuổi, không all-in.";
  }
  const perOrder = amount / orders;
  const btcPerOrder = perOrder / btcPrice;
  return `Chia ${orders} lệnh theo chu kỳ ${cycle}. Mỗi lệnh khoảng ${perOrder.toFixed(2)} USDT, ước tính nhận ${btcPerOrder.toFixed(8)} BTC/lệnh. Không mua đuổi, không all-in.`;
}

function findPercent(rows, asset) {
  return rows.find(row => row.asset === asset)?.percent || 0;
}
