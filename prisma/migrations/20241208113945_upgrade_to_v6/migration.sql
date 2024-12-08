-- AlterTable
ALTER TABLE "_CategoryToEvent" ADD CONSTRAINT "_CategoryToEvent_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CategoryToEvent_AB_unique";
