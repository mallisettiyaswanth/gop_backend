-- Replace the fixed daily/monthly/yearly price columns with a flexible
-- price_tiers JSON array ([{ "label": string, "price": number }, ...]) so a
-- plan can carry however many custom-labelled price points a gym actually
-- uses (e.g. "3 Months", "PT Yearly"), not just the three fixed durations.
-- Also add "category" to distinguish plan types (e.g. Personal Training vs
-- General membership).

ALTER TABLE "membership_plans"
  ADD COLUMN "category" TEXT,
  ADD COLUMN "price_tiers" JSONB NOT NULL DEFAULT '[]';

UPDATE "membership_plans"
SET "price_tiers" = COALESCE(
  (
    SELECT jsonb_agg(elem)
    FROM jsonb_array_elements(
      jsonb_build_array(
        CASE WHEN "daily_price" IS NOT NULL THEN jsonb_build_object('label', 'Daily', 'price', "daily_price") END,
        CASE WHEN "monthly_price" IS NOT NULL THEN jsonb_build_object('label', 'Monthly', 'price', "monthly_price") END,
        CASE WHEN "yearly_price" IS NOT NULL THEN jsonb_build_object('label', 'Yearly', 'price', "yearly_price") END
      )
    ) AS elem
    WHERE elem <> 'null'::jsonb
  ),
  '[]'::jsonb
);

ALTER TABLE "membership_plans"
  DROP COLUMN "daily_price",
  DROP COLUMN "monthly_price",
  DROP COLUMN "yearly_price";
