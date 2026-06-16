export const COIN_MAP = Object.freeze({
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  DOGE: "dogecoin",
  ADA: "cardano",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  TON: "the-open-network",
  TRX: "tron",
  DOT: "polkadot",
  MATIC: "matic-network",
  POL: "polygon-ecosystem-token",
  SHIB: "shiba-inu",
  LTC: "litecoin",
  BCH: "bitcoin-cash",
  UNI: "uniswap",
  APT: "aptos",
  NEAR: "near",
  ATOM: "cosmos",
  FIL: "filecoin",
  INJ: "injective-protocol",
  OP: "optimism",
  ARB: "arbitrum",
  SUI: "sui",
  PEPE: "pepe",
  WIF: "dogwifcoin",
  ETC: "ethereum-classic",
  XLM: "stellar",
  HBAR: "hedera-hashgraph",
  ICP: "internet-computer",
  VET: "vechain",
  FET: "fetch-ai",
  RENDER: "render-token",
  AAVE: "aave",
  MKR: "maker",
  LDO: "lido-dao",
  TIA: "celestia",
  SEI: "sei-network",
  GRT: "the-graph",
  ALGO: "algorand",
  EGLD: "elrond-erd-2",
  RUNE: "thorchain",
  JUP: "jupiter-exchange-solana",
  WLD: "worldcoin-wld",
  OKB: "okb",
  USDT: "tether"
});

export const DEFAULT_WATCHLIST = Object.freeze(["BTC", "OKB", "ATOM", "ETH", "SOL", "USDT"]);

export const TREASURY_ASSETS = Object.freeze(["BTC", "OKB", "ATOM", "ETH", "SOL", "USDT"]);

export function normalizeSymbol(input) {
  const cleaned = String(input || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned === "USDT") return "USDT";
  return cleaned.endsWith("USDT") ? cleaned.slice(0, -4) : cleaned;
}
