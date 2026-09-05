-- Lets a plan carry a highlight color so its members can be spotted at a
-- glance in the members table (e.g. all PT members tinted the same color).
ALTER TABLE "membership_plans" ADD COLUMN "color" TEXT;
