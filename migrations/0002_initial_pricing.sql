-- Founder-approved initial policy. Preserve existing settings.
INSERT INTO pricing_settings(id,bdt_per_usd_minor,markup_bps) VALUES (1,12500,1000) ON CONFLICT(id) DO NOTHING;
