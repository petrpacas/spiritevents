-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'SUGGESTED', 'PUBLISHED');

-- DropIndex
DROP INDEX "Event_title_key";

-- AlterTable
ALTER TABLE "Event" RENAME COLUMN "coords" TO "linkMap";
ALTER TABLE "Event" RENAME COLUMN "link" TO "linkWebsite";
ALTER TABLE "Event"
ADD COLUMN "slug" TEXT,
ADD COLUMN "status" "EventStatus" NOT NULL DEFAULT 'PUBLISHED';
