-- AlterTable
ALTER TABLE "Event" DROP COLUMN "country",
ADD COLUMN "region" TEXT NOT NULL DEFAULT '';
