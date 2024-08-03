-- AlterTable
ALTER TABLE "Subscriber" ADD COLUMN "name" TEXT;

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contact" TEXT,
    "content" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
