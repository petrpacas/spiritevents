-- DropIndex
DROP INDEX "Event_slug_key";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "linkFbEvent" TEXT NOT NULL DEFAULT '',
ADD COLUMN "linkTickets" TEXT NOT NULL DEFAULT '';
