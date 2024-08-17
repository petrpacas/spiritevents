-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "linkLocation" SET NOT NULL,
ALTER COLUMN "linkWebsite" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "contact" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "Subscriber" ALTER COLUMN "name" SET NOT NULL;
