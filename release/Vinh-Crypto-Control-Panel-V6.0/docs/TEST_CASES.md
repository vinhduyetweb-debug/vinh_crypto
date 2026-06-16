# Test Cases

## Automated Syntax

- `node --check app.js`
- `node --check data/coin-map.js`
- `node --check src/api.js`
- `node --check src/cache.js`
- `node --check src/signal.js`
- `node --check src/storage.js`
- `node --check src/ui.js`
- `node --check service-worker.js`

## V4.1

- Open BTC detail.
- Open ETH, SOL, ATOM, OKB, SHIB, PEPE.
- Enter invalid token and verify app shows a controlled message.
- Simulate one failed API and verify remaining sections still render.
- Verify LIVE, CACHE, STALE labels.
- Verify manual refresh button works.

## V4.2

- Add token to watchlist.
- Remove token from watchlist.
- Reset watchlist to default.
- Refresh page and verify saved watchlist remains.

## V5.0

- Enter sample portfolio and save.
- Refresh page and verify values remain.
- Reset portfolio.
- Confirm Risk Score is not NaN.
- Calculate DCA with valid BTC price.
- Confirm BTC price failure returns a safe message.

## V5.1

- Save snapshot.
- Save multiple snapshots.
- Export JSON.
- Import valid JSON.
- Import invalid JSON and verify old data remains.
- Create journal entry and refresh page.

## V6.0

- Open app over local HTTP.
- Verify manifest and icon are reachable.
- Verify service worker registers over HTTP localhost or HTTPS.
- Use DevTools offline mode and verify app shell opens.
- Verify offline market data is not shown as LIVE.
- Test mobile viewport.
