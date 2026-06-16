# PRD - Vinh Crypto Control Panel V6.0

## Goal

Create a static, local-first crypto control panel for personal market tracking, BTC accumulation planning, risk awareness, and decision logging.

## Non Goals

- No auto trading.
- No buy/sell execution.
- No futures or leverage workflow.
- No wallet connection.
- No private exchange API.
- No backend, login, or cloud database.

## Users

Personal long-term crypto holder who prioritizes BTC, survival, simple risk visibility, and local backup.

## Core Flows

1. Open dashboard and inspect watchlist.
2. Select a token and view price, ATH drawdown, Fear & Greed, funding, and safe signal language.
3. Maintain personal watchlist in localStorage.
4. Enter portfolio amounts in BTC Treasury.
5. Review allocation, risk score, and DCA estimate.
6. Save snapshots and journal entries.
7. Export/import JSON backup.
8. Open app shell offline and see stale cached data clearly marked.

## Data Sources

- CoinGecko public market API.
- Alternative.me Fear & Greed API.
- Binance public funding rate API.

## Data Storage

All personal data remains in browser localStorage.
