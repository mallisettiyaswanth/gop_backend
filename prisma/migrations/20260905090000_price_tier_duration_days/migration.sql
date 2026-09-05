-- Attach a durationDays to every price tier so a purchase can drive an
-- automatic membership expiry (needed by the upcoming attendance module).
-- No column change: price_tiers stays JSONB. Existing tiers are backfilled
-- from their label using the same mapping the earlier redesign derived
-- them from (Monthly/Yearly/Daily); anything with an unrecognized label
-- defaults to 30 days so nothing is left null.

UPDATE "membership_plans"
SET "price_tiers" = (
  SELECT jsonb_agg(
    elem || jsonb_build_object(
      'durationDays',
      CASE elem->>'label'
        WHEN 'Daily' THEN 1
        WHEN 'Weekly' THEN 7
        WHEN 'Monthly' THEN 30
        WHEN 'Quarterly' THEN 90
        WHEN '3 Months' THEN 90
        WHEN 'Half Yearly' THEN 182
        WHEN 'Yearly' THEN 365
        WHEN 'Annual' THEN 365
        ELSE 30
      END
    )
  )
  FROM jsonb_array_elements("price_tiers") elem
)
WHERE jsonb_array_length("price_tiers") > 0;
