-- Popup banners: creates the Popup table and connects its display images to Media.

CREATE TABLE "Popup" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "link" TEXT NOT NULL DEFAULT '',
    "landscapeMediaId" INTEGER,
    "portraitMediaId" INTEGER,
    "scheduleEnabled" BOOLEAN NOT NULL DEFAULT false,
    "scheduledOpeningTime" TIMESTAMP(3),
    "scheduledClosingTime" TIMESTAMP(3),
    "audience" TEXT NOT NULL DEFAULT 'ALL',
    "pageRule" TEXT NOT NULL DEFAULT 'ALL',
    "includePaths" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "animation" TEXT NOT NULL DEFAULT 'FADE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Foreign keys to Media (SetNull on delete to keep the popup).
ALTER TABLE "Popup"
    ADD CONSTRAINT "Popup_landscapeMediaId_fkey"
    FOREIGN KEY ("landscapeMediaId") REFERENCES "Media" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Popup"
    ADD CONSTRAINT "Popup_portraitMediaId_fkey"
    FOREIGN KEY ("portraitMediaId") REFERENCES "Media" ("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes matching @@index([landscapeMediaId]), @@index([portraitMediaId])
-- and @@index([active, scheduleEnabled]).
CREATE INDEX "Popup_landscapeMediaId_idx" ON "Popup" ("landscapeMediaId");
CREATE INDEX "Popup_portraitMediaId_idx" ON "Popup" ("portraitMediaId");
CREATE INDEX "Popup_active_scheduleEnabled_idx" ON "Popup" ("active", "scheduleEnabled");