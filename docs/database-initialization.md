# Production database initialization
Do not execute until the founder approves the exchange rate and markup. The values below are examples, not live rates.
1. In Cloudflare D1 select slickk-domains-db (binding DB). Confirm the UUID against wrangler.jsonc.
2. Back up existing data if present. Run migrations/0001_initial.sql in the D1 console.
3. Verify with SELECT name FROM sqlite_master WHERE type='table' AND name IN ('orders','pricing_settings');
4. After approval, insert the policy using the following example (125 BDT/USD, 25% markup):
```sql
INSERT INTO pricing_settings(id,bdt_per_usd_minor,markup_bps) VALUES (1,12500,2500) ON CONFLICT(id) DO NOTHING;
SELECT id,bdt_per_usd_minor,markup_bps FROM pricing_settings WHERE id=1;
```
Existing policy is deliberately not overwritten. Confirm actual values before launch. Fees and taxes are not included in this database policy. Do not enable checkout. Standard quotes are estimates, not premium or binding purchase prices.
