-- Add sequential badge number per event
ALTER TABLE "Badge" ADD COLUMN "badgeNumber" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing badges with sequential numbers per event
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "eventId" ORDER BY "createdAt") AS rn
  FROM "Badge"
)
UPDATE "Badge" SET "badgeNumber" = ranked.rn
FROM ranked WHERE "Badge".id = ranked.id;
