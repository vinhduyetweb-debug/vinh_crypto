# Handover - Vinh Crypto Control Panel V6.0

## What The App Does

Vinh Crypto Control Panel is a static browser app for public crypto market tracking, personal watchlist management, BTC treasury planning, snapshots, and decision journal.

## Important Files

- `index.html`: app shell and UI structure.
- `style.css`: dark fintech responsive UI.
- `app.js`: app orchestration and event binding.
- `data/coin-map.js`: supported symbols and CoinGecko IDs.
- `src/api.js`: public API calls.
- `src/cache.js`: local market cache with 180 second TTL.
- `src/storage.js`: localStorage persistence and backup import/export shape.
- `src/signal.js`: safe signal, treasury risk, and DCA calculations.
- `src/ui.js`: DOM rendering helpers.
- `manifest.json` and `service-worker.js`: PWA/offline shell.

## Where Data Is Stored

Browser localStorage only:

- Watchlist: `vccp.watchlist`
- Portfolio: `vccp.portfolio`
- Snapshots: `vccp.snapshots`
- Journal: `vccp.journal`
- Market cache: `vccp.market.SYMBOL`

## Backup And Restore

Use Export JSON in the Snapshot & Journal tab. Import JSON validates the app name and required structures before writing localStorage.

## Remaining Risks

- Public APIs can rate limit or change response shape.
- Offline mode only uses cached data.
- localStorage can be deleted by browser cleanup.
- No cloud sync exists.
- Service worker requires HTTP localhost or HTTPS.

## Roadmap After V6.0

1. Add user-defined custom CoinGecko ID mapping.
2. Add optional CSV export for snapshots.
3. Add simple allocation target comparison.
4. Add better accessibility focus states.
5. Add Playwright regression tests if the project later adopts dev tooling.
