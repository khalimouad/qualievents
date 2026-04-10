/*
  Warnings:

  - Added the required column `slug` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "endDate" DATETIME,
    "venue" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "heroImage" TEXT,
    "themeColor" TEXT,
    "maxAttendees" INTEGER NOT NULL DEFAULT 500,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("address", "city", "country", "createdAt", "date", "description", "endDate", "heroImage", "id", "isPublished", "latitude", "longitude", "maxAttendees", "title", "updatedAt", "venue") SELECT "address", "city", "country", "createdAt", "date", "description", "endDate", "heroImage", "id", "isPublished", "latitude", "longitude", "maxAttendees", "title", "updatedAt", "venue" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
