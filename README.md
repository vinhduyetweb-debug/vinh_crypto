# Vinh Crypto Control Panel V6.0

Static personal crypto dashboard for market tracking, BTC treasury planning, snapshots, and decision journal.

This app is a reference tool only. It is not investment advice, not a trading bot, does not place orders, does not connect wallets, and does not require personal API keys.

## Main Features

- Public market data from CoinGecko.
- Fear & Greed from Alternative.me.
- Binance Futures funding rate when public data exists.
- Resilient API loading with independent fallbacks.
- Market cache in localStorage with LIVE, CACHE, and STALE status.
- Personal watchlist stored in localStorage.
- BTC Treasury mode with portfolio allocation and simple risk score.
- DCA BTC planning panel.
- Snapshot history and decision journal.
- Export/import JSON backup.
- PWA shell with offline UI and cached market fallback.

## Run Local

Use a local HTTP server so ES modules and service worker behavior work correctly:

```bash
python -m http.server 3000
```

Then open:

```text
http://127.0.0.1:3000/
```

## Deploy Vercel

1. Upload the project folder to GitHub or import it directly in Vercel.
2. Choose static project settings.
3. No build command is required.
4. Output directory can stay as project root.
5. Deploy.

## Test

```bash
node --check app.js
node --check data/coin-map.js
node --check src/api.js
node --check src/cache.js
node --check src/signal.js
node --check src/storage.js
node --check src/ui.js
node --check service-worker.js
```

Manual checks:

- Open local app over HTTP.
- Test BTC, ETH, SOL, ATOM, OKB, SHIB, PEPE, and invalid token.
- Add, remove, and reset watchlist.
- Save portfolio, refresh page, verify data remains.
- Save snapshot and journal entry.
- Export JSON, import valid JSON, reject invalid JSON.
- Test mobile responsive layout.
- Test offline shell through browser DevTools when available.

## Folder Structure

```text
index.html
style.css
app.js
manifest.json
service-worker.js
icons/
data/
src/
docs/
release/
```

## Data Storage

All personal data is stored only in browser localStorage:

- `vccp.watchlist`
- `vccp.portfolio`
- `vccp.snapshots`
- `vccp.journal`
- `vccp.market.*`

localStorage can be lost if the user clears browser data. Use Export JSON for backup.
