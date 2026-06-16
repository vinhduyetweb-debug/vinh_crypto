# User Guide

## Market

Use the watchlist table to inspect tracked assets. Use `Xem chi tiết` for price, ATH/ATL, Fear & Greed, Funding Rate, and signal reasons.

Data status:

- LIVE: freshly loaded from public API.
- CACHE: loaded from localStorage and still inside the 180 second TTL.
- STALE: old localStorage data or offline fallback.

## Watchlist

Add a supported symbol, remove symbols, or reset to default. Watchlist data is saved in localStorage.

## BTC Treasury

Enter manual token amounts and optional exchange exposure. The app estimates total USD, BTC equivalent, allocation, risk score, and a safe action suggestion.

## DCA BTC

Enter total USDT, number of smaller orders, and cycle. The app estimates USDT/order and BTC/order. It never places orders.

## Snapshot & Journal

Use `Lưu snapshot hôm nay` to save current watchlist and portfolio state. Use journal entries to record personal decisions and notes.

## Backup

Use Export JSON regularly. Import JSON validates the backup and asks for confirmation before overwriting current localStorage data.
