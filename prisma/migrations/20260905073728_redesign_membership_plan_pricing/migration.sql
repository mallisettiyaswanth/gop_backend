-- Redesign membership_plans from a single duration/price pair into
-- daily/monthly/yearly price tiers plus level, description, features,
-- and sort_order. Existing rows are backfilled instead of dropped:
--   * duration_days ~ 30  -> monthly_price
--   * duration_days ~ 365 -> yearly_price
--   * anything else       -> daily_price, derived as price / duration_days

ALTER TABLE "membership_plans"
  ADD COLUMN "level" TEXT,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "daily_price" DECIMAL(10,2),
  ADD COLUMN "monthly_price" DECIMAL(10,2),
  ADD COLUMN "yearly_price" DECIMAL(10,2),
  ADD COLUMN "features" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0;

UPDATE "membership_plans"
SET "monthly_price" = "price"
WHERE "duration_days" BETWEEN 28 AND 31;

UPDATE "membership_plans"
SET "yearly_price" = "price"
WHERE "duration_days" BETWEEN 360 AND 370;

UPDATE "membership_plans"
SET "daily_price" = ROUND("price" / "duration_days", 2)
WHERE "monthly_price" IS NULL AND "yearly_price" IS NULL;

ALTER TABLE "membership_plans"
  DROP COLUMN "duration_days",
  DROP COLUMN "price";
